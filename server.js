const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    let { pathname } = parsedUrl;

    if (pathname.startsWith('/posts/')) {
      const slug = pathname.replace('/posts/', '');

      const baseDir = dev ? '.' : path.join(process.cwd(), 'out');
      const postsDir = path.join(baseDir, 'posts');

      if (!slug.endsWith('.html')) {
        try {
          const files = fs.readdirSync(postsDir);
          const matchingFile = files.find((file) => file.startsWith(slug));

          if (matchingFile) {
            console.log(`リダイレクト: ${slug} → ${matchingFile}`);
            pathname = `/posts/${matchingFile}`;
            // .htmlを除去
            pathname = pathname.replace('.html', '');
          }
        } catch (err) {
          console.error('ファイル検索エラー:', err);
        }
      }
    }

    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
