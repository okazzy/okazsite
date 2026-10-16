// Run with: npm test   (plain Node, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { isVideoLocked } from '../src/lib/videoAccess.ts';

test('free videos are never locked', () => {
  for (const user of [null, undefined, { isPremium: false }, { isPremium: true }, { isGuest: true }]) {
    assert.equal(isVideoLocked({ isPremium: false }, user), false);
    assert.equal(isVideoLocked({}, user), false);
  }
});

test('premium videos are locked for guests and free accounts', () => {
  assert.equal(isVideoLocked({ isPremium: true }, null), true);
  assert.equal(isVideoLocked({ isPremium: true }, undefined), true);
  assert.equal(isVideoLocked({ isPremium: true }, { isPremium: false, isGuest: false }), true);
  assert.equal(isVideoLocked({ isPremium: true }, { isGuest: true }), true);
  // a guest doc must never unlock premium, even if it says isPremium
  assert.equal(isVideoLocked({ isPremium: true }, { isPremium: true, isGuest: true }), true);
});

test('premium videos play for subscribers', () => {
  assert.equal(isVideoLocked({ isPremium: true }, { isPremium: true, isGuest: false }), false);
  assert.equal(isVideoLocked({ isPremium: true }, { isPremium: true }), false);
});
