// Run with: npm test   (plain Node, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { planUserDocWrite, nextDailyPlays } from '../src/lib/firebase/userDoc.ts';

const NOW = { fake: 'timestamp' };
const google = {
  email: 'a@b.com',
  displayName: 'Google Name',
  photoUrl: 'https://img/x.jpg',
  isGuest: false,
};
const PROTECTED = [
  'favorites',
  'favoriteVideos',
  'isPremium',
  'dailyPlays',
  'lastPlayedDate',
  'uid',
  'current_streak_days',
  'user_level',
];

// An existing premium app user with real data.
const appUser = () => ({
  email: 'a@b.com',
  displayName: 'Zack',
  photoUrl: 'https://old/p.jpg',
  isPremium: true,
  isGuest: false,
  favorites: ['t1', 't2'],
  favoriteVideos: ['v1'],
  dailyPlays: 0,
  current_streak_days: 14,
  user_level: 9,
});

test('missing document is created with defaults', () => {
  const plan = planUserDocWrite(undefined, 'u1', google, NOW);
  assert.equal(plan.kind, 'create');
  assert.deepEqual(plan.data, {
    uid: 'u1',
    isPremium: false,
    isGuest: false,
    favorites: [],
    favoriteVideos: [],
    dailyPlays: 0,
    lastPlayedDate: NOW,
    email: 'a@b.com',
    displayName: 'Google Name',
    photoUrl: 'https://img/x.jpg',
  });
});

test('create omits undefined profile fields (Firestore rejects undefined)', () => {
  const plan = planUserDocWrite(undefined, 'u1', { isGuest: true }, NOW);
  assert.equal(plan.kind, 'create');
  for (const v of Object.values(plan.data)) assert.notEqual(v, undefined);
  assert.ok(!('email' in plan.data) && !('displayName' in plan.data));
});

test('existing app user signing in with Google/Apple is left untouched', () => {
  assert.deepEqual(planUserDocWrite(appUser(), 'u1', google, NOW), { kind: 'none' });
});

test('existing user never has favorites, premium, plays or streaks written', () => {
  const plan = planUserDocWrite({ isGuest: true }, 'u1', google, NOW);
  assert.equal(plan.kind, 'update');
  for (const key of PROTECTED) assert.ok(!(key in plan.data), `${key} must not be written`);
});

test('only empty profile fields are filled; existing values are kept', () => {
  const plan = planUserDocWrite({ displayName: 'Mine', isGuest: false }, 'u1', google, NOW);
  assert.deepEqual(plan, {
    kind: 'update',
    data: { email: 'a@b.com', photoUrl: 'https://img/x.jpg' },
  });
});

test('real sign-in clears isGuest; anonymous sign-in never sets it on an existing doc', () => {
  assert.deepEqual(planUserDocWrite({ isGuest: true, email: 'a@b.com', displayName: 'x', photoUrl: 'y' }, 'u1', google, NOW), {
    kind: 'update',
    data: { isGuest: false },
  });
  assert.deepEqual(planUserDocWrite(appUser(), 'u1', { isGuest: true }, NOW), { kind: 'none' });
});

test('randomized: an update can only ever contain email/displayName/photoUrl/isGuest', () => {
  const allowed = new Set(['email', 'displayName', 'photoUrl', 'isGuest']);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  for (let i = 0; i < 2000; i++) {
    const existing = {};
    for (const k of ['email', 'displayName', 'photoUrl']) existing[k] = pick([undefined, '', 'v']);
    existing.isGuest = pick([true, false, undefined]);
    existing.isPremium = pick([true, false]);
    existing.favorites = pick([[], ['a']]);
    const opts = {
      isGuest: pick([true, false]),
      email: pick([undefined, 'e']),
      displayName: pick([undefined, 'n']),
      photoUrl: pick([undefined, 'p']),
    };
    const plan = planUserDocWrite(existing, 'u', opts, NOW);
    assert.notEqual(plan.kind, 'create');
    if (plan.kind === 'update') {
      for (const k of Object.keys(plan.data)) assert.ok(allowed.has(k), `unexpected key ${k}`);
      assert.ok(!(plan.data.isGuest === true), 'must never set isGuest:true on an existing doc');
    }
  }
});

test('daily plays: first play, same day increments, new day resets', () => {
  const now = new Date(2026, 9, 8, 15, 0);
  assert.equal(nextDailyPlays(undefined, undefined, now), 1);
  assert.equal(nextDailyPlays(2, new Date(2026, 9, 8, 9, 0), now), 3);
  assert.equal(nextDailyPlays(5, new Date(2026, 9, 7, 23, 59), now), 1);
});
