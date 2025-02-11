---
title: 'PDFの編集アプリをセルフホストして怪レいオンラインアプリから脱却しよう'
excerpt: 'オンラインPDFソリューション'
coverImage: '/assets/blog/dynamic-routing/cover.webp'
date: '2025-02-11'
ogImage:
  url: '/assets/blog/dynamic-routing/cover.webp'
tags:
  - '自宅サーバー'
  - 'セルフホスト'
---

## PDF の編集ツール

会社貸与の PC などには Acrobat が入っているけど、自宅 PC でわざわざ PDF の編集ツールに金を出すのはアレなのでよくわからないオンラインツールで PDF を編集したり、ファイルを変換したりしている人がいると思います。
ただ、同時に変換したり編集したりできるファイル数に制約があったり、1 日 2 ファイルまでしか使えなかったり、データが本当に安全なのかわからなかったりといろいろ不便なところがあるので、`Stirling PDF`をセルフホストしてセキュアかつ便利に編集できる環境を作っていきます。

## Stirling PDF

Java 製の PDF ソリューションです。
Windows・Linux・Mac で動作します。

https://www.stirlingpdf.com/

その辺に転がってるオンラインツールでできそうなことは大体ぜんぶできます。

![image.png](/assets/blog/0013/001.webp)

## 構築

Docker で一発で終わらせたい人はここ見てやればいいと思います。

https://docs.stirlingpdf.com/Installation/Docker%20Install/

今回は全部自分で構築します。

https://docs.stirlingpdf.com/Installation/Unix%20Installation

### 前提ソフトウェア

Stirling PDF の前提ソフトウェアは次の通りです。

- Java 17 以降 (21 を推奨)
- Gradle 7.0 以降
- Git
- Python 3.8 + pip

### インストール

```text:console
$ sudo dnf config-manager --set-enabled crb
$ sudo dnf install -y git java-21-openjdk python3 python3-pip epel-release
```

#### OCR

OCR 機能を使用するために、jbig2enc を snap からインストールします。

```text:console
$ sudo dnf install snapd
$ sudo systemctl enable --now snapd.socket
$ sudo ln -s /var/lib/snapd/snap /snap
$ sudo snap install jbig2enc --edge
```

#### 追加のソフトウェア

ファイル変換機能を利用するために`LibreOffice`を、OCR のために`tesseract`を、パターン認識のために`opencv`をインストールします。

```text:console
$ sudo dnf install -y libreoffice-writer libreoffice-calc libreoffice-impress tesseract
$ pip3 install uno opencv-python-headless unoconv pngquant WeasyPrint
```

#### Stirling PDF のビルド

本体をビルドします。

```text:console
$ cd ~/.git && git clone https://github.com/Stirling-Tools/Stirling-PDF.git && cd Stirling-PDF && chmod +x ./gradlew && ./gradlew build
```

ビルドが完了したら、ファイルを移動します。

```text:console
$ sudo mkdir /opt/Stirling-PDF && sudo mv ./build/libs/Stirling-PDF-*.jar /opt/Stirling-PDF/ && sudo mv scripts /opt/Stirling-PDF/
```

#### OCR のサポート言語追加

一括で全言語をサポートしたい場合は次のコマンドを実行します。

```text:console
$ sudo dnf install -y tesseract-langpack-*
```

今回は日本語と英語を追加します。

```text:console
$ sudo dnf install -y tesseract-langpack-jpn tesseract-langpack-eng
```

#### サービス登録

Stirling PDF をサービスとして登録します。
.env ファイルを作成します。

```text:console
$ touch /opt/Stirling-PDF/.env
```

サービスファイルを作ります。

```text:/etc/systemd/system/stirlingpdf.service
[Unit]
Description=Stirling-PDF service
After=syslog.target network.target

[Service]
SuccessExitStatus=143

User=root
Group=root

Type=simple

EnvironmentFile=/opt/Stirling-PDF/.env
WorkingDirectory=/opt/Stirling-PDF
ExecStart=/usr/bin/java -jar Stirling-PDF-0.17.2.jar
ExecStop=/bin/kill -15 $MAINPID

[Install]
WantedBy=multi-user.target
```

デーモンを再読み込みして、サービスを起動します。

```text:console
$ sudo systemctl daemon-reload
$ sudo systemctl enable --now stirlingpdf
```

これで完了です。

## おわり

ファイル数制限とかに縛られずファイルをいじれるようになりました。
