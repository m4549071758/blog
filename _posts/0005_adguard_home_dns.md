---
title: AdGuard Home DNSで広告ブロック + 宅内DNS
excerpt: AdGuard Homeを使って広告ブロックしながら内向きDNSを作ろう。冗長化もね。
coverImage: '/assets/blog/0004/adguard.png'
date: '2024-10-15'
ogImage:
  url: '/assets/blog/0004/adguard.png'
tags:
  - 'network'
  - 'dns'
---

# はじめに

[Qiita](https://qiita.com/m4549071758/items/cfaa9743eb417e985240)

以前、こんな感じで内向きDNSを作りました。
しかし、サーバー1台のみで動作しているのでこのDNSを動かしているサーバーが落ちてしまうと家の中のネットワーク接続が全て死んでしまいます。
そこで`AdGuard Home`で広告をブロックしつつ、`AdGuardHome-Sync`を使用して冗長化したいと思います。

### OSによる設定手順の違いについて
今回は`AlmaLinux 9`で設定を進めていきます。UbuntuなどのDebian系ディストロは、`systemd-resolve`が53番ポートをリッスンしているらしいので止めておいてください。

# AdGuard Home構築
## AdGuard Homeのインストール
まずはAdGuard本体をインストールしていきます。
公式でワンラインインストールコマンドがあるのでそちらを利用します。

https://github.com/AdguardTeam/AdGuardHome#automated-install-linux-and-mac

``` text
# wget --no-verbose -O - https://raw.githubusercontent.com/AdguardTeam/AdGuardHome/master/scripts/install.sh | sh -s -- -v
```

インストールが完了したら自動でサービス登録されているはずなので起動します。
``` text
# systemctl enable --now AdGuardHome.service
```


## AdGuard Homeの初期設定
無事起動したら、`http://SERVER_ADDRESS:3000`にアクセスすると初期セットアップ画面が開くと思います。

### ウェルカム画面
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/ee528dfc-3ba5-e059-3dd3-a4067cf82d9f.png)

基本的にはウィザードに従って必要なところを入力していけばOKです。

### インターフェース設定
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/c362191f-936a-7564-310f-0494e7e84153.png)

Webインターフェース用のポートが埋まっている場合は好きなポート番号に変えても構いませんが、この後に同期用ツールでベーシック認証に使用するので覚えておいてください。

### ユーザー設定
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/3308d3f0-c609-e5da-a391-8520c9352164.png)

こちらのユーザー名とパスワードも後で使用します。

### 完了画面
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/f9fc7abf-1ddc-15d0-3f84-bc8db8f75fa8.png)

これで初期セットアップは完了です。

ここまで設定が終わったら、2台目も初期セットアップをしてダッシュボードにログインできる状態までセットアップしてください。
2台目のサーバーは自動で設定が同期されるので、この下のDNS及び広告ブロック設定は必要ありません。


# DNS及び広告ブロック設定
## DNS設定
### アップストリームDNSサーバー設定
AdGuard Homeが問い合わせ先として使用するDNSサーバーを設定します。
`設定`->`DNS設定`の`アップストリームDNSサーバー`を追加します。
今回は`Quad9`・`1.1.1.1`を追加します。
ついでにおまけで`Google Public DNS`もTCPのみ入れておきます。
``` text
1.1.1.1
1.0.0.1
2606:4700:4700::1111
2606:4700:4700::1001
https://cloudflare-dns.com/dns-query
https://dns10.quad9.net:443/dns-query
8.8.8.8
```
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/3fd35245-d9b0-c35a-3799-687abeab4a4e.png)
リクエストモードは`並列リクエスト`に設定します。

`アップストリームをテスト`で接続テストを行ったら、設定を適用します。

下の方にある`DNSSECを有効にする`にチェックを入れると、DNS問い合わせ時にDNSSECの検証を行ってくれます。

### 暗号化設定
DoH及びDoTを有効化するために、証明書を設定します。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/28d5136d-75e3-cc29-ae2e-6b8204d1b44a.png)

サーバー名(このドメインの証明書を使用します)を入力します。
`暗号化を有効化する`・`プレーンDNSを有効化する`にチェックを入れ、`HTTPSに自動的にリダイレクト`のチェックボックスは外しておいてください。

下に進んで証明書を設定します。Let's Encryptとcertbotを使用して証明書を取得してパスを設定すれば、更新のたびにここをいじらなくてよくなります。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/2e440d2e-af57-0991-8322-58407e58100e.png)

certbotで取得した場合証明書と秘密鍵は、`/etc/letsencrypt/live/ドメイン名/`以下に転がってると思いますのでパスを設定してください。
このとき、証明書は`cert.pem`ではなく中間証明書付きの`fullchain.pem`にしてください。

正しく設定できていれば、証明書チェーンは有効です、となるのでそのまま構成を保存してください。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/9854e5ea-b6a5-36c7-ed19-9ab509011752.png)


## 内部ネットワーク用DNS設定
内部ネットワーク用のDNS設定は、ナビゲーションの`フィルタ`->`DNS書き換え`からアクセスします。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/b913713e-d0d5-a24f-2862-88f89ab4339b.png)
リライトしたいドメイン名とIPアドレスを入力して保存するだけです。

## 広告ブロック設定
広告ブロック用のフィルタ設定をします。
### デフォルトフィルタ
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/fe1f19cd-2df4-fde3-b8bb-1eeb98561dc4.png)
`フィルタ`->`DNSブロックリスト`を開き、`AdGuard DNS filter`と`AdAway Default Blocklist`を有効化します。

### カスタムフィルタ
280blockerや、なんjフィルタなどを追加したい場合は、`DNSブロックリスト`の`ブロックリストを追加する`->`カスタムリストを追加する`から追加できます。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/21ef272c-e237-3c25-0d23-cdc6419bdbd4.png)

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/781e21f8-fa9a-ac98-cac6-4e0c0fae33b6.png)

AdGuardのフィルタリストについては次のページを見るといいと思います。

なんJ AdGuard部

https://wikiwiki.jp/nanj-adguard/

フィルタリスト

https://wikiwiki.jp/nanj-adguard/%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC%E3%83%AA%E3%82%B9%E3%83%88

# AdguardHome-sync構築
ここからは同期ツールの設定をします。

まずGithubから最新バージョンの同期ツールをダウンロードしてきます。

https://github.com/bakito/adguardhome-sync/releases/

同期ツールは、どのホストで動かしても構いません。1台目で動かしても2台目で動かしてもOKです。

今回はバージョン`adguardhome-sync_0.6.9_linux_amd64.tar.gz`をダウンロードしてきました。
(2024/04/23)

``` text
$ mkdir adguardhome-sync && cd adguardhome-sync
$ wget https://github.com/bakito/adguardhome-sync/releases/download/v0.6.9/adguardhome-sync_0.6.9_linux_amd64.tar.gz
$ tar zxvf adguardhome-sync_0.6.9_linux_amd64.tar.gz
```

### 環境変数を設定
今回は~/.bash_profileに追記します。

``` text
export LOG_LEVEL=info
export ORIGIN_URL=http://1台目のアドレス
export ORIGIN_USERNAME=1台目で設定したユーザー名
export ORIGIN_PASSWORD=1台目で設定したパスワード
export REPLICA1_URL=http://2台目のアドレス
export REPLICA1_USERNAME=2台目で設定したユーザー名
export REPLICA1_PASSWORD=2台目で設定したパスワード
```
追記が終わったら.bash_profileを再度読み込みます。

``` text
$ source .bash_profile
```

### 初回同期を実行

``` text
$ ./adguardhome-sync run
2024-04-23T22:20:30.794+0900    INFO    sync    sync/sync.go:38 AdGuardHome sync        {"version": "0.6.9", "build": "2024-04-08T16:47:42Z", "os": "linux", "arch": "amd64"}
2024-04-23T22:20:30.795+0900    INFO    sync    sync/http.go:63 Starting API server     {"port": 8080}
2024-04-23T22:20:30.796+0900    INFO    sync    sync/sync.go:75 Running sync on startup
2024-04-23T22:20:30.878+0900    INFO    sync    sync/sync.go:174        Connected to origin     {"from": "1台目のアドレス", "version": "v0.107.48"}
2024-04-23T22:20:32.033+0900    INFO    sync    sync/sync.go:267        Start sync      {"from": "1台目のアドレス", "to": "2台目のアドレス"}
2024-04-23T22:20:32.158+0900    INFO    sync    sync/sync.go:275        Connected to replica    {"from": "1台目のアドレス", "to": "2台目のアドレス", "version": "v0.107.48"}
2024-04-23T22:20:33.259+0900    INFO    client  client/client.go:281    Toggle filtering        {"host": "2台目のアドレス", "enabled": true, "interval": 24}
2024-04-23T22:20:33.606+0900    INFO    client  client/client.go:295    Set blocked services schedule   {"host": "2台目のアドレス", "services": "[]"}
2024-04-23T22:20:34.194+0900    INFO    client  client/client.go:386    Set dns config list     {"host": "2台目のアドレス"}
2024-04-23T22:20:34.564+0900    INFO    sync    sync/sync.go:303        Sync done       {"from": "1台目のアドレス", "to": "2台目のアドレス"}
```

いろいろ流れますが、最後の`Sync done`が表示されれば初回同期は完了です。
この時点で2台目のサーバーを確認すると、フィルタやアップストリームDNSなどの設定が同期されているかと思います。

### 定期同期設定
cronを使って定期的に同期させます。
今回は24時間に1回同期させようと思います。
``` text
$ crontab -e

LOG_LEVEL=info
ORIGIN_URL=http://1台目のアドレス
ORIGIN_USERNAME=1台目で設定したユーザー名
ORIGIN_PASSWORD=1台目で設定したパスワード
REPLICA1_URL=http://2台目のアドレス
REPLICA1_USERNAME=2台目で設定したユーザー名
REPLICA1_PASSWORD=2台目で設定したパスワード
30 12 * * * /展開した実行ファイルまでのパス/adguardhome-sync run
```
これで毎日12:30に同期が実行されます。

## おわり
これで冗長化設定および広告ブロック設定は終了です。
いろいろと自分でいじってみるといいと思います。

# おまけ
フィルタによってはCDNもブロックしてしまうものがあると思います。
ほかにも、ブロックされたくないドメインは明示的に許可することができます。

明示的に許可したい場合は、`クエリログ`を開いてブロックされたリクエストを見つけ、ブロック解除を選択するとカスタムルールが追加されてアクセスできるようになります。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/63f65c0e-2ba9-1b30-80b1-a392243eec4b.png)
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/4e32bc9d-2f60-8b7b-f3c2-40fc46618c2b.png)
