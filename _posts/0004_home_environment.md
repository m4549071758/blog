---
title: 自宅の環境
excerpt: 自宅サーバーの環境紹介
coverImage: '/assets/blog/0004/cover.webp'
date: '2024-10-15'
ogImage:
  url: '/assets/blog/0004/cover.webp'
tags:
  - 'miscellaneous'
---

自宅のサーバー環境を紹介します。

## サーバー構成

現在我が家では、Proxmox を使用した仮想化環境を運用しています。
3 台の物理サーバーでクラスタを構築していて、ライブマイグレーションなどで無停止メンテナンスが出来るようになっています。
Docker は単純に好きでないおじさんなので基本的にイチから組んでいます。

### ハードウェア

3 台のサーバースペックは次の通り。
もうちょっと vCPU 数欲しいなぁとか思っているので、そのうち CPU を変えるかもしれません。

#### サーバー 1 台目のスペック

- **自作**
- **CPU**: Xeon E5-2689 2.6GHz 1 ソケット
- **RAM**: 128GB
- **DISKS**:
  - Proxmox の OS 領域用に 256GB M.2 SSD
  - データ領域用に 1TB HDD × 6 を ZFS RAIDZ で冗長化（使用可能領域 5TB）
- **NIC**: Intel X540-AT2 10Gbps
- **GPU**: NVIDIA GTX1060 6GB
- Proxmox ダッシュボード

![Proxmoxダッシュボード](/assets/blog/0004/proxmox1.webp)

#### サーバー 2 台目のスペック

- **MAGNIA T1340d**
- **CPU**: Xeon E3-1220 v3 3.5GHz 1 ソケット
- **RAM**: 8GB
- **DISKS**:
  - Proxmox の OS 領域用に 128GB SATA SSD
  - Proxmox Backup Server のデータ領域として 500GB × 2 を ZFS Mirror で冗長化（使用可能領域 500GB）
  - NFS で公開して Proxmox クラスタ全体のデータ領域用に 2TB HDD（冗長化なし）
- **NIC**: Intel X540-AT2 10Gbps
- **GPU**: MGA G200e
- Proxmox ダッシュボード

![Proxmoxダッシュボード](/assets/blog/0004/proxmox2.webp)

#### サーバー 3 台目のスペック

- **Raspberry Pi 4 Model B Rev 1.5**
- **CPU**: Broadcom BCM2711, quad-core Cortex-A72 1.5GHz
- **RAM**: 4GB
- **DISKS**: 512GB MicroSD のみ
- **NIC**: オンボード 1Gbps
- **GPU**: オンボード
- Proxmox ダッシュボード

![Proxmoxダッシュボード](/assets/blog/0004/proxmox3.webp)

### ネットワーク構成

#### 回線契約

- **契約**: en ひかりクロス & MAP-E(V6 プラス) + 固定 IP オプション
- **プロバイダ**: en ひかり
  夜の混雑する時間でも 6Gbps 程度出るので、満足しています。

### 宅内ネットワーク

宅内のネットワークは、無線 LAN を除いて全て 10Gbps で配線しています。
ただし、ラズパイは MAX 1Gbps なのでここだけやや遅いです。

```text
ONU
  │
  └──> XG-100NE
        ├──> XikeStor 10Gbpsスイッチングハブ (RJ-45) -> 各機器 & メインPCへ
        └──> TP-Link AX1800 (WiFiルーター)
```

### 各サーバーについて

それぞれスペックに合わせて役割を変えています。

### 1 台目サーバー

我が家のインフラの中心的存在。
高負荷サービスを集約していて、**nginx**を使った https リバースプロキシで外部アクセスを制御しています。

- **nginx**: https リバースプロキシ
- **Nextcloud, Jellyfin, Komga**: ファイル共有やメディアストリーミング、電子書籍管理など
- **ArchiveBox**: プライベート Web アーカイブとして、重要な Web ページ(エロ)を保存
- **メールサーバー**: 自宅メールサーバーの運用もここ
- **DNS サーバー**（プライマリ）: 自宅ネットワーク内の DNS を担当
- **プリンター共有サーバー(CUPS)**: プリンターのネットワーク共有
- **このブログ**: 今見ているブログもここでホストされています

その他にも、discord bot など色々動いています。

### 2 台目サーバー

2 台目は主に**監視**や**バックアップ**を担当。

- **InfluxDB & Grafana**: 各サーバーのテレメトリデータを収集し、視覚化して監視
- **Proxmox Backup Server**: クラスタ全体のバックアップをここで管理
- その他の軽負荷サービスもいくつか動いています。

### 3 台目サーバー

このサーバーは、Proxmox クラスタの Quorum ホスト兼セカンダリ DNS サーバーにしてます。

- **DNS サーバー**（セカンダリ）: 1 台目がダウンしてもネットワークが落ちないようにしてます。

#### Proxmox Backup Server について

Proxmox Backup Server は、Proxmox クラスタ全体のバックアップを管理するために使っています。
普通にバックアップを取るよりこっちの方が便利なので使ってます。

![Proxmox Backup Server](/assets/blog/0004/pbs.webp)

#### DNS サーバーについて

AdGuard Home を使って、DNS フィルタリングで広告ブロックを行っています。
また、AdGuardHome-Sync でプライマリとセカンダリの同期を取っています。

![AdGuard Home](/assets/blog/0004/adguard.webp)

### 雑記

ぶっちゃけサーバーが 3 台もあると電気代がヤバい。
夏場とかはサーバールームが地獄の熱さになっちゃうのでエアコンはつけっぱにしないといけない。
この規模の環境動かすのは正直自己満です。ただ、VPS でこの構成組むと普通に電気代払うより高いからまあいいかなって感じ。
そのうちサーバーラックとラックマウントの ATX ケース買って全部まとめたい。
