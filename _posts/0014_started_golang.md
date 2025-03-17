---
title: 'Golang、始めました'
excerpt: 'python -> golang'
coverImage: '/assets/blog/hello-world/cover.webp'
date: '2025-03-17'
ogImage:
  url: '/assets/blog/hello-world/cover.webp'
tags:
  - 'diary'
  - 'miscellaneous'
  - 'golang'
---

## はじめに

こんにちは、かとりです。
最近 Golang に手を出しました。
今までは Web アプリとかツールとかを python で書いていましたが、なんとなく触れてみた Go 製ツールのメモリ消費量に惹かれて触ってみることにしました。

## 作ったもの

直近では、Wake On Lan できる Web アプリとこの blog 用の CI/CD パイプラインツールを作りました。

### Wake On Lan

https://github.com/m4549071758/go-wakeonlan

Wake On Lan できる Web アプリです。

![ブラウザ画像](/assets/blog/0015/001.webp)

ハードコードにはなりますが、カード形式で表示してボタンを押すだけで起動できたり、手動で MAC アドレスを入力して起動させたりできます。

### CI/CD パイプラインツール

https://github.com/m4549071758/go-webhook-receiver

このブログの CI/CD パイプラインツールです。
GitHub の webhook を受け取って、ブログのビルドとデプロイを行います。

この記事もツールのテストがてら書いています。

`pm2`で next.js をデーモン化し、build が終わったら restart するようにしています。

## 今後

既存のツールのリプレースに Go を使ったり、新しい Web アプリの開発をしようと思っています。(今のところ)
ついでに Go でネットワーク周りにも手を出そうと思っています。
リバプロとか DNS 書いてみたい。

それでは、よしなに。
