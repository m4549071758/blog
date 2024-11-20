---
title: 'ProxmoxのLXCコンテナとTailscaleでリモートアクセスVPNを作ろう'
excerpt: '高速なP2PVPN'
coverImage: '/assets/blog/0010/cover.webp'
date: '2024-11-20'
ogImage:
  url: '/assets/blog/0010/cover.webp'
tags:
  - '自宅サーバー'
  - 'network'
---

## 自宅サーバーへのアクセス
現状は`Softether VPN`を使ってリモートから宅内のサーバー群へアクセスできるようにしています。

https://qiita.com/katori_m/items/2274ef6ff84481b84f6b

今回はこれを`Tailscale`に置き換えようと思います。
なお、Tailscaleの障害やサービス終了に備えてsoftetherはそのまま残します。

## Tailscale

https://tailscale.com/

ポート開放の必要がないP2P分散型VPNです。
`tailnet`と呼ばれるドメインネットワーク内でP2P通信を行います。
出口ノード設定とローカルサブネットへのルーティング設定でリモートアクセスVPNの構築ができます。

### 料金プラン
無料で使える`Personal`プランでは、以下のことができます。
- 最大3ユーザー
- 最大100デバイス
- Tailscaleの全機能にアクセス可能
  - Magic DNS
  - ACL
  - etc...
- 無期限かつ無料

https://tailscale.com/pricing

これを`Personal Plus`プランにすると月額$6で6ユーザーまで使えるようになります。

#### Magic DNS
`Magic DNS`は、tailnetに接続しているデバイスにホスト名を割り振りって、そのホスト名を使用してtailnetに接続しているデバイス同士で通信できる機能です。
要するに宅内DNSのようなものです。

#### ACL
アクセスコントロール機能です。
友人はファイルサーバーのみ、のようにアカウントごとにアクセスできるノードを制限できたりします。

## 構築
### Tailscaleへの登録
まずはtailscaleに登録します。
登録はSSOのみ対応なので、好きなプロバイダで登録してください。

![001.webp](/assets/blog/0010/001.webp)

使用目的はPersonal Useです。

![image.webp](/assets/blog/0010/002.webp)

最初のデバイスを登録しろ、と言われますが今回は下のSkipを押して飛ばします。
![image.webp](/assets/blog/0010/003.webp)

スキップすると次のような画面になるので、次はLXCコンテナを作成します。

![image.webp](/assets/blog/0010/004.webp)

### LXCコンテナの作成
#### テンプレートダウンロード
今回は`AlmaLinux 9`のテンプレートを使用します。

テンプレートのダウンロード方法はこちらから

https://qiita.com/bashaway/items/f79cb6dde2ec4fdf3ae7#%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88%E3%81%AE%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89

![image.webp](/assets/blog/0010/005.webp)

AlmaLinux9を選択してダウンロードしたらコンテナの作成に移ります。

#### コンテナID
`CT ID`: 任意のID
`ホスト名`: 任意のホスト名 ここはTailscaleのデバイス名になります。
パスワードを設定したら次へ進みます。

![image.webp](/assets/blog/0010/006.webp)

#### テンプレート指定
テンプレートをダウンロードしたストレージを選択して、AlmaLinuxのテンプレートを指定します。

![007.webp](/assets/blog/0010/007.webp)

#### ストレージ
ストレージを指定します。
今回は32GBにしておきます。少なすぎると起動に失敗します。

![008.webp](/assets/blog/0010/008.webp)

#### CPU・メモリ
CPUは2コア、メモリは2048MB程度にしておきます。
スワップはお好みで設定してください。

###### ネットワーク
ネットワーク設定をします。
ここでIPアドレスの取得にDHCPを使用すると、コンテナの起動がかなり遅くなるので気を付けてください。

![image.webp](/assets/blog/0010/0088.webp)

### LXCコンテナの起動
コンテナを作成したら起動します。
ユーザー名は`root`、パスワードは先ほど指定したものです。

### Tailscaleのインストール
Tailscaleをインストールしていきます。
公式のワンラインコマンドを実行します。

https://tailscale.com/kb/1031/install-linux

```text:console
# curl -fsSL https://tailscale.com/install.sh | sh

Installing Tailscale for fedora, using method dnf
+ '[' 3 = 3 ']'
+ dnf install -y 'dnf-command(config-manager)'
AlmaLinux 9 - AppStream                                                             4.2 MB/s | 8.2 MB     00:01    
AlmaLinux 9 - BaseOS                                                                1.0 MB/s | 2.3 MB     00:02    
AlmaLinux 9 - Extras                                                                 17 kB/s |  13 kB     00:00    
Last metadata expiration check: 0:00:01 ago on Wed 20 Nov 2024 07:56:53 AM UTC.
Dependencies resolved.

......

Complete!
+ systemctl enable --now tailscaled
Created symlink /etc/systemd/system/multi-user.target.wants/tailscaled.service → /usr/lib/systemd/system/tailscaled.service.
+ set +x
Installation complete! Log in to start using Tailscale by running:

tailscale up
```

`Installation Complete!`が表示されたら、一度コンテナをシャットダウンします。
#### コンテナ設定変更
コンテナの設定を変更します。
Proxmoxのシェルから、`/etc/pve/lxc/VMID.conf`を編集します。

```text:/etc/pve/lxc/150.conf
# vim /etc/pve/lxc/150.conf

末尾に追記

lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```
この設定が終わったらコンテナを起動します。
コンテナが立ち上がったら、コンテナのシェルでコマンドを実行します。

恐らく`/etc/sysctl.conf`には何も書かれていないはず or コメントのみのはずなので、2行追記します。

```text:/etc/sysctl.conf
# vim /etc/sysctl.conf

net.ipv4.ip_forward=1
net.ipv6.conf.all.forwarding=1
```

変更したらコンテナを再起動します。

#### Tailscaleのリンク
コンテナ設定の変更が終わったら、tailscaleを実行していきます。
```text:console
# tailscale up

To authenticate, visit:

        https://login.tailscale.com/a/XXXXXXXXXXX
```

ここに表示されるURLにアクセスし、ログインして続行します。
リンクが完了すると次のページが表示されます。また、コンソールに`Success`と表示されます。

![009.webp](/assets/blog/0010/009.webp)

Tailscaleの`Machines`ページに戻り、このように接続したノードが表示されていればOKです。

![010.webp](/assets/blog/0010/010.webp)

### ルーティング設定
#### サブネット設定
サブネットルーターとして動作させるために、サービスを登録します。
警告は無視してかまいません。
```text:console
# tailscale up --advertise-routes=192.168.1.0/24 --advertise-exit-node --accept-routes
Warning: IP forwarding is disabled, subnet routing/exit nodes will not work.
See https://tailscale.com/s/ip-forwarding
Warning: UDP GRO forwarding is suboptimally configured on eth0, UDP forwarding throughput capability will increase with a configuration change.
See https://tailscale.com/s/ethtool-config-udp-gro
```

`--advertise-routes=`: ここには自宅ネットワークのネットワークアドレスをCIDRで入力します。
`--advertise-exit-node`: 出口ノードとして使用することを示します。
自宅サーバーを`Exit Node`に指定すると、すべての通信が自宅(出口ノード)経由になります。
アクセス先のサイトやサービスから見えるIPアドレスは自宅のものになります。

```text:Exit Nodeなし
                |-> インターネット
アクセス元端末 ->|
                |-> tailnet(各VPNノード)
```

```text:Exit Nodeあり
アクセス元端末 -> 出口ノード -> インターネット
```

これで先ほどのマシンにサブネットと出口ノード設定が行われたので、次はこれを有効化します。
![011.webp](/assets/blog/0010/011.webp)

#### サブネット・出口ノード有効化
`Share`の横の3点ボタンから`Edit route settings...`を選択します。

![012.webp](/assets/blog/0010/012.webp)

両方ともチェックを付け、`Save`します。
![013.webp](/assets/blog/0010/013.webp)

### 構築完了
これでひとまずサーバー側の構築は完了です。
次はクライアントの設定をしていきます。

## クライアント設定
今回はAndroidスマホを最初のクライアントとして設定していきます。
Google PlayからTailscaleクライアントをインストールします。

https://play.google.com/store/apps/details?id=com.tailscale.ipn&pli=1

### ログイン
起動するとこのような画面になるのでログインします。

![014.webp](/assets/blog/0010/014.webp)

ログインすると、このようにtailnetに登録されたデバイス一覧が見れるようになります。

![015.webp](/assets/blog/0010/015.webp)

### 出口ノード指定
次に、出口ノードを指定します。
`Exit Node None`となっているところを選択します。
選択すると、このようにtailnet上で出口ノードとして登録されたノード一覧が見られます。
今回は、自宅サーバーのノードを指定します。

![016.webp](/assets/blog/0010/016.webp)

正常に指定されると、このように青くなります。

![017.webp](/assets/blog/0010/017.webp)

この状態でローカルのサーバーにアクセスしてみて通れば完了です。

## まとめ
ポート開放やルーティングテーブルを書くことなくVPNを構築できるのでセットアップしやすかったです。
また手順も少ないので15分もあれば構築できました。

パフォーマンスについてはそのうち追記しようと思います。
### 参考

https://tailscale.com/kb/1130/lxc-unprivileged

https://wifi-manual.net/tailscale-on-proxmox-lxc-container

