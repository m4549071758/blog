---
title: 自宅の環境
excerpt: 自宅サーバーの環境紹介
coverImage: '/assets/blog/0004/cover.png'
date: '2024-10-15'
ogImage:
  url: '/assets/blog/0004/cover.png'
tags:
  - 'miscellaneous'
---

自宅のサーバー環境を紹介します。

## サーバー構成

現在我が家では、Proxmoxを使用した仮想化環境を運用しています。
3台の物理サーバーでクラスタを構築していて、ライブマイグレーションなどで無停止メンテナンスが出来るようになっています。
Dockerは単純に好きでないおじさんなので基本的にイチから組んでいます。

### ハードウェア
3台のサーバースペックは次の通り。
もうちょっとvCPU数欲しいなぁとか思っているので、そのうちCPUを変えるかもしれません。
#### サーバー1台目のスペック
- **自作**
- **CPU**: Xeon E5-2689 2.6GHz 1ソケット
- **RAM**: 128GB
- **DISKS**:
  - ProxmoxのOS領域用に256GB M.2 SSD
  - データ領域用に1TB HDD × 6をZFS RAIDZで冗長化（使用可能領域5TB）
- **NIC**: Intel X540-AT2 10Gbps
- **GPU**: NVIDIA GTX1060 6GB
- Proxmoxダッシュボード

![Proxmoxダッシュボード](/assets/blog/0004/proxmox1.png)

#### サーバー2台目のスペック
- **MAGNIA T1340d**
- **CPU**: Xeon E3-1220 v3 3.5GHz 1ソケット
- **RAM**: 8GB
- **DISKS**:
  - ProxmoxのOS領域用に128GB SATA SSD
  - Proxmox Backup Serverのデータ領域として500GB × 2をZFS Mirrorで冗長化（使用可能領域500GB）
  - NFSで公開してProxmoxクラスタ全体のデータ領域用に2TB HDD（冗長化なし）
- **NIC**: Intel X540-AT2 10Gbps
- **GPU**: MGA G200e
- Proxmoxダッシュボード

![Proxmoxダッシュボード](/assets/blog/0004/proxmox2.png)

#### サーバー3台目のスペック
- **Raspberry Pi 4 Model B Rev 1.5**
- **CPU**: Broadcom BCM2711, quad-core Cortex-A72 1.5GHz
- **RAM**: 4GB
- **DISKS**: 512GB MicroSDのみ
- **NIC**: オンボード 1Gbps
- **GPU**: オンボード
- Proxmoxダッシュボード

![Proxmoxダッシュボード](/assets/blog/0004/proxmox3.png)

### ネットワーク構成

#### 回線契約
- **契約**: enひかりクロス & MAP-E(V6プラス) + 固定IPオプション
- **プロバイダ**: enひかり
夜の混雑する時間でも6Gbps程度出るので、満足しています。

### 宅内ネットワーク

宅内のネットワークは、無線LANを除いて全て10Gbpsで配線しています。
ただし、ラズパイはMAX 1Gbpsなのでここだけやや遅いです。

```text
ONU 
  │
  └──> XG-100NE
        ├──> XikeStor 10Gbpsスイッチングハブ (RJ-45) -> 各機器 & メインPCへ
        └──> TP-Link AX1800 (WiFiルーター)
```

### 各サーバーについて
それぞれスペックに合わせて役割を変えています。

### 1台目サーバー
我が家のインフラの中心的存在。
高負荷サービスを集約していて、**nginx**を使ったhttpsリバースプロキシで外部アクセスを制御しています。

- **nginx**: httpsリバースプロキシ
- **Nextcloud, Jellyfin, Komga**: ファイル共有やメディアストリーミング、電子書籍管理など
- **ArchiveBox**: プライベートWebアーカイブとして、重要なWebページ(エロ)を保存
- **メールサーバー**: 自宅メールサーバーの運用もここ
- **DNSサーバー**（プライマリ）: 自宅ネットワーク内のDNSを担当
- **プリンター共有サーバー(CUPS)**: プリンターのネットワーク共有
- **このブログ**: 今見ているブログもここでホストされています

その他にも、discord botなど色々動いています。

### 2台目サーバー
2台目は主に**監視**や**バックアップ**を担当。

- **InfluxDB & Grafana**: 各サーバーのテレメトリデータを収集し、視覚化して監視
- **Proxmox Backup Server**: クラスタ全体のバックアップをここで管理
- その他の軽負荷サービスもいくつか動いています。

### 3台目サーバー
このサーバーは、ProxmoxクラスタのQuorumホスト兼セカンダリDNSサーバーにしてます。

- **DNSサーバー**（セカンダリ）: 1台目がダウンしてもネットワークが落ちないようにしてます。

#### Proxmox Backup Serverについて
Proxmox Backup Serverは、Proxmoxクラスタ全体のバックアップを管理するために使っています。
普通にバックアップを取るよりこっちの方が便利なので使ってます。

![Proxmox Backup Server](/assets/blog/0004/pbs.png)

#### DNSサーバーについて
AdGuard Homeを使って、DNSフィルタリングで広告ブロックを行っています。
また、AdGuardHome-Syncでプライマリとセカンダリの同期を取っています。

![AdGuard Home](/assets/blog/0004/adguard.png)

### 雑記
ぶっちゃけサーバーが3台もあると電気代がヤバい。
夏場とかはサーバールームが地獄の熱さになっちゃうのでエアコンはつけっぱにしないといけない。
この規模の環境動かすのは正直自己満です。ただ、VPSでこの構成組むと普通に電気代払うより高いからまあいいかなって感じ。
そのうちサーバーラックとラックマウントのATXケース買って全部まとめたい。