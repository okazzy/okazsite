// Run with: npm test   (plain Node, no extra dependencies, no network: Firestore is faked)
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/resolveSrc.mjs'; // resolves '@/...' imports inside src/
const { loadWatchMetadata, buildWatchMetadata, trimDescription, SITE_NAME, MAX_DESCRIPTION_LENGTH } =
  await import('../src/lib/server/watchMetadata.ts');
const { createFirestoreReader, resetAccessTokenCache, SERVICE_ACCOUNT_ENV } =
  await import('../src/lib/server/firestoreRest.ts');
const { generateKeyPairSync } = await import('node:crypto');

const BASE = 'https://www.okaz.io';
const PAGE = `${BASE}/ar/watch/cat1/sub1`;
const SUB_PATH = 'video_categories/cat1/subcategories/sub1';
const IMG_AR = 'https://firebasestorage.googleapis.com/v0/b/x/o/ar.jpg?alt=media';
const IMG_EN = 'https://firebasestorage.googleapis.com/v0/b/x/o/en.jpg?alt=media';
const SUB_IMG = 'https://firebasestorage.googleapis.com/v0/b/x/o/sub.jpg?alt=media';

const SUBCATEGORY = { id: 'sub1', data: { title: { ar: 'النوم', en: 'Sleep' }, imageUrl: SUB_IMG } };
const VIDEO = {
  id: 'vid1',
  data: {
    videoId: 'vid1',
    title: { ar: 'تأمل الصباح', en: 'Morning meditation' },
    description: { ar: 'وصف عربي', en: 'English description' },
    imageUrl: { ar: IMG_AR, en: IMG_EN },
    videoUrl: { ar: 'https://secret/ar.mp4', en: 'https://secret/en.mp4' },
    hide: false,
    isPremium: false,
  },
};

/** A fake FirestoreReader over { 'path/to/doc': doc }; records every call. */
function fakeReader(docs) {
  const calls = [];
  return {
    calls,
    async getDocument(segments) {
      calls.push(['get', segments.join('/')]);
      return docs[segments.join('/')] ?? null;
    },
    async findOneByField(parent, collectionId, field, value) {
      calls.push(['query', `${parent.join('/')}/${collectionId}`, field, value]);
      const prefix = `${parent.join('/')}/${collectionId}/`;
      for (const [path, doc] of Object.entries(docs)) {
        if (path.startsWith(prefix) && !path.slice(prefix.length).includes('/') && doc.data[field] === value) return doc;
      }
      return null;
    },
  };
}

const args = (over = {}) => ({ locale: 'ar', categoryId: 'cat1', subcategoryId: 'sub1', v: 'vid1', baseUrl: BASE, ...over });
const withVideo = (video = VIDEO, path = `${SUB_PATH}/videos/${video.id}`) => ({ [SUB_PATH]: SUBCATEGORY, [path]: video });

test('no service account (no reader) keeps the generic layout metadata', async () => {
  assert.deepEqual(await loadWatchMetadata(args(), null), {});
  // The real factory returns no reader without the env var, so no request is ever made.
  assert.equal(createFirestoreReader({ env: {} }), null);
  assert.deepEqual(await loadWatchMetadata(args(), createFirestoreReader({ env: {} })), {});
});

test('a shared ?v= video gets its own title, description, thumbnail and ?v= url (Arabic)', async () => {
  const md = await loadWatchMetadata(args(), fakeReader(withVideo()));
  assert.deepEqual(md, {
    title: `تأمل الصباح | ${SITE_NAME}`,
    description: 'وصف عربي',
    openGraph: {
      type: 'video.other',
      url: `${PAGE}?v=vid1`,
      siteName: 'Okaz | عكاظ',
      locale: 'ar_AR',
      title: 'تأمل الصباح',
      description: 'وصف عربي',
      images: [{ url: IMG_AR, alt: 'تأمل الصباح' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'تأمل الصباح',
      description: 'وصف عربي',
      images: [IMG_AR],
    },
  });
  assert.ok(!JSON.stringify(md).includes('secret'), 'the video file URL is never exposed');
  assert.ok(!('alternates' in md), 'CanonicalLink stays the only canonical');
});

test('English page uses English fields and en_US', async () => {
  const md = await loadWatchMetadata(args({ locale: 'en' }), fakeReader(withVideo()));
  assert.equal(md.openGraph.title, 'Morning meditation');
  assert.equal(md.openGraph.description, 'English description');
  assert.equal(md.openGraph.locale, 'en_US');
  assert.equal(md.openGraph.url, `${BASE}/en/watch/cat1/sub1?v=vid1`);
  assert.deepEqual(md.twitter.images, [IMG_EN]);
});

test('Arabic page falls back to English when Arabic is missing or blank; a plain string is used as is', async () => {
  const englishOnly = {
    id: 'vid1',
    data: { title: { ar: '  ', en: 'Only English' }, description: 'Plain string description', imageUrl: { en: IMG_EN } },
  };
  const md = await loadWatchMetadata(args(), fakeReader(withVideo(englishOnly)));
  assert.equal(md.openGraph.title, 'Only English');
  assert.equal(md.openGraph.description, 'Plain string description');
  assert.deepEqual(md.openGraph.images, [{ url: IMG_EN, alt: 'Only English' }]);
  assert.equal(md.openGraph.locale, 'ar_AR');
});

test('a premium video still gets a preview (title, text, thumbnail only)', async () => {
  const premium = { ...VIDEO, data: { ...VIDEO.data, isPremium: true } };
  const md = await loadWatchMetadata(args(), fakeReader(withVideo(premium)));
  assert.equal(md.openGraph.type, 'video.other');
  assert.equal(md.openGraph.title, 'تأمل الصباح');
  assert.ok(!JSON.stringify(md).includes('secret'));
});

test('a hidden video is not previewed: the subcategory is used instead', async () => {
  const hidden = { ...VIDEO, data: { ...VIDEO.data, hide: true } };
  const md = await loadWatchMetadata(args(), fakeReader(withVideo(hidden)));
  assert.equal(md.openGraph.type, 'website');
  assert.equal(md.openGraph.title, 'النوم');
  assert.equal(md.title, `النوم | ${SITE_NAME}`);
  assert.equal(md.openGraph.url, `${PAGE}?v=vid1`, 'og:url still matches the canonical');
  assert.deepEqual(md.openGraph.images, [{ url: SUB_IMG, alt: 'النوم' }]);
  assert.ok(!('description' in md), 'generic layout description is kept');
});

test('a missing video falls back to the subcategory; nothing found at all gives {}', async () => {
  const md = await loadWatchMetadata(args({ v: 'unknown' }), fakeReader({ [SUB_PATH]: SUBCATEGORY }));
  assert.equal(md.openGraph.title, 'النوم');
  assert.equal(md.openGraph.url, `${PAGE}?v=unknown`);
  assert.deepEqual(await loadWatchMetadata(args({ v: 'unknown' }), fakeReader({})), {});
  // A subcategory without any title is not worth a card either.
  assert.deepEqual(await loadWatchMetadata(args(), fakeReader({ [SUB_PATH]: { id: 'sub1', data: {} } })), {});
});

test('no ?v= (or an invalid one): subcategory preview, no video lookups', async () => {
  for (const v of [undefined, null, '', 'x'.repeat(201)]) {
    const reader = fakeReader(withVideo());
    const md = await loadWatchMetadata(args({ v }), reader);
    assert.equal(md.openGraph.title, 'النوم', String(v));
    assert.equal(md.openGraph.url, PAGE);
    assert.deepEqual(reader.calls, [['get', SUB_PATH]]);
  }
});

test('a video whose videoId field differs from its document id is found by the field', async () => {
  const byField = { id: 'docX', data: { ...VIDEO.data, videoId: 'shared-id' } };
  const reader = fakeReader(withVideo(byField, `${SUB_PATH}/videos/docX`));
  const md = await loadWatchMetadata(args({ v: 'shared-id' }), reader);
  assert.equal(md.openGraph.title, 'تأمل الصباح');
  assert.deepEqual(reader.calls.find((c) => c[0] === 'query'), ['query', `${SUB_PATH}/videos`, 'videoId', 'shared-id']);
  // ...and that document is NOT the video for ?v=docX (the site calls it 'shared-id').
  assert.equal((await loadWatchMetadata(args({ v: 'docX' }), fakeReader(withVideo(byField, `${SUB_PATH}/videos/docX`)))).openGraph.type, 'website');
});

test('a video without a videoId field is found by its document id', async () => {
  const noField = { id: 'vid1', data: { ...VIDEO.data, videoId: '' } };
  const md = await loadWatchMetadata(args(), fakeReader(withVideo(noField)));
  assert.equal(md.openGraph.type, 'video.other');
});

test('missing or non-http thumbnails: subcategory image, else no image and a small card', async () => {
  const noImage = { id: 'vid1', data: { ...VIDEO.data, imageUrl: {} } };
  const md = await loadWatchMetadata(args(), fakeReader(withVideo(noImage)));
  assert.deepEqual(md.twitter.images, [SUB_IMG]);

  const md2 = buildWatchMetadata(args(), { id: 'vid1', data: { ...VIDEO.data, imageUrl: 'javascript:alert(1)' } }, null);
  assert.ok(!('images' in md2.openGraph));
  assert.equal(md2.twitter.card, 'summary');
});

test('long descriptions are trimmed to about 200 characters on a word boundary', async () => {
  const long = `${'كلمة '.repeat(80)}`; // 400 characters
  const md = await loadWatchMetadata(args(), fakeReader(withVideo({ id: 'vid1', data: { ...VIDEO.data, description: { ar: long } } })));
  assert.ok(md.description.length <= MAX_DESCRIPTION_LENGTH, String(md.description.length));
  assert.ok(md.description.endsWith('كلمة…'));
  assert.equal(md.twitter.description, md.description);
  assert.equal(trimDescription('  a \n\n b  '), 'a b');
  assert.equal(trimDescription('x'.repeat(300)).length, 200);
  assert.equal(Array.from(trimDescription('😀'.repeat(300))).length, 200, 'emoji are not split');
});

test('Firestore errors or slowness never break the page: {} is returned', async () => {
  const broken = { getDocument: async () => { throw new Error('boom'); }, findOneByField: async () => null };
  assert.deepEqual(await loadWatchMetadata(args(), broken), {});
  const never = new Promise(() => {});
  const slow = { getDocument: () => never, findOneByField: () => never };
  const started = Date.now();
  assert.deepEqual(await loadWatchMetadata(args(), slow, 50), {});
  assert.ok(Date.now() - started < 1000);
});

test('end to end with the REST reader and a faked fetch (no network)', async () => {
  resetAccessTokenCache();
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const env = {
    [SERVICE_ACCOUNT_ENV]: JSON.stringify({
      project_id: 'test-project',
      client_email: 'viewer@test-project.iam.gserviceaccount.com',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
      token_uri: 'https://oauth2.example.test/token',
    }),
  };
  const DOCS = 'https://firestore.googleapis.com/v1/projects/test-project/databases/(default)/documents';
  const name = (p) => `projects/test-project/databases/(default)/documents/${p}`;
  const map = (o) => ({ mapValue: { fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { stringValue: v }])) } });
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
    if (url === 'https://oauth2.example.test/token') return json({ access_token: 't', expires_in: 3600 });
    if (url === `${DOCS}/${SUB_PATH}`) return json({ name: name(SUB_PATH), fields: { title: map({ en: 'Sleep' }), imageUrl: { stringValue: SUB_IMG } } });
    if (url === `${DOCS}/${SUB_PATH}/videos/vid1`) {
      return json({
        name: name(`${SUB_PATH}/videos/vid1`),
        fields: { title: map({ ar: 'تأمل', en: 'Meditation' }), imageUrl: map({ ar: IMG_AR }), hide: { booleanValue: false }, isPremium: { booleanValue: true } },
      });
    }
    if (url === `${DOCS}/${SUB_PATH}:runQuery`) return json([{ readTime: 'x' }]);
    return json({ error: { code: 404 } }, 404);
  };
  const md = await loadWatchMetadata(args(), createFirestoreReader({ env, fetchImpl }));
  assert.equal(md.openGraph.title, 'تأمل');
  assert.deepEqual(md.openGraph.images, [{ url: IMG_AR, alt: 'تأمل' }]);
  assert.ok(urls.every((u) => u.startsWith('https://oauth2.example.test/') || u.startsWith(DOCS)));
});
