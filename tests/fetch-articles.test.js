const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const script = path.resolve(
  process.env.SEO_TEST_SOURCE || path.join(__dirname, '..'),
  'scripts/fetch-articles.js',
);
const article = {
  id: 'article-1',
  title: 'Article',
  content: 'Content',
  excerpt: 'Description',
  cover_image: '/cover.webp',
  og_image: '/og.webp',
  datetime: '2026-01-01',
  tags: ['network'],
  seo_title: 'Search title',
  seo_description: 'Search description',
};

async function runFetch(t, fetch) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-fetch-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, 'public'));
  const output = path.join(directory, 'public/articles-data.json');
  const previous = '[{"slug":"previous-published-article"}]';
  fs.writeFileSync(output, previous);
  let exitCode = 0;
  await vm.runInNewContext(
    fs.readFileSync(script, 'utf8'),
    {
      require,
      fetch,
      AbortSignal,
      console: { log() {}, warn() {}, error() {} },
      process: {
        env: {},
        cwd: () => directory,
        exit(code) {
          exitCode = code;
        },
      },
    },
    { filename: script },
  );
  return { exitCode, previous, output: fs.readFileSync(output, 'utf8') };
}

test('an unavailable article list fails without replacing published article data', async (t) => {
  const result = await runFetch(
    t,
    async () => new Response('Unavailable', { status: 503 }),
  );
  assert.equal(result.exitCode, 1);
  assert.equal(result.output, result.previous);
});

test('a partially failed detail batch never publishes an incomplete snapshot', async (t) => {
  const result = await runFetch(t, async (url) => {
    if (url.endsWith('/api/articles')) {
      return Response.json([
        { article_id: article.id },
        { article_id: 'missing-article' },
      ]);
    }
    return url.endsWith(article.id)
      ? Response.json(article)
      : new Response('Not found', { status: 404 });
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.output, result.previous);
});

test('malformed article metadata cannot replace the last complete snapshot', async (t) => {
  const result = await runFetch(t, async (url) =>
    url.endsWith('/api/articles')
      ? Response.json([{ article_id: article.id }])
      : Response.json({ ...article, datetime: 'not-a-date' }),
  );
  assert.equal(result.exitCode, 1);
  assert.equal(result.output, result.previous);
});

test('article-specific SEO metadata is preserved in the build snapshot', async (t) => {
  const result = await runFetch(t, async (url) =>
    url.endsWith('/api/articles')
      ? Response.json([{ article_id: article.id }])
      : Response.json(article),
  );
  const [saved] = JSON.parse(result.output);
  assert.equal(saved.seoTitle, article.seo_title);
  assert.equal(saved.seoDescription, article.seo_description);
});

test('malformed SEO metadata cannot replace the last complete snapshot', async (t) => {
  const result = await runFetch(t, async (url) =>
    url.endsWith('/api/articles')
      ? Response.json([{ article_id: article.id }])
      : Response.json({ ...article, seo_title: 42 }),
  );
  assert.equal(result.exitCode, 1);
  assert.equal(result.output, result.previous);
});

test('a valid empty article collection removes stale snapshot entries', async (t) => {
  const result = await runFetch(t, async () => Response.json([]));
  assert.equal(result.exitCode, 0);
  assert.deepEqual(JSON.parse(result.output), []);
});
