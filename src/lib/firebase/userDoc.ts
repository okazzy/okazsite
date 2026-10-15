/**
 * Decides what the web app may write to `users/{uid}`.
 *
 * The same Firebase project and user documents are shared with the mobile app,
 * so an existing document (favorites, premium flag, streaks, ...) belongs to the
 * app and must never be reset by a web sign-in. This module has no Firebase
 * imports so it can be unit tested in plain Node (see tests/userDoc.test.mjs).
 */

export interface ProfileFields {
  email?: string;
  displayName?: string;
  photoUrl?: string;
}

export interface SignInOptions extends ProfileFields {
  isGuest: boolean;
}

export type UserDocWrite =
  | { kind: 'create'; data: Record<string, unknown> }
  | { kind: 'update'; data: Record<string, unknown> }
  | { kind: 'none' };

const PROFILE_KEYS = ['email', 'displayName', 'photoUrl'] as const;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * - No document yet: create it with defaults.
 * - Document exists: only fill profile fields that are still empty, and clear
 *   `isGuest` when a real (non-anonymous) sign-in happens. Nothing else is ever
 *   written, in particular never `favorites`, `favoriteVideos`, `isPremium`,
 *   `dailyPlays` or `lastPlayedDate`, and never `isGuest: true`.
 *
 * `now` is the value to store as `lastPlayedDate` on creation (a Firestore
 * Timestamp in production, injected so this stays Firebase-free).
 */
export function planUserDocWrite(
  existing: Record<string, unknown> | undefined,
  uid: string,
  options: SignInOptions,
  now: unknown
): UserDocWrite {
  if (existing === undefined) {
    // Firestore does not accept undefined values: only include defined fields.
    const data: Record<string, unknown> = {
      uid,
      isPremium: false,
      isGuest: options.isGuest,
      favorites: [],
      favoriteVideos: [],
      dailyPlays: 0,
      lastPlayedDate: now,
    };
    for (const key of PROFILE_KEYS) {
      if (options[key]) data[key] = options[key];
    }
    return { kind: 'create', data };
  }

  const data: Record<string, unknown> = {};
  for (const key of PROFILE_KEYS) {
    if (options[key] && isBlank(existing[key])) data[key] = options[key];
  }
  if (options.isGuest === false && existing.isGuest === true) {
    data.isGuest = false;
  }
  return Object.keys(data).length > 0 ? { kind: 'update', data } : { kind: 'none' };
}

/**
 * Guest plays that count against today's limit: the stored count, or 0 when
 * the last play was on an earlier (local) day. Used both to check the limit and
 * to compute the next count, so the two always agree on when a day starts.
 */
export function playsToday(
  current: number | undefined,
  lastPlayed: Date | undefined,
  now: Date
): number {
  const plays = current ?? 0;
  if (lastPlayed) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(
      lastPlayed.getFullYear(),
      lastPlayed.getMonth(),
      lastPlayed.getDate()
    );
    if (lastDay.getTime() < today.getTime()) return 0;
  }
  return plays;
}

/** Next guest play count: resets when the last play was on an earlier day. */
export function nextDailyPlays(
  current: number | undefined,
  lastPlayed: Date | undefined,
  now: Date
): number {
  return playsToday(current, lastPlayed, now) + 1;
}
