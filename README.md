# Roma Travel Notes（GitHub Pages用）

## ファイル構成

- `index.html`：トップページ
- `schedule.html`：スケジュール表
- `spots.html`：観光スポット一覧
- `reservations.html`：予約の要否リスト・確認チェックリスト
- `css/style.css`：全ページ共通のデザイン
- `js/main.js`：モバイルメニュー、スポット絞り込み、予約チェックリスト

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成します。
2. このZIPを展開し、中のファイルとフォルダをリポジトリ直下にアップロードします（ZIPファイルそのものを置くだけでは公開されません）。
3. リポジトリの **Settings → Pages** を開きます。
4. Build and deployment の Source で **Deploy from a branch** を選び、Branch を `main`、フォルダを `/(root)` にして保存します。
5. 公開処理が終わったら、表示されたGitHub PagesのURLを友人に共有します。

## 更新方法

- 日程やスポットの説明：各HTMLファイルを編集します。
- 色・余白・レイアウト：`css/style.css` を編集します。
- 絞り込みやチェックリストの動作：`js/main.js` を編集します。
- 予約チェックの状態は各閲覧者のブラウザ内に保存され、友人同士では同期されません。

## 注意

予約条件・入場料金・営業時間は変更される場合があります。記載内容は旅程を考えるためのたたき台です。購入前に各施設の公式サイトで最新情報を確認してください。
