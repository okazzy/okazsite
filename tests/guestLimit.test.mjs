// Run with: npm test   (plain Node, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { playsToday, nextDailyPlays } from '../src/lib/firebase/userDoc.ts';

const LIMIT = 3;
// Same decision AuthContext.checkGuestLimit makes before allowing a play.
const blocked = (current, lastPlayed, now) => playsToday(current, lastPlayed, now) >= LIMIT;

test('plays today: no history counts as 0, same day keeps the stored count', () => {
  const now = new Date(2026, 9, 15, 15, 0);
  assert.equal(playsToday(undefined, undefined, now), 0);
  assert.equal(playsToday(2, undefined, now), 2);
  assert.equal(playsToday(3, new Date(2026, 9, 15, 0, 0), now), 3);
  assert.equal(playsToday(3, new Date(2026, 9, 15, 14, 59), now), 3);
});

test('plays today: a play on any earlier day counts as 0', () => {
  const now = new Date(2026, 9, 15, 0, 1);
  assert.equal(playsToday(3, new Date(2026, 9, 14, 23, 59), now), 0);
  assert.equal(playsToday(7, new Date(2026, 8, 1, 12, 0), now), 0);
  assert.equal(playsToday(3, new Date(2025, 11, 31, 23, 59), new Date(2026, 0, 1, 0, 0)), 0);
});

test('guest who hit the limit yesterday can play again today', () => {
  const yesterday = new Date(2026, 9, 14, 20, 0);
  assert.equal(blocked(LIMIT, yesterday, new Date(2026, 9, 14, 21, 0)), true);
  assert.equal(blocked(LIMIT, yesterday, new Date(2026, 9, 15, 9, 0)), false);
  assert.equal(blocked(LIMIT, yesterday, new Date(2026, 9, 20, 9, 0)), false);
  // Same-day limit is still enforced.
  assert.equal(blocked(LIMIT, new Date(2026, 9, 15, 8, 0), new Date(2026, 9, 15, 9, 0)), true);
  assert.equal(blocked(LIMIT - 1, new Date(2026, 9, 15, 8, 0), new Date(2026, 9, 15, 9, 0)), false);
});

test('randomized: the limit check and the stored increment agree on the day', () => {
  const base = new Date(2026, 9, 15, 12, 0).getTime();
  const span = 5 * 24 * 60 * 60 * 1000;
  for (let i = 0; i < 2000; i++) {
    const now = new Date(base + Math.floor(Math.random() * span));
    const lastPlayed =
      Math.random() < 0.1 ? undefined : new Date(now.getTime() - Math.floor(Math.random() * span));
    const current = Math.random() < 0.1 ? undefined : Math.floor(Math.random() * 6);
    assert.equal(
      nextDailyPlays(current, lastPlayed, now),
      playsToday(current, lastPlayed, now) + 1
    );
  }
});
