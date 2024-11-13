# お借りしたテンプレート

https://github.com/sub-t/blog-template

# 変えたとこ

## リンクカードを実装

- `remark-link-card`でリンクカードを実装
  - `remarkParse`でパースした後、`rlc`でリンクカードを追加
  - `remarkRehype`と`rehypeStringify`で変換時に`allowDangerousHtml`を true に
  - `rls.css`にリンクカードの CSS を配置

## Github Flavored Markdown を有効化

- `remark-Gfm`で Github Flavored Markdown を有効化

## コードブロックの拡張

- `rehype-code-titles`と`rehype-prism-plus`でコードブロックにタイトルとシンタックスハイライト・行番号を追加

## その他

- `rehype-raw`で Markdown と HTML のミックス記述ができるように
- `Google Analytics`でトラフィック解析を実装

# Admin ページ

新規で自作 CMS と連携するための Admin ページを作成。
Admin ページは Cloudflare Access でメールアドレス認証が必要
