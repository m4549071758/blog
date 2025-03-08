---
title: ブログの機能をいろいろ追加
excerpt: テンプレートから追加したり変えたりした機能
coverImage: '/assets/blog/preview/cover.webp'
date: '2025-03-08'
ogImage:
  url: '/assets/blog/dynamic-routing/cover.webp'
tags:
  - 'miscellaneous'
---

## 更新ログ

### 2025/02/20

- `remark-breaks`を追加して改行を有効化
- `rehype-github-alerts`を追加して`alert`ブロックと引用ブロックを追加

### 2025/03/08

- `remark-youtube`で YouTube 埋め込みを追加
- `remark-collapse`で折りたたみを追加

## テンプレート

このブログは、`sub-t`さんの個人ブログテンプレートをフォークしてデプロイしています。

https://github.com/sub-t/blog-template

## 追加した機能

デプロイして使う上で、いくつか追加したい機能があったのでいろいろと実装しました。

### リンクカードを実装

- `remark-link-card`でリンクカードを実装
  - `remarkParse`でパースした後、`rlc`でリンクカードを追加
  - `remarkRehype`と`rehypeStringify`で変換時に`allowDangerousHtml`を true に
  - `rlc.css`にリンクカードの CSS を配置

https://google.com

### Github Flavored Markdown を有効化

- `remark-Gfm`で Github Flavored Markdown を有効化

#### タスクリスト

- [ ] やること
- [x] やり終わったこと

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
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rlc from 'remark-link-card';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkYoutube from 'remark-youtube';
import { unified } from 'unified';

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(rlc)
    .use(remarkYoutube)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCodeTitles)
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeGithubAlerts, true)
    .process(markdown);

  return result.toString();
}

```

### 改行

`remark-breaks`を追加して改行を有効化しました。
これまでは markdown 通りの改行が出来ていませんでしたが、これで改行が出来るようになりました。

ここを
改行

### アラートブロック

`rehype-github-alerts`を追加して`alert`ブロックと引用ブロックを追加しました。

```text:alert
> [!NOTE]
> ユーザーが流し読みしているときでも考慮すべき情報を強調します。

> [!TIP]
> コードをよりよくするための手法を強調します。

> [!IMPORTANT]
> 重要な部分を強調表示します。

> [!WARNING]
> 潜在的なリスクを含み、ユーザーの注意を必要とする重要な内容です。

> [!CAUTION]
> リスクを含み、するべきではないことを強調表示します。
```

```text:note
> 引用です。
> > 二重引用もできます。
```

> [!NOTE]
> ユーザーが流し読みしているときでも考慮すべき情報を強調します。

> [!TIP]
> コードをよりよくするための手法を強調します。

> [!IMPORTANT]
> 重要な部分を強調表示します。

> [!WARNING]
> 潜在的なリスクを含み、ユーザーの注意を必要とする重要な内容です。

> [!CAUTION]
> リスクを含み、するべきではないことを強調表示します。

> 引用です。
>
> > 二重引用もできます。

### YouTube 埋め込み

```text
[](https://www.youtube.com/watch?v=yrwoBOHiR2E)
```

埋め込みたいリンクをインラインリンク形式で書き、`remark-link-card`の処理を回避

[](https://www.youtube.com/watch?v=yrwoBOHiR2E)

### 折りたたみ

<details><summary>開いてみる</summary>
見えた🎉🎉🎉
</details>

### その他

- `Google Analytics`でトラフィック解析を実装
