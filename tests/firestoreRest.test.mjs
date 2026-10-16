// Run with: npm test   (plain Node, no extra dependencies, no network: fetch is faked)
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import {
  FIRESTORE_SCOPE,
  FIRESTORE_REVALIDATE_SECONDS,
  SERVICE_ACCOUNT_ENV,
  createFirestoreReader,
  createJwtAssertion,
  decodeDocument,
  decodeFields,
  decodeValue,
  isValidPathSegment,
  parseServiceAccount,
  resetAccessTokenCache,
  resetGuestSessionCache,
  API_KEY_ENV,
  PROJECT_ID_ENV,
} from '../src/lib/server/firestoreRest.ts';

// Throwaway key generated for the test run (never a real credential).
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const PRIVATE_PEM = privateKey.export({ type: 'pkcs8', format: 'pem' });
const KEY = {
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'kid123',
  private_key: PRIVATE_PEM,
  client_email: 'viewer@test-project.iam.gserviceaccount.com',
  token_uri: 'https://oauth2.example.test/token',
};
const ENV = { [SERVICE_ACCOUNT_ENV]: JSON.stringify(KEY) };
const DOCS = 'https://firestore.googleapis.com/v1/projects/test-project/databases/(default)/documents';

const decodePart = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

/** A fake fetch: `routes(url, init)` returns { status, body }; every call is recorded. */
function fakeFetch(routes) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, init });
    const { status = 200, body = {} } = (await routes(url, init)) ?? { status: 404 };
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  fn.calls = calls;
  return fn;
}

const tokenRoute = (url) =>
  url === KEY.token_uri ? { body: { access_token: 'tok-1', expires_in: 3600, token_type: 'Bearer' } } : null;

test.beforeEach(() => {
  resetAccessTokenCache();
  resetGuestSessionCache();
});

test('decodeValue turns typed REST values into plain JS', () => {
  assert.equal(decodeValue({ stringValue: 'hi' }), 'hi');
  assert.equal(decodeValue({ booleanValue: true }), true);
  assert.equal(decodeValue({ booleanValue: false }), false);
  assert.equal(decodeValue({ integerValue: '42' }), 42);
  assert.equal(decodeValue({ doubleValue: 1.5 }), 1.5);
  assert.equal(decodeValue({ nullValue: null }), null);
  assert.equal(decodeValue({ timestampValue: '2026-10-16T00:00:00Z' }), '2026-10-16T00:00:00Z');
  assert.equal(decodeValue({ referenceValue: 'projects/p/databases/(default)/documents/a/b' }), 'projects/p/databases/(default)/documents/a/b');
  assert.deepEqual(decodeValue({ geoPointValue: { latitude: 1, longitude: 2 } }), { latitude: 1, longitude: 2 });
  assert.deepEqual(decodeValue({ arrayValue: { values: [{ stringValue: 'a' }, { integerValue: '2' }] } }), ['a', 2]);
  assert.deepEqual(decodeValue({ arrayValue: {} }), []);
  assert.deepEqual(decodeValue({ mapValue: {} }), {});
  assert.equal(decodeValue({ somethingNew: 1 }), undefined);
  assert.equal(decodeValue(null), undefined);
});

test('decodeFields and decodeDocument handle nested maps and the document id', () => {
  const fields = {
    title: { mapValue: { fields: { ar: { stringValue: 'عنوان' }, en: { stringValue: 'Title' } } } },
    hide: { booleanValue: false },
    orderId: { integerValue: '3' },
    tags: { arrayValue: { values: [{ mapValue: { fields: { k: { stringValue: 'v' } } } }] } },
  };
  assert.deepEqual(decodeFields(fields), {
    title: { ar: 'عنوان', en: 'Title' },
    hide: false,
    orderId: 3,
    tags: [{ k: 'v' }],
  });
  assert.deepEqual(decodeFields(undefined), {});
  assert.deepEqual(decodeDocument({ name: 'projects/p/databases/(default)/documents/c/sub/videos/abc', fields }).id, 'abc');
  assert.deepEqual(decodeDocument({ name: 'projects/p/databases/(default)/documents/c/x' }), { id: 'x', data: {} });
  assert.equal(decodeDocument({ fields }), null);
  assert.equal(decodeDocument(null), null);
});

test('parseServiceAccount accepts a JSON key and rejects missing or broken ones', () => {
  const sa = parseServiceAccount(JSON.stringify(KEY));
  assert.equal(sa.client_email, KEY.client_email);
  assert.equal(sa.project_id, 'test-project');
  assert.equal(sa.token_uri, KEY.token_uri);
  assert.equal(sa.private_key_id, 'kid123');

  // token_uri defaults to Google's; escaped newlines in a pasted key are repaired.
  const pasted = { ...KEY, token_uri: undefined, private_key: PRIVATE_PEM.replace(/\n/g, '\\n') };
  const sa2 = parseServiceAccount(JSON.stringify(pasted));
  assert.equal(sa2.token_uri, 'https://oauth2.googleapis.com/token');
  assert.equal(sa2.private_key, PRIVATE_PEM);

  for (const bad of [undefined, '', '   ', 'not json', '"string"', 'null', '{}',
    JSON.stringify({ ...KEY, client_email: '' }),
    JSON.stringify({ ...KEY, project_id: undefined }),
    JSON.stringify({ ...KEY, private_key: 'nope' }),
    JSON.stringify({ ...KEY, token_uri: 'http://insecure.test/token' })]) {
    assert.equal(parseServiceAccount(bad), null, String(bad));
  }
});

test('JWT assertion: RS256 header, Google claims, valid signature', () => {
  const sa = parseServiceAccount(JSON.stringify(KEY));
  const jwt = createJwtAssertion(sa, 1_800_000_000);
  const [h, c, s] = jwt.split('.');
  assert.deepEqual(decodePart(h), { alg: 'RS256', typ: 'JWT', kid: 'kid123' });
  assert.deepEqual(decodePart(c), {
    iss: KEY.client_email,
    scope: FIRESTORE_SCOPE,
    aud: KEY.token_uri,
    iat: 1_800_000_000,
    exp: 1_800_003_600,
  });
  assert.equal(FIRESTORE_SCOPE, 'https://www.googleapis.com/auth/datastore');
  const ok = createVerify('RSA-SHA256').update(`${h}.${c}`).verify(publicKey, Buffer.from(s, 'base64url'));
  assert.equal(ok, true);
});

test('no Firebase config (and no usable key) means no reader and no requests', () => {
  assert.equal(createFirestoreReader({ env: {} }), null);
  assert.equal(createFirestoreReader({ env: { [SERVICE_ACCOUNT_ENV]: 'garbage' } }), null);
  assert.equal(createFirestoreReader({ env: { [API_KEY_ENV]: 'k' } }), null, 'needs the project id too');
});

const GUEST_ENV = { [API_KEY_ENV]: 'public-web-key', [PROJECT_ID_ENV]: 'okaz-test-project', NEXT_PUBLIC_APP_URL: 'https://www.okaz.io' };
const DOC = { name: 'projects/p/databases/(default)/documents/a/b', fields: { title: { stringValue: 'T' } } };

test('guest: signs in anonymously once, reads with the ID token, and renews without a new user', async () => {
  let now = 1_000_000;
  let refreshes = 0;
  const fetchImpl = fakeFetch((url, init) => {
    if (url.startsWith('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=public-web-key')) {
      assert.equal(init.method, 'POST');
      assert.deepEqual(JSON.parse(init.body), { returnSecureToken: true });
      assert.equal(init.headers.Referer, 'https://www.okaz.io/');
      assert.equal(init.cache, 'no-store');
      return { body: { idToken: 'id-1', refreshToken: 'r-1', expiresIn: '3600' } };
    }
    if (url.startsWith('https://securetoken.googleapis.com/v1/token?key=public-web-key')) {
      refreshes++;
      assert.match(init.body, /grant_type=refresh_token&refresh_token=r-1/);
      return { body: { id_token: 'id-2', refresh_token: 'r-2', expires_in: '3600' } };
    }
    if (url.startsWith('https://firestore.googleapis.com/v1/projects/okaz-test-project/')) {
      assert.match(init.headers.Authorization, /^Bearer id-[12]$/);
      return { body: DOC };
    }
    return null;
  });
  const reader = createFirestoreReader({ env: GUEST_ENV, fetchImpl, now: () => now });
  assert.equal((await reader.getDocument(['a', 'b'])).data.title, 'T');
  assert.equal((await reader.getDocument(['a', 'b'])).data.title, 'T');
  const signUps = () => fetchImpl.calls.filter((c) => c.url.includes('accounts:signUp')).length;
  assert.equal(signUps(), 1, 'the cached ID token is reused');

  now += 3600 * 1000; // token expired: renewed with the refresh token, no new anonymous user
  await reader.getDocument(['a', 'b']);
  assert.equal(signUps(), 1);
  assert.equal(refreshes, 1);
  assert.equal(fetchImpl.calls.at(-1).init.headers.Authorization, 'Bearer id-2');
});

test('guest: a failed renewal signs up again; a failed sign-up gives null', async () => {
  let now = 0;
  let signUpOk = true;
  const fetchImpl = fakeFetch((url) => {
    if (url.includes('accounts:signUp')) {
      return signUpOk ? { body: { idToken: 'id-x', refreshToken: 'r-x', expiresIn: '3600' } } : { status: 400, body: {} };
    }
    if (url.includes('securetoken')) return { status: 400, body: {} };
    if (url.includes('firestore')) return { body: DOC };
    return null;
  });
  const reader = createFirestoreReader({ env: GUEST_ENV, fetchImpl, now: () => now });
  assert.ok(await reader.getDocument(['a', 'b']));
  now += 3600 * 1000;
  assert.ok(await reader.getDocument(['a', 'b']), 'falls back to a new sign-up');
  assert.equal(fetchImpl.calls.filter((c) => c.url.includes('accounts:signUp')).length, 2);

  resetGuestSessionCache();
  signUpOk = false;
  assert.equal(await reader.getDocument(['a', 'b']), null);
});

test('a service account, when set, is used instead of the guest', async () => {
  const fetchImpl = fakeFetch((url) => (url === KEY.token_uri ? tokenRoute(url) : url.includes('firestore') ? { body: DOC } : null));
  const reader = createFirestoreReader({ env: { ...GUEST_ENV, ...ENV }, fetchImpl });
  await reader.getDocument(['a', 'b']);
  assert.equal(fetchImpl.calls.some((c) => c.url.includes('identitytoolkit')), false);
  assert.match(fetchImpl.calls.at(-1).url, /projects\/test-project\//);
});

test('getDocument: token exchange, authorized GET with 1h revalidate, decoded result, token reused', async () => {
  const fetchImpl = fakeFetch((url) => {
    if (url === KEY.token_uri) return tokenRoute(url);
    if (url === `${DOCS}/video_categories/cat1/subcategories/sub1`) {
      return { body: { name: 'projects/test-project/databases/(default)/documents/video_categories/cat1/subcategories/sub1', fields: { title: { mapValue: { fields: { en: { stringValue: 'Sleep' } } } } } } };
    }
    return null;
  });
  const reader = createFirestoreReader({ env: ENV, fetchImpl });
  const doc = await reader.getDocument(['video_categories', 'cat1', 'subcategories', 'sub1']);
  assert.deepEqual(doc, { id: 'sub1', data: { title: { en: 'Sleep' } } });

  const [tokenCall, docCall] = fetchImpl.calls;
  assert.equal(tokenCall.init.method, 'POST');
  assert.equal(tokenCall.init.cache, 'no-store');
  const form = new URLSearchParams(tokenCall.init.body);
  assert.equal(form.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  assert.equal(decodePart(form.get('assertion').split('.')[1]).iss, KEY.client_email);

  assert.equal(docCall.init.method, 'GET');
  assert.equal(docCall.init.headers.Authorization, 'Bearer tok-1');
  assert.deepEqual(docCall.init.next, { revalidate: FIRESTORE_REVALIDATE_SECONDS });
  assert.equal(FIRESTORE_REVALIDATE_SECONDS, 3600);
  assert.ok(docCall.init.signal instanceof AbortSignal);

  // Second read reuses the cached token.
  assert.equal(await reader.getDocument(['video_categories', 'cat1', 'subcategories', 'nope']), null);
  assert.equal(fetchImpl.calls.filter((c) => c.url === KEY.token_uri).length, 1);
});

test('the access token is refreshed shortly before it expires', async () => {
  let now = 1_000_000;
  const fetchImpl = fakeFetch((url) => (url === KEY.token_uri ? tokenRoute(url) : { status: 404 }));
  const reader = createFirestoreReader({ env: ENV, fetchImpl, now: () => now });
  await reader.getDocument(['a', 'b']);
  now += 50 * 60 * 1000; // 50 min: still valid
  await reader.getDocument(['a', 'b']);
  now += 6 * 60 * 1000; // 56 min: inside the 5 min refresh margin
  await reader.getDocument(['a', 'b']);
  assert.equal(fetchImpl.calls.filter((c) => c.url === KEY.token_uri).length, 2);
});

test('failures return null: token refused, HTTP error, bad JSON, network error', async () => {
  const refused = fakeFetch((url) => (url === KEY.token_uri ? { status: 400, body: { error: 'invalid_grant' } } : { body: {} }));
  assert.equal(await createFirestoreReader({ env: ENV, fetchImpl: refused }).getDocument(['a', 'b']), null);
  assert.equal(refused.calls.length, 1, 'no Firestore call without a token');

  resetAccessTokenCache();
  const denied = fakeFetch((url) => (url === KEY.token_uri ? tokenRoute(url) : { status: 403, body: { error: {} } }));
  assert.equal(await createFirestoreReader({ env: ENV, fetchImpl: denied }).getDocument(['a', 'b']), null);

  resetAccessTokenCache();
  const badJson = async (url) =>
    url === KEY.token_uri
      ? new Response(JSON.stringify({ access_token: 't', expires_in: 3600 }))
      : new Response('<html>', { status: 200 });
  assert.equal(await createFirestoreReader({ env: ENV, fetchImpl: badJson }).getDocument(['a', 'b']), null);

  resetAccessTokenCache();
  const offline = async () => {
    throw new TypeError('fetch failed');
  };
  assert.equal(await createFirestoreReader({ env: ENV, fetchImpl: offline }).getDocument(['a', 'b']), null);
  assert.equal(await createFirestoreReader({ env: ENV, fetchImpl: offline }).findOneByField(['a', 'b'], 'c', 'f', 'v'), null);
});

test('invalid path segments are rejected without any request', async () => {
  for (const s of ['', '.', '..', 'a/b', '__x__', 'x'.repeat(1501), null]) assert.equal(isValidPathSegment(s), false, String(s));
  assert.equal(isValidPathSegment('abc-123_ÄØ'), true);
  const fetchImpl = fakeFetch(() => ({ body: {} }));
  const reader = createFirestoreReader({ env: ENV, fetchImpl });
  assert.equal(await reader.getDocument(['video_categories', 'cat1', 'subcategories', 'sub1', 'videos', 'a/b']), null);
  assert.equal(await reader.getDocument(['video_categories']), null);
  assert.equal(await reader.findOneByField(['video_categories', '..'], 'videos', 'videoId', 'v'), null);
  assert.equal(await reader.findOneByField(['a', 'b'], 'videos', 'videoId', ''), null);
  assert.equal(fetchImpl.calls.length, 0);
});

test('findOneByField sends a videoId == v runQuery (limit 1) and decodes the first document', async () => {
  const fetchImpl = fakeFetch((url) => {
    if (url === KEY.token_uri) return tokenRoute(url);
    if (url === `${DOCS}/video_categories/cat1/subcategories/sub1:runQuery`) {
      return {
        body: [
          { readTime: '2026-10-16T00:00:00Z' },
          { document: { name: `projects/test-project/databases/(default)/documents/video_categories/cat1/subcategories/sub1/videos/doc9`, fields: { videoId: { stringValue: 'a b/c' } } }, readTime: 'x' },
        ],
      };
    }
    return null;
  });
  const reader = createFirestoreReader({ env: ENV, fetchImpl });
  const doc = await reader.findOneByField(['video_categories', 'cat1', 'subcategories', 'sub1'], 'videos', 'videoId', 'a b/c');
  assert.deepEqual(doc, { id: 'doc9', data: { videoId: 'a b/c' } });
  const call = fetchImpl.calls[1];
  assert.equal(call.init.method, 'POST');
  assert.deepEqual(call.init.next, { revalidate: 3600 });
  assert.deepEqual(JSON.parse(call.init.body), {
    structuredQuery: {
      from: [{ collectionId: 'videos' }],
      where: { fieldFilter: { field: { fieldPath: 'videoId' }, op: 'EQUAL', value: { stringValue: 'a b/c' } } },
      limit: 1,
    },
  });

  const empty = fakeFetch((url) => (url === KEY.token_uri ? tokenRoute(url) : { body: [{ readTime: 'x' }] }));
  assert.equal(await createFirestoreReader({ env: ENV, fetchImpl: empty }).findOneByField(['a', 'b'], 'videos', 'videoId', 'v'), null);
});

test('document ids are URL-encoded in the request path', async () => {
  const fetchImpl = fakeFetch((url) => (url === KEY.token_uri ? tokenRoute(url) : { status: 404 }));
  await createFirestoreReader({ env: ENV, fetchImpl }).getDocument(['video_categories', 'c 1', 'subcategories', 'é?#']);
  assert.equal(fetchImpl.calls[1].url, `${DOCS}/video_categories/c%201/subcategories/%C3%A9%3F%23`);
});
