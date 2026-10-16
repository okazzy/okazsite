/**
 * Read-only Firestore access for the server (link previews), via the REST API.
 *
 * SERVER ONLY: never import this from a 'use client' file. Two ways in:
 * - Guest (default, no secret): signs in anonymously with the site's public
 *   Firebase web config (NEXT_PUBLIC_FIREBASE_API_KEY / _PROJECT_ID), like
 *   every visitor does, and reads with that ID token, so the Firestore
 *   security rules apply: it can read only what any visitor can.
 * - Service account (only if FIREBASE_SERVICE_ACCOUNT_JSON is ever set): signs
 *   a JWT with node:crypto and trades it for an OAuth access token.
 * Documents are read with plain fetch, so the Firebase SDKs are not involved.
 *
 * Every failure (no env var, bad key, timeout, HTTP error, bad JSON) returns
 * null: callers fall back to the generic site metadata.
 *
 * Only `node:crypto` is imported so the file can be unit tested in plain Node
 * (see tests/firestoreRest.test.mjs).
 */
import { createSign } from 'node:crypto';

export const SERVICE_ACCOUNT_ENV = 'FIREBASE_SERVICE_ACCOUNT_JSON';
export const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const FIRESTORE_API = 'https://firestore.googleapis.com/v1';
export const API_KEY_ENV = 'NEXT_PUBLIC_FIREBASE_API_KEY';
export const PROJECT_ID_ENV = 'NEXT_PUBLIC_FIREBASE_PROJECT_ID';
const SIGN_UP_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp';
const REFRESH_URL = 'https://securetoken.googleapis.com/v1/token';

/** Per-request timeout. */
export const REQUEST_TIMEOUT_MS = 3000;
/** How long Next.js may serve a cached Firestore response (seconds). */
export const FIRESTORE_REVALIDATE_SECONDS = 3600;
/** Lifetime requested for the signed JWT (Google's maximum). */
const JWT_LIFETIME_SECONDS = 3600;
/** Refresh the cached access token this long before it expires. */
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

export interface ServiceAccount {
  client_email: string;
  private_key: string;
  private_key_id?: string;
  project_id: string;
  token_uri: string;
}

/** A decoded Firestore document: `id` is the last path segment. */
export interface FirestoreDoc {
  id: string;
  data: Record<string, unknown>;
}

/** What the metadata code needs from Firestore (faked in tests). */
export interface FirestoreReader {
  getDocument(segments: string[]): Promise<FirestoreDoc | null>;
  /** First document of `parentSegments/collectionId` whose string `field` equals `value`. */
  findOneByField(
    parentSegments: string[],
    collectionId: string,
    field: string,
    value: string
  ): Promise<FirestoreDoc | null>;
}

type FetchInit = RequestInit & { next?: { revalidate?: number | false } };
export type FetchLike = (url: string, init?: FetchInit) => Promise<Response>;

export interface ReaderOptions {
  /** Defaults to process.env. */
  env?: Record<string, string | undefined>;
  /** Defaults to the global (Next.js-extended) fetch. */
  fetchImpl?: FetchLike;
  /** Milliseconds since epoch; defaults to Date.now. */
  now?: () => number;
}

/* ------------------------------------------------------------------ */
/*  Service account key                                               */
/* ------------------------------------------------------------------ */

/** The service account from its JSON key text, or null when missing or unusable. */
export function parseServiceAccount(json: string | undefined): ServiceAccount | null {
  if (!json || !json.trim()) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const key = raw as Record<string, unknown>;
  const str = (name: string) =>
    typeof key[name] === 'string' && (key[name] as string).trim() ? (key[name] as string).trim() : '';

  const clientEmail = str('client_email');
  // A key pasted with escaped newlines ("\\n") still works.
  const privateKey = str('private_key').replace(/\\n/g, '\n');
  const projectId = str('project_id');
  const tokenUri = str('token_uri') || DEFAULT_TOKEN_URI;
  if (!clientEmail || !privateKey.includes('PRIVATE KEY') || !projectId) return null;
  if (!tokenUri.startsWith('https://')) return null;

  return {
    client_email: clientEmail,
    private_key: privateKey,
    private_key_id: str('private_key_id') || undefined,
    project_id: projectId,
    token_uri: tokenUri,
  };
}

/* ------------------------------------------------------------------ */
/*  OAuth access token (JWT bearer grant)                             */
/* ------------------------------------------------------------------ */

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

/** The signed RS256 JWT exchanged for an access token. `nowSeconds` is the issue time. */
export function createJwtAssertion(sa: ServiceAccount, nowSeconds: number): string {
  const header: Record<string, string> = { alg: 'RS256', typ: 'JWT' };
  if (sa.private_key_id) header.kid = sa.private_key_id;
  const claims = {
    iss: sa.client_email,
    scope: FIRESTORE_SCOPE,
    aud: sa.token_uri,
    iat: nowSeconds,
    exp: nowSeconds + JWT_LIFETIME_SECONDS,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key);
  return `${unsigned}.${base64url(signature)}`;
}

let cachedToken: { owner: string; token: string; expiresAt: number } | null = null;
let pendingToken: { owner: string; promise: Promise<string | null> } | null = null;

/** Forget the cached access token (tests only). */
export function resetAccessTokenCache(): void {
  cachedToken = null;
  pendingToken = null;
}

/** An access token for `sa`, cached in memory until shortly before it expires; null on any failure. */
export async function getAccessToken(
  sa: ServiceAccount,
  fetchImpl: FetchLike = fetch,
  now: () => number = Date.now
): Promise<string | null> {
  const owner = `${sa.client_email}|${sa.private_key_id ?? ''}`;
  if (cachedToken && cachedToken.owner === owner && now() < cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS) {
    return cachedToken.token;
  }
  // Concurrent requests share one token request.
  if (pendingToken && pendingToken.owner === owner) return pendingToken.promise;

  const promise = (async () => {
    try {
      const assertion = createJwtAssertion(sa, Math.floor(now() / 1000));
      const res = await fetchImpl(sa.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion,
        }).toString(),
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { access_token?: unknown; expires_in?: unknown };
      if (typeof body.access_token !== 'string' || !body.access_token) return null;
      const expiresIn = Number(body.expires_in) > 0 ? Number(body.expires_in) : JWT_LIFETIME_SECONDS;
      cachedToken = { owner, token: body.access_token, expiresAt: now() + expiresIn * 1000 };
      return body.access_token;
    } catch {
      return null;
    } finally {
      pendingToken = null;
    }
  })();
  pendingToken = { owner, promise };
  return promise;
}

/* ------------------------------------------------------------------ */
/*  Guest (anonymous) ID token                                         */
/* ------------------------------------------------------------------ */

let guestSession: { owner: string; idToken: string; refreshToken: string; expiresAt: number } | null = null;
let pendingGuest: { owner: string; promise: Promise<string | null> } | null = null;

/** Forget the cached guest session (tests only). */
export function resetGuestSessionCache(): void {
  guestSession = null;
  pendingGuest = null;
}

/**
 * A Firebase ID token of an anonymous user, cached in memory: renewed with its
 * refresh token (no new user) and only signed up again when that fails, so one
 * server instance creates one anonymous user. `referer` is sent because the
 * public web API key may be limited to the site's own pages.
 */
export async function getGuestIdToken(
  apiKey: string,
  referer: string,
  fetchImpl: FetchLike = fetch,
  now: () => number = Date.now
): Promise<string | null> {
  const owner = apiKey;
  if (guestSession && guestSession.owner === owner && now() < guestSession.expiresAt - TOKEN_REFRESH_MARGIN_MS) {
    return guestSession.idToken;
  }
  if (pendingGuest && pendingGuest.owner === owner) return pendingGuest.promise;

  const post = (url: string, body: string, type: string) =>
    fetchImpl(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': type, Referer: referer },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

  const promise = (async () => {
    try {
      // 1. renew the existing guest, so no new user is created
      if (guestSession && guestSession.owner === owner) {
        const res = await post(
          REFRESH_URL,
          new URLSearchParams({ grant_type: 'refresh_token', refresh_token: guestSession.refreshToken }).toString(),
          'application/x-www-form-urlencoded'
        );
        if (res.ok) {
          const b = (await res.json()) as { id_token?: unknown; refresh_token?: unknown; expires_in?: unknown };
          if (typeof b.id_token === 'string' && b.id_token) {
            guestSession = {
              owner,
              idToken: b.id_token,
              refreshToken: typeof b.refresh_token === 'string' && b.refresh_token ? b.refresh_token : guestSession.refreshToken,
              expiresAt: now() + (Number(b.expires_in) > 0 ? Number(b.expires_in) : 3600) * 1000,
            };
            return guestSession.idToken;
          }
        }
      }
      // 2. sign up a new anonymous user
      const res = await post(SIGN_UP_URL, JSON.stringify({ returnSecureToken: true }), 'application/json');
      if (!res.ok) return null;
      const b = (await res.json()) as { idToken?: unknown; refreshToken?: unknown; expiresIn?: unknown };
      if (typeof b.idToken !== 'string' || !b.idToken || typeof b.refreshToken !== 'string') return null;
      guestSession = {
        owner,
        idToken: b.idToken,
        refreshToken: b.refreshToken,
        expiresAt: now() + (Number(b.expiresIn) > 0 ? Number(b.expiresIn) : 3600) * 1000,
      };
      return guestSession.idToken;
    } catch {
      return null;
    } finally {
      pendingGuest = null;
    }
  })();
  pendingGuest = { owner, promise };
  return promise;
}

/* ------------------------------------------------------------------ */
/*  REST value decoding                                               */
/* ------------------------------------------------------------------ */

/** A Firestore REST `Value` (https://firebase.google.com/docs/firestore/reference/rest/v1/Value) as plain JS. */
export function decodeValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return Boolean(v.booleanValue);
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('stringValue' in v) return String(v.stringValue);
  if ('timestampValue' in v) return String(v.timestampValue);
  if ('referenceValue' in v) return String(v.referenceValue);
  if ('bytesValue' in v) return String(v.bytesValue);
  if ('geoPointValue' in v) {
    const g = (v.geoPointValue ?? {}) as Record<string, unknown>;
    return { latitude: Number(g.latitude ?? 0), longitude: Number(g.longitude ?? 0) };
  }
  if ('arrayValue' in v) {
    const values = ((v.arrayValue ?? {}) as { values?: unknown[] }).values;
    return Array.isArray(values) ? values.map(decodeValue) : [];
  }
  if ('mapValue' in v) {
    return decodeFields(((v.mapValue ?? {}) as { fields?: unknown }).fields);
  }
  return undefined;
}

/** A REST `fields` object (name -> Value) as a plain object. */
export function decodeFields(fields: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!fields || typeof fields !== 'object') return out;
  for (const [name, value] of Object.entries(fields as Record<string, unknown>)) {
    out[name] = decodeValue(value);
  }
  return out;
}

/** A REST `Document` ({ name, fields }) as { id, data }, or null when malformed. */
export function decodeDocument(doc: unknown): FirestoreDoc | null {
  if (!doc || typeof doc !== 'object') return null;
  const { name, fields } = doc as { name?: unknown; fields?: unknown };
  if (typeof name !== 'string' || !name) return null;
  return { id: name.slice(name.lastIndexOf('/') + 1), data: decodeFields(fields) };
}

/* ------------------------------------------------------------------ */
/*  Requests                                                          */
/* ------------------------------------------------------------------ */

/** Firestore document/collection ids: non-empty, no '/', not '.', '..' or __reserved__. */
export function isValidPathSegment(segment: unknown): segment is string {
  return (
    typeof segment === 'string' &&
    segment.length > 0 &&
    segment.length <= 1500 &&
    !segment.includes('/') &&
    segment !== '.' &&
    segment !== '..' &&
    !/^__.*__$/.test(segment)
  );
}

function documentsUrl(projectId: string, segments: string[]): string {
  const path = segments.map(encodeURIComponent).join('/');
  return `${FIRESTORE_API}/projects/${encodeURIComponent(projectId)}/databases/(default)/documents${path ? `/${path}` : ''}`;
}

/**
 * A FirestoreReader backed by the REST API: with the service account when
 * FIREBASE_SERVICE_ACCOUNT_JSON is set, else as an anonymous guest with the
 * public web config; null when neither is available.
 */
export function createFirestoreReader(options: ReaderOptions = {}): FirestoreReader | null {
  const env = options.env ?? process.env;
  const fetchImpl: FetchLike = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const sa = parseServiceAccount(env[SERVICE_ACCOUNT_ENV]);
  const apiKey = env[API_KEY_ENV]?.trim();
  const projectId = sa?.project_id ?? env[PROJECT_ID_ENV]?.trim();
  if (!projectId || (!sa && !apiKey)) return null;
  const referer = `${(env.NEXT_PUBLIC_APP_URL || 'https://www.okaz.io').replace(/\/$/, '')}/`;
  const getToken = sa
    ? () => getAccessToken(sa, fetchImpl, now)
    : () => getGuestIdToken(apiKey!, referer, fetchImpl, now);

  async function request(url: string, init: FetchInit): Promise<unknown | null> {
    try {
      const token = await getToken();
      if (!token) return null;
      const res = await fetchImpl(url, {
        ...init,
        headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${token}` },
        next: { revalidate: FIRESTORE_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  return {
    async getDocument(segments) {
      if (segments.length === 0 || segments.length % 2 !== 0 || !segments.every(isValidPathSegment)) return null;
      return decodeDocument(await request(documentsUrl(projectId, segments), { method: 'GET' }));
    },

    async findOneByField(parentSegments, collectionId, field, value) {
      if (
        parentSegments.length % 2 !== 0 ||
        !parentSegments.every(isValidPathSegment) ||
        !isValidPathSegment(collectionId) ||
        !value
      ) {
        return null;
      }
      const body = await request(`${documentsUrl(projectId, parentSegments)}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId }],
            where: {
              fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } },
            },
            limit: 1,
          },
        }),
      });
      // runQuery answers with an array of { document?, readTime }.
      if (!Array.isArray(body)) return null;
      for (const row of body) {
        const doc = decodeDocument((row as { document?: unknown })?.document);
        if (doc) return doc;
      }
      return null;
    },
  };
}
