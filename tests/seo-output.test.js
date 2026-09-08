const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const output = path.resolve(
  process.env.SEO_TEST_OUT || path.join(__dirname, '../out'),
);
const articles = JSON.parse(
  fs.readFileSync(path.join(output, 'articles-data.json'), 'utf8'),
);
const root = new URL(
  process.env.NEXT_PUBLIC_ROOT_URL || 'https://www.katori.dev',
);
const readPage = (pathname) =>
  fs.readFileSync(path.join(output, pathname, 'index.html'), 'utf8');
const schemas = (html) =>
  [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const tags = [...new Set(articles.flatMap((article) => article.tags))];
const archives = fs
  .readdirSync(path.join(output, 'posts/page'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `posts/page/${entry.name}`);
const articlePages = articles.map((article) => `posts/${article.slug}`);
const publicPages = [
  '',
  'posts',
  'tags',
  'about',
  ...archives,
  ...articlePages,
  ...tags.map((tag) => `tags/${tag}`),
];

test('all exported breadcrumbs resolve intermediate items to absolute URLs', () => {
  for (const pathname of publicPages) {
    for (const schema of schemas(readPage(pathname))) {
      if (schema['@type'] !== 'BreadcrumbList') continue;
      assert.ok(schema.itemListElement.length >= 2, pathname);
      schema.itemListElement.forEach((item, index, items) => {
        assert.equal(item.position, index + 1, pathname);
        if (index === items.length - 1 && !item.item) return;
        const url =
          typeof item.item === 'string' ? item.item : item.item?.['@id'];
        assert.match(url || '', /^https?:\/\//, `${pathname}: ${item.name}`);
      });
    }
  }
});

test('article JSON-LD preserves image URLs and never invents modification dates', () => {
  for (const article of articles) {
    const pathname = `posts/${article.slug}`;
    const schema = schemas(readPage(pathname)).find(
      (value) => value['@type'] === 'Article',
    );
    assert.ok(schema, pathname);
    assert.equal(
      schema.image.url,
      new URL(article.ogImage, root).href,
      pathname,
    );
    assert.equal(
      schema.mainEntityOfPage['@id'],
      new URL(`/${pathname}/`, root).href,
      pathname,
    );
    assert.equal(Object.hasOwn(schema, 'dateModified'), false, pathname);
  }
});

test('home and all article archives expose article links before JavaScript executes', () => {
  if (articles.length === 0) return;
  for (const pathname of ['', 'posts', ...archives]) {
    const html = readPage(pathname);
    assert.match(html, /<a\b[^>]*href="\/posts\/[^/"?]+\//, pathname);
  }
});

test('article metadata uses SEO overrides with legacy field fallbacks', () => {
  for (const article of articles) {
    const html = readPage(`posts/${article.slug}`);
    const expectedTitle = article.seoTitle || article.title;
    const expectedDescription = article.seoDescription || article.excerpt;
    assert.ok(
      html.includes(`<title>${escapeHtml(expectedTitle)} |`),
      article.slug,
    );
    assert.ok(
      html.includes(
        `name="description" content="${escapeHtml(expectedDescription)}"`,
      ),
      article.slug,
    );
  }
});

test('public metadata uses canonical page URLs without fixed keywords or fake search actions', () => {
  for (const pathname of publicPages) {
    const html = readPage(pathname);
    const canonicalPath =
      pathname === 'posts/page/1'
        ? '/posts/'
        : pathname
          ? `/${pathname}/`
          : '/';
    const canonical = new URL(canonicalPath, root).href;
    const canonicalTag = html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0];
    assert.ok(canonicalTag?.includes(`href="${canonical}"`), pathname);
    assert.match(
      html,
      /<meta\b[^>]*property="og:image"[^>]*content="[^"]+"/,
      pathname,
    );
    assert.doesNotMatch(html, /<meta\b[^>]*name="keywords"/, pathname);
    assert.equal(
      schemas(html).some(
        (schema) => schema.potentialAction?.['@type'] === 'SearchAction',
      ),
      false,
      pathname,
    );
  }
  const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /<lastmod>/);
  for (const article of articles) {
    assert.ok(
      sitemap.includes(
        `<loc>${new URL(`/posts/${article.slug}/`, root).href}</loc>`,
      ),
      article.slug,
    );
  }
});
