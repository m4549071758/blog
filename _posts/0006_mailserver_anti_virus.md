---
title: メールサーバーにウイルス対策(ClamAV)を導入する
excerpt: ClamAVを使ってメールサーバーにリアルタイムウイルススキャンを導入する
coverImage: '/assets/blog/0006/clamav.png'
date: '2024-10-23'
ogImage:
  url: '/assets/blog/0006/clamav.png'
tags:
  - 'mail'
  - 'security'
---

# はじめに

最近、Gmail から前回作ったメールサーバーに移行し始めています。

https://qiita.com/katori_m/items/58b9a49b775b7a7c31d1

DKIM や SPF などの対策については行っているものの、送受信するメールに対するウイルス対策が欠けていました。
そこで、Linux ユーザーお馴染みの`ClamAV`を使ってリアルタイムウイルススキャンが出来るようにしたいと思います。

# 使うもの

## ClamAV

https://www.clamav.net/

**比較的**軽量なアンチウイルスエンジン。
軽量とは言っても 1.5GB くらいメモリを喰うので、それなりの空きメモリが必要です。
古くからあり、Linux ユーザーにはお馴染みかと思います。

### システム要件について

https://docs.clamav.net/Introduction.html

> Minimum recommended RAM for ClamAV:
>
> > FreeBSD and Linux server edition: 3 GiB+
> > Linux non-server edition: 3 GiB+
> > Windows 7 & 10 32-bit: 3 GiB+
> > Windows 7 & 10 64-bit: 3 GiB+
> > macOS: 3 GiB+

> Minimum recommended CPU for ClamAV:
>
> > 1 CPU at 2.0 Ghz+

ドキュメントによると、
CPU: 1 コア 2.0GHz 以上
RAM: 3GB + その他のアプリケーション用リソース
とのことなので、軽量とは言ってもかなりリソースを消費します。

## Amavisd

https://wiki.archlinux.jp/index.php/Amavis

メーラーと`ClamAV`を繋ぐためのインターフェース。
SMTP を話せるので、`Postfix`とそのままガッチャンコできます。

# 構築

## インストール

`epel-release`を入れておいてください。

```text:title=console
# dnf install amavisd-new clamd perl-Digest-SHA1 perl-IO-stringy
```

## 設定

### ClamAV

#### 定義ファイル更新

```text
# freshclam
ClamAV update process started at Wed Oct 23 21:12:58 2024
daily.cvd database is up-to-date (version: 27436, sigs: 2067373, f-level: 90, builder: raynman)
main.cvd database is up-to-date (version: 62, sigs: 6647427, f-level: 90, builder: sigmgr)
bytecode.cvd database is up-to-date (version: 335, sigs: 86, f-level: 90, builder: raynman)
```

#### 動作確認

テストウイルスを作成します。
このリンクが不安な方は自分で調べるなり ChatGPT で作るなりしてください。

https://secure.eicar.org/eicar.com

で表示されるテキストを適当なファイル`virus.virus`などに保存して、ホームディレクトリに置きます。
このとき、**Windows Defender などに検知される**ので注意してください。

テストスキャンを実行します。

```text
# clamscan --infected --remove --recursive /home/user
/home/user/virus.virus: Eicar-Signature FOUND
/home/user/virus.virus: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 8699167
Engine version: 1.0.7
Scanned directories: 18
Scanned files: 51
Infected files: 1
Data scanned: 0.09 MB
Data read: 0.05 MB (ratio 1.77:1)
Time: 26.424 sec (0 m 26 s)
Start Date: 2024:10:23 21:16:19
End Date:   2024:10:23 21:16:45
```

検知&削除されれば OK です。

#### /etc/clamd.d/scan.conf

それぞれコメントアウトします。

14 行目

```text
LogFile /var/log/clamd.scan
```

77 行目

```text
PidFile /run/clamd.scan/clamd.pid
```

81 行目

```text
TemporaryDirectory /var/tmp
```

96 行目

```text
LocalSocket /run/clamd.scan/clamd.sock
```

```text
# touch /var/log/clamd.scan
# chown clamscan. /var/log/clamd.scan
# systemctl enable --now clamd@scan
```

### amavisd

#### /etc/amavisd/amavisd.conf

設定ファイル 23 行目

```text
$mydomain = '自分のドメイン名' #例: example.com
```

160, 161 行目
`amavisd`が`Postfix`と喋るための設定です。
`ClamAV`がメールをチェックしたあと、`postfix`の 10025 番ポートに向けてメールをフォワードします。
ポートは変えても大丈夫ですが、この後の`Postfix`の設定で合わせるのを忘れないで下さい。

```text
$notify_method = 'smtp:[127.0.0.1]:10025';
$forward_method = 'smtp:[127.0.0.1]:10025';
```

171 行目

```text
$myhostname = 'メールサーバーのFQDN' #例: mail.example.com
```

### Postfix

#### /etc/postfix/main.cf

設定ファイル 最終行に追記
`amavisd`が listen している 10024 に向けてメールを投げつけます。

```text
content_filter=smtp-amavis:[127.0.0.1]:10024
```

#### /etc/postfix/master.cf

設定ファイル 最終行に追記
`amavisd`にメールを投げたあと、10025 にメールが返ってくるのでそれを listen してあげます。

```text
smtp-amavis unix -    -    n    -    2 smtp
    -o smtp_data_done_timeout=1200
    -o smtp_send_xforward_command=yes
    -o disable_dns_lookups=yes
127.0.0.1:10025 inet n    -    n    -    - smtpd
    -o content_filter=
    -o local_recipient_maps=
    -o relay_recipient_maps=
    -o smtpd_restriction_classes=
    -o smtpd_client_restrictions=
    -o smtpd_helo_restrictions=
    -o smtpd_sender_restrictions=
    -o smtpd_recipient_restrictions=permit_mynetworks,reject
    -o mynetworks=127.0.0.0/8
    -o strict_rfc821_envelopes=yes
    -o smtpd_error_sleep_time=0
    -o smtpd_soft_error_limit=1001
    -o smtpd_hard_error_limit=1000
```

### 自動起動設定 & 起動

```text
# systemctl enable --now amavisd
# systemctl restart postfix
```

# メール送受信テスト

## 送信テスト

ウイルスファイルを添付して送信してみます。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/77d6aec5-cad4-1d76-853e-a0377c10520d.png)

maillog はこのようになります。
removed が表示されていれば送信時のリアルタイムスキャンは OK です。

```text
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: connect from unknown[192.168.1.115]
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: warning: hostname localhost.localdomain does not resolve to address 192.168.1.115
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: connect from unknown[192.168.1.115]
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: Anonymous TLS connection established from unknown[192.168.1.115]: TLSv1.3 with cipher TLS_AES_256_GCM_SHA384 (256/256 bits) key-exchange X25519 server-signature ECDSA (P-256) server-digest SHA256
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: C83AA4E296B: client=unknown[192.168.1.115], sasl_method=LOGIN, sasl_username=example
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: Anonymous TLS connection established from unknown[192.168.1.115]: TLSv1.3 with cipher TLS_AES_256_GCM_SHA384 (256/256 bits) key-exchange X25519 server-signature ECDSA (P-256) server-digest SHA256
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: C83AA4E296B: client=unknown[192.168.1.115], sasl_method=LOGIN, sasl_username=example
Oct 23 21:23:27 localhost postfix/cleanup[2059612]: C83AA4E296B: message-id=<c5da99e8d8cc64ab3cbe28725c482450@example.com>
Oct 23 21:23:27 localhost postfix/cleanup[2059612]: C83AA4E296B: message-id=<c5da99e8d8cc64ab3cbe28725c482450@example.com>
Oct 23 21:23:27 localhost opendkim[690]: C83AA4E296B: DKIM-Signature field added (s=default, d=example.com)
Oct 23 21:23:27 localhost opendkim[690]: C83AA4E296B: DKIM-Signature field added (s=default, d=example.com)
Oct 23 21:23:27 localhost postfix/qmgr[2022765]: C83AA4E296B: from=<example@example.com>, size=1219, nrcpt=1 (queue active)
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: disconnect from unknown[192.168.1.115] ehlo=1 auth=1 mail=1 rcpt=1 data=1 quit=1 commands=6
Oct 23 21:23:28 localhost clamd[2020879]: /var/spool/amavisd/tmp/amavis-20241023T202345-2022049-JAmnKY04/parts/p004: Win.Test.EICAR_HDB-1 FOUND
Oct 23 21:23:27 localhost postfix/qmgr[2022765]: C83AA4E296B: from=<example@example.com>, size=1219, nrcpt=1 (queue active)
Oct 23 21:23:27 localhost postfix/smtpd[2059609]: disconnect from unknown[192.168.1.115] ehlo=1 auth=1 mail=1 rcpt=1 data=1 quit=1 commands=6
Oct 23 21:23:28 localhost clamd[2020879]: /var/spool/amavisd/tmp/amavis-20241023T202345-2022049-JAmnKY04/parts/p004: Win.Test.EICAR_HDB-1 FOUND
Oct 23 21:23:28 localhost clamd[2020879]: /var/spool/amavisd/tmp/amavis-20241023T202345-2022049-JAmnKY04/parts/p002: Win.Test.EICAR_HDB-1 FOUND
Oct 23 21:23:28 localhost clamd[2020879]: /var/spool/amavisd/tmp/amavis-20241023T202345-2022049-JAmnKY04/parts/p002: Win.Test.EICAR_HDB-1 FOUND
Oct 23 21:23:28 localhost amavis[2022049]: (2022049-03) Blocked INFECTED (Win.Test.EICAR_HDB-1) {DiscardedOutbound,Quarantined}, MYNETS LOCAL [192.168.1.115]:48038 <example@example.com> -> <example@example.com>, Queue-ID: C83AA4E296B, Message-ID: <c5da99e8d8cc64ab3cbe28725c482450@example.com>, mail_id: 43NMHgxdfLBE, Hits: -, size: 1614, dkim_sd=default:example.com, 130 ms
Oct 23 21:23:28 localhost amavis[2022049]: (2022049-03) Blocked INFECTED (Win.Test.EICAR_HDB-1) {DiscardedOutbound,Quarantined}, MYNETS LOCAL [192.168.1.115]:48038 <example@example.com> -> <example@example.com>, Queue-ID: C83AA4E296B, Message-ID: <c5da99e8d8cc64ab3cbe28725c482450@example.com>, mail_id: 43NMHgxdfLBE, Hits: -, size: 1614, dkim_sd=default:example.com, 130 ms
Oct 23 21:23:28 localhost postfix/smtp[2059613]: C83AA4E296B: to=<example@example.com>, relay=127.0.0.1[127.0.0.1]:10024, delay=0.34, delays=0.14/0.06/0.01/0.13, dsn=2.7.0, status=sent (250 2.7.0 Ok, discarded, id=2022049-03 - INFECTED: Win.Test.EICAR_HDB-1)
Oct 23 21:23:28 localhost postfix/smtp[2059613]: C83AA4E296B: to=<example@example.com>, relay=127.0.0.1[127.0.0.1]:10024, delay=0.34, delays=0.14/0.06/0.01/0.13, dsn=2.7.0, status=sent (250 2.7.0 Ok, discarded, id=2022049-03 - INFECTED: Win.Test.EICAR_HDB-1)
Oct 23 21:23:28 localhost postfix/qmgr[2022765]: C83AA4E296B: removed
Oct 23 21:23:28 localhost postfix/qmgr[2022765]: C83AA4E296B: removed
```

## 受信テスト

https://www.aleph-tec.com/eicar/

このサイトで受信者名とメールアドレスを入れて、ウイルステストメールを受信します。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/a6e48276-07c0-db49-348c-36306f7e9baa.png)

ログはこのようになります。
remove されていれば受信テストも OK です。

```text
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: connect from batch.outbound.your-site.com[205.233.73.32]
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: connect from batch.outbound.your-site.com[205.233.73.32]
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: Anonymous TLS connection established from batch.outbound.your-site.com[205.233.73.32]: TLSv1.2 with cipher AECDH-AES256-SHA (256/256 bits)
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: B70414E296B: client=batch.outbound.your-site.com[205.233.73.32]
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: Anonymous TLS connection established from batch.outbound.your-site.com[205.233.73.32]: TLSv1.2 with cipher AECDH-AES256-SHA (256/256 bits)
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: B70414E296B: client=batch.outbound.your-site.com[205.233.73.32]
Oct 23 21:28:55 localhost postfix/cleanup[2064118]: B70414E296B: message-id=<202410231228.49NCSOlv456811@eb0e64879f6e.web.vm.your-site.com>
Oct 23 21:28:55 localhost postfix/cleanup[2064118]: B70414E296B: message-id=<202410231228.49NCSOlv456811@eb0e64879f6e.web.vm.your-site.com>
Oct 23 21:28:55 localhost opendkim[690]: B70414E296B: batch.outbound.your-site.com [205.233.73.32] not internal
Oct 23 21:28:55 localhost opendkim[690]: B70414E296B: not authenticated
Oct 23 21:28:55 localhost opendkim[690]: B70414E296B: key retrieval failed (s=key3, d=aleph-tec.com): 'key3._domainkey.aleph-tec.com' query failed
Oct 23 21:28:55 localhost opendkim[690]: B70414E296B: batch.outbound.your-site.com [205.233.73.32] not internal
Oct 23 21:28:55 localhost opendkim[690]: B70414E296B: not authenticated
Oct 23 21:28:55 localhost opendkim[690]: B70414E296B: key retrieval failed (s=key3, d=aleph-tec.com): 'key3._domainkey.aleph-tec.com' query failed
Oct 23 21:28:55 localhost postfix/qmgr[2022765]: B70414E296B: from=<eicar@aleph-tec.com>, size=2820, nrcpt=1 (queue active)
Oct 23 21:28:55 localhost postfix/qmgr[2022765]: B70414E296B: from=<eicar@aleph-tec.com>, size=2820, nrcpt=1 (queue active)
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: disconnect from batch.outbound.your-site.com[205.233.73.32] ehlo=2 starttls=1 mail=1 rcpt=1 data=1 quit=1 commands=7
Oct 23 21:28:55 localhost postfix/smtpd[2064107]: disconnect from batch.outbound.your-site.com[205.233.73.32] ehlo=2 starttls=1 mail=1 rcpt=1 data=1 quit=1 commands=7
Oct 23 21:28:56 localhost clamd[2020879]: SelfCheck: Database status OK.
Oct 23 21:28:56 localhost clamd[2020879]: SelfCheck: Database status OK.
Oct 23 21:28:58 localhost postfix/smtpd[2064140]: connect from localhost[127.0.0.1]
Oct 23 21:28:58 localhost postfix/smtpd[2064140]: connect from localhost[127.0.0.1]
Oct 23 21:28:58 localhost postfix/smtpd[2064140]: E184C4E29BF: client=localhost[127.0.0.1]
Oct 23 21:28:58 localhost postfix/cleanup[2064118]: E184C4E29BF: message-id=<202410231228.49NCSOlv456811@eb0e64879f6e.web.vm.your-site.com>
Oct 23 21:28:58 localhost postfix/smtpd[2064140]: E184C4E29BF: client=localhost[127.0.0.1]
Oct 23 21:28:58 localhost postfix/cleanup[2064118]: E184C4E29BF: message-id=<202410231228.49NCSOlv456811@eb0e64879f6e.web.vm.your-site.com>
Oct 23 21:28:58 localhost opendkim[690]: E184C4E29BF: no signing table match for 'eicar@aleph-tec.com'
Oct 23 21:28:58 localhost opendkim[690]: E184C4E29BF: no signing table match for 'eicar@aleph-tec.com'
Oct 23 21:28:58 localhost opendkim[690]: E184C4E29BF: key retrieval failed (s=key3, d=aleph-tec.com): 'key3._domainkey.aleph-tec.com' query failed
Oct 23 21:28:58 localhost opendkim[690]: E184C4E29BF: key retrieval failed (s=key3, d=aleph-tec.com): 'key3._domainkey.aleph-tec.com' query failed
Oct 23 21:28:59 localhost postfix/qmgr[2022765]: E184C4E29BF: from=<eicar@aleph-tec.com>, size=3437, nrcpt=1 (queue active)
Oct 23 21:28:59 localhost postfix/qmgr[2022765]: E184C4E29BF: from=<eicar@aleph-tec.com>, size=3437, nrcpt=1 (queue active)
Oct 23 21:28:59 localhost postfix/smtpd[2064140]: disconnect from localhost[127.0.0.1] ehlo=1 mail=1 rcpt=1 data=1 quit=1 commands=5
Oct 23 21:28:59 localhost postfix/smtpd[2064140]: disconnect from localhost[127.0.0.1] ehlo=1 mail=1 rcpt=1 data=1 quit=1 commands=5
Oct 23 21:28:59 localhost amavis[2022050]: (2022050-03) Passed CLEAN {RelayedInbound}, [205.233.73.32]:43215 [205.233.73.32] <eicar@aleph-tec.com> -> <example@example.dev>, Queue-ID: B70414E296B, Message-ID: <202410231228.49NCSOlv456811@eb0e64879f6e.web.vm.your-site.com>, mail_id: 3AcQKIKbmowb, Hits: -4.216, size: 2851, queued_as: E184C4E29BF, 3022 ms
Oct 23 21:28:59 localhost amavis[2022050]: (2022050-03) Passed CLEAN {RelayedInbound}, [205.233.73.32]:43215 [205.233.73.32] <eicar@aleph-tec.com> -> <example@example.dev>, Queue-ID: B70414E296B, Message-ID: <202410231228.49NCSOlv456811@eb0e64879f6e.web.vm.your-site.com>, mail_id: 3AcQKIKbmowb, Hits: -4.216, size: 2851, queued_as: E184C4E29BF, 3022 ms
Oct 23 21:28:59 localhost postfix/smtp[2064119]: B70414E296B: to=<example@example.dev>, relay=127.0.0.1[127.0.0.1]:10024, delay=3.3, delays=0.23/0.05/0.01/3, dsn=2.0.0, status=sent (250 2.0.0 from MTA(smtp:[127.0.0.1]:10025): 250 2.0.0 Ok: queued as E184C4E29BF)
Oct 23 21:28:59 localhost postfix/smtp[2064119]: B70414E296B: to=<example@example.dev>, relay=127.0.0.1[127.0.0.1]:10024, delay=3.3, delays=0.23/0.05/0.01/3, dsn=2.0.0, status=sent (250 2.0.0 from MTA(smtp:[127.0.0.1]:10025): 250 2.0.0 Ok: queued as E184C4E29BF)
Oct 23 21:28:59 localhost postfix/qmgr[2022765]: B70414E296B: removed
Oct 23 21:28:59 localhost postfix/qmgr[2022765]: B70414E296B: removed
Oct 23 21:28:59 localhost postfix/local[2064142]: E184C4E29BF: to=<example@example.dev>, relay=local, delay=0.15, delays=0.11/0.01/0/0.03, dsn=2.0.0, status=sent (delivered to maildir)
Oct 23 21:28:59 localhost postfix/local[2064142]: E184C4E29BF: to=<example@example.dev>, relay=local, delay=0.15, delays=0.11/0.01/0/0.03, dsn=2.0.0, status=sent (delivered to maildir)
Oct 23 21:28:59 localhost postfix/qmgr[2022765]: E184C4E29BF: removed
Oct 23 21:28:59 localhost postfix/qmgr[2022765]: E184C4E29BF: removed
```

# 参考にしたサイト

https://www.server-world.info/query?os=CentOS_8&p=mail&f=7
