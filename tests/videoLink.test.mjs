// Run with: npm test   (plain Node, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_VIDEO_PARAM_LENGTH,
  readVideoParam,
  isWatchSubcategoryPath,
  withVideoParam,
} from '../src/lib/videoLink.ts';

const LIST = 'https://www.okaz.io/ar/watch/cat1/sub1';

test('only /{locale}/watch/{categoryId}/{subcategoryId} is the watch subcategory route', () => {
  assert.equal(isWatchSubcategoryPath('/ar/watch/cat1/sub1'), true);
  assert.equal(isWatchSubcategoryPath('/en/watch/cat1/sub1'), true);
  for (const path of [
    '',
    '/ar',
    '/ar/watch',
    '/ar/watch/cat1',
    '/ar/watch/cat1/sub1/extra',
    '/ar/watch/cat1/sub1/',
    '/ar/listen/cat1/sub1',
    '/watch/cat1/sub1',
    '/ar/blog/watch/cat1',
  ]) {
    assert.equal(isWatchSubcategoryPath(path), false, path);
  }
});

test('readVideoParam accepts a non-empty id up to the max length', () => {
  assert.equal(readVideoParam('abc123'), 'abc123');
  assert.equal(readVideoParam(null), null);
  assert.equal(readVideoParam(''), null);
  assert.equal(readVideoParam('x'.repeat(MAX_VIDEO_PARAM_LENGTH)), 'x'.repeat(MAX_VIDEO_PARAM_LENGTH));
  assert.equal(readVideoParam('x'.repeat(MAX_VIDEO_PARAM_LENGTH + 1)), null);
});

test('withVideoParam keeps a valid v (URL-encoded) and drops a missing or invalid one', () => {
  assert.equal(withVideoParam(LIST, 'abc123'), `${LIST}?v=abc123`);
  assert.equal(withVideoParam(LIST, 'a b&c/d?"<'), `${LIST}?v=a%20b%26c%2Fd%3F%22%3C`);
  assert.equal(withVideoParam(LIST, null), LIST);
  assert.equal(withVideoParam(LIST, ''), LIST);
  assert.equal(withVideoParam(LIST, 'x'.repeat(MAX_VIDEO_PARAM_LENGTH + 1)), LIST);
});
