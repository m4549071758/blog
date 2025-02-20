---
title: 'セルフホストのススメ | 2025年Ver.'
excerpt: 'おすすめセルフホストサービス'
coverImage: '/assets/blog/preview/cover.webp'
date: '2025-01-16'
ogImage:
  url: '/assets/blog/preview/cover.webp'
tags:
  - '自宅サーバー'
  - 'セルフホスト'
---

## おうちのサービス

皆様自宅のサーバーでいろいろと動かしていると思います。
今回は自分でホストしているサービスをまとめつつ、各サービスの紹介をしようと思います。
割とやり尽くした感があるので、何か良さげなサービスがあったらコメントで教えてください。

## Archivebox

https://archivebox.io/

### Alternative

- Wayback Machine

### 紹介

個人用の魚拓ツールです。`yt-dlp`とか積んでるので Youtube からも引っ張れます。
Cookie を仕込んでｺﾞﾆｮｺﾞﾆｮするとログインが必要なページが見れたりもします。

![image.png](/assets/blog/0012/001.webp)

現在はもっぱら Twitter のイラストとか Qiita の記事保存しておくのに使っています。
Pocket と RSS 連携させて自動保存とかも出来たりします。
Fess とかくっつけると QoL が上がると思います。

#### 日本語

- 非対応
- タイムゾーンの変更も不可

### 構築記事

https://qiita.com/a0x41/items/89301e4cbe2d9946a953

## Dawarich

https://dawarich.app/

### Alternative

- Google Map タイムライン

### 紹介

Google Map のタイムライン機能をセルフホストできるアプリ。
Owntracks みたいなアプリをスマホに入れてトラッキングが出来ます。
Google からのインポートもできる。

![image.png](/assets/blog/0012/009.webp)
リバースプロキシの後ろで動かすときは`docker-compose.yml`を編集するのですが、ここでちょっと詰まりポイント。

```docker-compose.yml
64行目、115行目あたり
      APPLICATION_HOSTS: localhost,timeline.example.com
```

ここで許可ホストを追加するとき、`localhost, timeline.example.com`のようにカンマのあとにスペースを入れるとうまくいかないので注意。
クセでスペースを入れてしまって 1 時間ほど迷ってました。

> [!WARNING]
>
> #### 新しいタイムラインについて
>
> 2024/06 以降の新しいタイムラインに移行している場合、ブラウザの Google Takeout からエクスポートしたデータは Timeline Edits.json という編集履歴のデータしかエクスポートできません。
>
> #### インポートする場合
>
> Android スマホの設定 -> 位置情報 -> 位置情報サービス -> タイムライン -> タイムラインのエクスポートから、タイムライン.json をエクスポート
> WebUI の Imports で Google Phone Takeout を選択し、タイムライン.json を選択してインポートしてください。

#### 日本語

- 非対応

### 構築記事

公式のチュートリアルがわかりやすいので。

https://dawarich.app/docs/intro

## Grafana + InfluxDB

https://grafana.com/ja/

https://www.influxdata.com/

### 紹介

Proxmox のテレメトリ監視のために使っています。
InfluxDB をバケットとして使い、Grafana で可視化しています。
かっちょいいダッシュボードがあります。

![image.png](/assets/blog/0012/002.webp)

大体 2GB くらいメモリを喰うので、カツカツなノードだとキツイかもしれません。

#### 日本語

- 非対応？

### 構築記事

https://qiita.com/rokuosan/items/a378e46a89d31d544d4d

## immich

https://immich.app/

### Alternative

- Google Photo

### 紹介

Google Photo っぽい写真・動画管理ツール。
Google Photo よりかなり軽快に動作します。
Discord コミュニティがあるので情報がいっぱいあります。

![image.png](/assets/blog/0012/003.webp)

Go 製のインポートツールがあるので、Google Takeout で全部引っこ抜いて突っ込めます。
整形とかファイルの間引きとかせずに zip 解凍してそのままぶちこめるのでめっちゃ楽です。

#### 日本語

- 対応

## Jellyfin

https://jellyfin.org/

### Alternative

- Kodi
- MiniDLNA

### 紹介

音楽から動画まで、(ほぼ)なんでも配信できるメディアサーバー。
DLNA 対応なので、テレビでもスマホアプリでもブラウザでも見られます。
他人から見れるようになってしまうと著作権がアウトなので、しっかりパスワード掛けましょう。

![image.png](/assets/blog/0012/004.webp)

ライブラリの情報取得にちょっとクセがあります。
映画とか入れると IMDb から情報を引っ張ってくるのですが、たまに間違った映画から持ってきたりします。

#### 日本語

- 対応

### 構築記事

https://qiita.com/ogawa_pro/items/ed00e2ad4e35fdbd2b5d

## Komga

https://komga.org/

### Alternative

- Kindle
- Calibre

### 紹介

Java 製の電子書籍・PDF リーダー。
かなり大きなライブラリでもサクサク動きます。
ただ環境の問題か文書の問題か、私の環境では epub を正常に読めませんでした。

![image.png](/assets/blog/0012/005.webp)

モバイルで使う場合は PWA 使うか、何らかのリーダーアプリと API 連携ができます。
Jellyfin と同じく他人から見れるようになってしまうと著作権がアウトなので、しっかりパスワード掛けましょう。

#### 日本語

- 対応

### 構築記事

https://komga.org/docs/installation/jar

## Nextcloud

https://nextcloud.com/

### Alternative

- Google Drive
- Dropbox
- Onedrive
- etc...

### 紹介

PHP 製のオンラインストレージ。
ちょっと動作が重いです。
office ファイルとか編集出来たり、共有リンクをカスタマイズできるようになるアプリをいろいろ入れられます。
メールから写真、カレンダーまでいろいろできます。

![image.png](/assets/blog/0012/006.webp)

最近 UI が Bootstrap 製になったらしく、モダンなデザインになりました。
こいつの保存先と Jellyfin のメディアフォルダを同じ場所にして、nextcloud に入れたらすぐ jellyfin で見られるようにしています。

#### 日本語

- 対応

### 構築記事

https://qiita.com/katori_m/items/227c06fc2a4b79095864

## OnlyOffice

https://www.onlyoffice.com/ja/

### Alternative

- Office Online
- Collabora

### 紹介

Nextcloud 上でオフィスファイルを編集するために使っています。
とくにほかの紹介はないです。

#### 日本語

- 対応

### 構築記事

https://qiita.com/katori_m/items/beb1e3e78d270d9f9d70

## Vaultwarden

https://github.com/dani-garcia/vaultwarden

### Alternative

- Bitwarden
- ブラウザのパスワードマネージャー

### 紹介

そこそこ有名なパスワードマネージャー、Bitwarden の Rust クローンで本家 Bitwarden より軽いです。
ブラウザの拡張機能を入れてパスキーの管理とかできて便利です。

![image.png](/assets/blog/0012/007.webp)

#### 日本語

- 対応

### 構築記事

https://qiita.com/kouhei-ioroi/items/97fb3574ad287f07b10a

## メールサーバー

### Alternative

- GMail
- Outlook
- etc...

### 紹介

自分でやるといろいろ大変だしセキュリティ的にもアレなメールサーバーも作ってみました。
Mailu はなぜか動かなかったので、自分で Postfix と Dovecot と Roundcube をくっつけました。

![image.png](/assets/blog/0012/008.webp)

まだあんまり動かしてはいません。

#### 日本語

- 対応

### 構築記事

https://qiita.com/katori_m/items/58b9a49b775b7a7c31d1

https://qiita.com/katori_m/items/fef5294f63be50da5f6d

## おわり

セキュリティだけ気を付けて運用しましょう。
外部に公開したいなら、Cloudflare Tunnel と Access をおすすめします。
ただし、無料版だと 100MB のアップロード帯域制限があるので、Nextcloud などを公開する場合は Nginx などで直接公開したほうが良いと思います。

## 参考サイト

https://qiita.com/curtain6935/items/07a7ab0c4789614541c2

https://qiita.com/jqtype/items/ca576967ffa1a25e6e4a
