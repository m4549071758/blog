---
title: 'MobaXtermのススメ'
excerpt: 'いい感じに便利なSSHクライアントについて'
coverImage: '/assets/blog/0002/0002_mobaxterm.png'
date: '2024-10-13'
ogImage:
  url: '/assets/blog/0002/0002_mobaxterm.png'
tags:
  - 'ssh'
  - '便利ツール'
---

# はじめに

皆さま、SSH してますか？
SSH クライアント、使ってますか？
Tera Term はセッションの複数保存ができないし、Putty はちょっと古臭い。
RLogin はどっちも満たしているけどファイル転送ウィンドウが使いにくい......

今使っているクライアントにちょびっと不満があって、なおかつイイカンジの SSH クライアントをお探しのそこのあなた、おすすめがございます。

## MobaXterm

https://mobaxterm.mobatek.net/

SSH クライアントのようであり、VNC クライアントのようであり、WSL のコンソールのようであり、FTP クライアントのような不思議な Windows 用ソフトです。
基本的に私は SSH クライアントとして使っています。
Putty よろしく KeyGen 機能もついています。

# 導入

上記の公式ページからダウンロードしてきてインストーラー起動するだけです。
簡単。

# 設定

いろいろと便利な機能やら設定やらがあります。

## セッション設定

起動したらまず左上のセッションボタンからセッション設定を開きましょう。

![68747470733a2f2f71696974612d696d6167652d73746f72652e73332e61702d6e6f727468656173742d312e616d617a6f6e6177732e636f6d2f302f3533323032352f61636435333731362d333533622d326661372d363731372d6638663238333365343639302e706e67.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/6b2c4254-24ca-5875-2612-e851c0d121c7.png)

セッション設定が開くとなにやら SSH やら VNC やら S3 やらと見え、わくわくしてきますがおとなしく SSH を押します。
私は無料版のセッション保存数いっちゃってるので怒られてますね。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/52d8cd98-4503-9e46-0a8e-b14a02df20eb.png)

### マスターパスワード設定

`Remote Host`を設定するその前に、`Specify username`のチェックボックスにチェックをつけ、その右にあるユーザーアイコンを押します。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/675da6b3-24fc-d951-cb7b-6e86d348c075.png)

ユーザーアイコンを押すとパスワードマネージャーが開くので、まずは`Master Password Settings`でマスターパスワードを設定します。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/4d2be7c2-d7ec-fb83-ebda-d64c223a229b.png)
マスターパスワードを入力したら、OK を押しましょう。
このマスターパスワードは、パスワードマネージャーのユーザー名とパスワードを復号するときに使うので忘れるとまあまあ困ります。

### ユーザー名&パスワード保存

パスワードマネージャーに戻ってきたら、`New`ボタンを押して資格名、ユーザー名、パスワードを設定してあげましょう。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/8ad0c16a-9adc-3e64-975e-6237dd7f5747.png)

### セッション設定へ反映

ユーザー名とパスワードを保存出来たらセッション設定ウィンドウまで戻り、`Remote Host`やら`Advanced SSH Settings`やらを埋めてあげましょう。
ちなみに`Network Settings`から踏み台ログインの設定もできますが、踏み台を使っているときは SFTP のペインは表示されません。
公開鍵認証をしたい場合は`Use Private Key`にチェックを入れて秘密鍵を選んであげれば OK です。
OPEN SSH 形式でないと使えないのであしからず。

最後に、`Specify username`の隣にあるドロップダウンメニューを開き、先ほど保存してあげた資格名を選んであげましょう。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/c2e3a558-37c1-966f-94a5-0ec29fb18337.png)

ここまで設定が終わったら OK を押して保存しましょう。

# 接続

セッション設定ウィンドウが閉じたら左側のペインに保存したセッションがあると思うので、ダブルクリックで接続します。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/532025/aa8ab623-795e-3fe6-77d0-65656c04a032.png)

接続すると、左ペインに SFTP ウィンドウが、右ペインにコンソールが開きます。
もしサーバー側で X11 が動いていれば X 転送が使えます。
SFTP ウィンドウ下の`Remote Monitoring`を押すと、画像下のほうに映っているような監視ウィンドウがポップします。
SSH に関しては基本的にはこれで以上です。

# その他

ほかにはシリアル接続だったりシェルエミュレーターだったりが使えます。
残念ながら日本語非対応ですが、Putty からセッションをインポートできたり、再インストール時用にパスワードやらセッション設定やらをエクスポートできます。
エクスポートされたファイルはマスターパスワードで暗号化されているのでインポート先で復号すれば元通りです。

それでは、よしなに。
