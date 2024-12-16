---
title: 'ZFS RAIDにキャッシュデバイスを追加'
excerpt: 'ZILとL2ARCを追加して、パフォーマンスを向上'
coverImage: '/assets/blog/0009/001.webp'
date: '2024-11-19'
ogImage:
  url: '/assets/blog/0009/001.webp'
tags:
  - '自宅サーバー'
---

## ZFS RAIDについて
現在、自宅のサーバーのメインストレージは`ZFS RAIDZ`による冗長化を行っています。

https://openzfs.github.io/openzfs-docs/Basic%20Concepts/RAIDZ.html

ZFSではリードキャッシュをARCアルゴリズムで保持しています。
デフォルト設定では、
ARCキャッシュ最大値: ホストメモリの1/2 = 128/2 = 64GB
ARCキャッシュ最小値: ホストメモリの1/32 = 128/32 = 4GB
となっており、最大までメモリを喰われるとかなりリソースを持っていかれます。
もちろん自動でキャッシュ解放されるのでシステムごと落ちたりはしませんが、常時メモリ使用量が多い状態になるのは不愉快です。
そのため、現在はARCキャッシュ最大値を32GBに設定しています。

## ZILとL2ARCとキャッシュについて

https://docs.oracle.com/cd/E37932_01/html/E36674/chapterzfs-flash.html

### ハイブリッドキャッシュ
従来のRAIDと違い、ZFSは`Hybrid Storage Pool`を採用しています。
保存デバイスとは別に、SSDなど高速なドライブをキャッシュデバイスとして指定するだけで勝手に使ってくれます。

### ZIL
コピーオンライト方式で動作するZFSは、トランザクションを発行する際にトランザクションログを生成します。
これを`Zfs Intent Log`と呼びます。一般的なファイルシステムで言うところのジャーナルです。
このZILをSSDなどの高速なストレージに置くことで書き込み性能が向上します。
またZILを外部デバイスに置くことで`Separate Intent LOG`、つまり`SLOG`へと名前が変わります。
最大で物理メモリの1/2まで割り当てられます。

::: note warn
Oracleのリファレンスマニュアルによると、信頼性のためにミラーリングデバイスまたはバッテリーとメモリ付きのSSDに展開することが強く推奨されています。
しかし、今回はリソースの問題でシングルドライブに設定します。
:::

### L2ARC
ZFSの二次リードキャッシュになります。
ARCキャッシュがメモリに乗り切れない場合、L2ARCにデータが保存されます。
今回L2ARCを多めに取っているので、メモリ側のARCキャッシュ量を少し減らそうと思います。

::: note info
L2ARCのデータは喪失しても問題ないため、特に冗長化は必要ありません。
:::


## 実装
### キャッシュデバイスに容量割り当て
今回はNVMe SSDに64GB分空き容量を作成し、16GBをZIL、残りの48GBをL2ARCとして使用します。

### キャッシュデバイスの追加
書式
`zpool add <pool> <log|cache> </dev/device>`
```text: console
# zpool add RAID log /dev/nvme0np4
# zpool add RAID cache /dev/nvme0np5
```

### 追加したデバイスの確認
```text: console
# zpool status
  pool: RAID
 state: ONLINE
  scan: scrub repaired 0B in 01:42:02 with 0 errors on Sun Nov 10 02:06:08 2024
config:

        NAME                                            STATE     READ WRITE CKSUM
        RAID                                            ONLINE       0     0     0
          raidz1-0                                      ONLINE       0     0     0
            ata-TOSHIBA_DT01ABA100V_37610P8NS           ONLINE       0     0     0
            ata-WDC_WD10EURX-63UY4Y0_WD-WCC4J6UZ6ZT2    ONLINE       0     0     0
            ata-TOSHIBA_DT01ABA100V_23DE8DENS           ONLINE       0     0     0
            ata-WDC_WD1005FBYZ-01YCBB2_WD-WMC6M0J8HWZ5  ONLINE       0     0     0
            ata-WDC_WD10EURX-63UY4Y0_WD-WCC4J7HU67TN    ONLINE       0     0     0
            ata-WDC_WD10EFRX-68FYTN0_WD-WCC4J2DAUT4Z    ONLINE       0     0     0
        logs
          nvme0n1p4                                     ONLINE       0     0     0
        cache
          nvme0n1p5                                     ONLINE       0     0     0

errors: No known data errors
```

`logs`がZIL、`cache`がL2ARCです。

### キャッシュ利用状況
ファイルサーバーでアクセスを行い、負荷をかけてみます。
```text: console
# zpool iostat -v
                                                  capacity     operations     bandwidth 
pool                                            alloc   free   read  write   read  write
----------------------------------------------  -----  -----  -----  -----  -----  -----
RAID                                            2.22T  3.23T    121  1.18K   817K  28.5M
  raidz1-0                                      2.22T  3.23T    121  1.07K   817K  14.6M
    ata-TOSHIBA_DT01ABA100V_37610P8NS               -      -     24    247   160K  2.47M
    ata-WDC_WD10EURX-63UY4Y0_WD-WCC4J6UZ6ZT2        -      -     16    178   110K  2.39M
    ata-TOSHIBA_DT01ABA100V_23DE8DENS               -      -     23    209   162K  2.47M
    ata-WDC_WD1005FBYZ-01YCBB2_WD-WMC6M0J8HWZ5      -      -     18    117   112K  2.42M
    ata-WDC_WD10EURX-63UY4Y0_WD-WCC4J7HU67TN        -      -     22    173   164K  2.47M
    ata-WDC_WD10EFRX-68FYTN0_WD-WCC4J2DAUT4Z        -      -     16    166   110K  2.40M
logs                                                -      -      -      -      -      -
  nvme0n1p4                                     1.01G  14.5G      0    114      3  14.0M
cache                                               -      -      -      -      -      -
  nvme0n1p5                                     3.02G  44.6G      0      5     66   447K
----------------------------------------------  -----  -----  -----  -----  -----  -----
```

両方とも動作しているのがわかると思います。

![ZFSキャッシュ](/assets/blog/0009/001.webp)

## おわり
ベンチマーク取るのを完全に忘れていたので体感ですが、Nextcloudでのアップロードやサムネイルの表示などが4割マシくらいで速くなった気がします。

## 参考サイト
https://docs.oracle.com/cd/E37932_01/html/E36674/chapterzfs-flash.html

https://qiita.com/n-eguchi/items/0c71e69ed61e954ee169#zfs%E3%81%AE%E3%82%AD%E3%83%A3%E3%83%83%E3%82%B7%E3%83%A5%E3%81%AE%E8%A9%B1

https://kusanagi.dht-jpn.co.jp/2020/10/miyazaki-2020-10-27/