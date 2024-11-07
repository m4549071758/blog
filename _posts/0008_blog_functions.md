---
title: ブログの機能をいろいろ追加
excerpt: テンプレートから追加したり変えたりした機能
coverImage: '/assets/blog/preview/cover.jpg'
date: '2024-11-07'
ogImage:
  url: '/assets/blog/dynamic-routing/cover.jpg'
tags:
  - 'miscellaneous'
---

## テンプレート

このブログは、`sub-t`さんの個人ブログテンプレートをフォークしてデプロイしています。

https://github.com/sub-t/blog-template

## 追加した機能

デプロイして使う上で、いくつか追加したい機能があったのでいろいろと実装しました。

### リンクカードを実装

- `remark-link-card`でリンクカードを実装
  - `remarkParse`でパースした後、`rlc`でリンクカードを追加
  - `remarkRehype`と`rehypeStringify`で変換時に`allowDangerousHtml`を true に
  - `rls.css`にリンクカードの CSS を配置

https://google.com

### Github Flavored Markdown を有効化

- `remark-Gfm`で Github Flavored Markdown を有効化

#### タスクリスト

- [ ] やること
- [x] やり終わったこと

#### テーブル

| h   | o   |   g |  e  |
| --- | :-- | --: | :-: |

#### 打消し線

チルダで囲むと~打消し線~

#### 注釈

注釈とか[^1]

[^1]: 見たな。

#### URL, mailto の自動リンカー

www.example.com, https://example.com, contact@example.com.

### コードブロックの拡張

- `rehype-code-titles`と`rehype-prism-plus`でコードブロックにタイトルとシンタックスハイライト・行番号を追加

```TypeScript:src/lib/markdownToHtml.ts {9,14-15} showLineNumbers
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import rlc from 'remark-link-card';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(rlc)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCodeTitles)
    .use(rehypePrism)
    .use(rehypeRaw)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .process(markdown);

  return result.toString();
}
```

### その他

- `rehype-raw`で Markdown と HTML のミックス記述ができるように
- `Google Analytics`でトラフィック解析を実装
