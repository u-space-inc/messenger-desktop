# AGENTS.md

このリポジトリは **Electron 製の Facebook Messenger デスクトップアプリ**です。`BrowserWindow` で `https://www.messenger.com` を表示し、メニュー/トレイ/未読バッジなどを提供します。

## 開発の前提

- **Node.js**: 18 以上（README に準拠）
- **パッケージマネージャ**: `pnpm`（`package.json` の `packageManager` は `pnpm@10.26.0`）

## よく使うコマンド

- **依存関係のインストール**:
  - `pnpm install`
- **開発起動**:
  - `pnpm start`（`electron .`）
- **ビルド（electron-builder）**:
  - `pnpm run build`
  - `pnpm run build:mac`
  - `pnpm run build:win`
  - `pnpm run build:linux`
  - 出力先は `dist/`

> 注意: いまの `package.json` の `build.files` には `index.html` / `styles.css` が含まれますが、リポジトリ直下には存在しません。ファイルを追加するか、不要なら `build.files` から削除するのが安全です。

## 主要ファイルと役割

- `main.js`
  - Electron **メインプロセス**のエントリポイント
  - `BrowserWindow` 作成、外部リンク制御、メニュー、トレイ、未読バッジ（macOS Dock）など
- `preload.js`
  - **preload スクリプト**
  - `contextBridge.exposeInMainWorld('electronAPI', ...)` で最小限の API を公開
- `package.json`
  - スクリプト、`electron-builder` のビルド設定（`build` セクション）
- `icons/`
  - アプリアイコン一式（macOS/Windows/Linux 用）

## 実装上の重要な制約（壊しやすい箇所）

- **セキュリティ設定は維持すること**
  - `nodeIntegration: false`
  - `contextIsolation: true`
  - `sandbox: true`
  - `preload` 経由で必要最小限の機能のみ公開する（`window` へ生の `ipcRenderer` 等を出さない）
- **外部リンクの扱い**
  - Messenger/Facebook 以外はアプリ内で開かず、既定ブラウザへ（`setWindowOpenHandler` と `will-navigate`）
  - 追加ドメインを許可する場合は、ホワイトリストの根拠と影響範囲（セキュリティ/フィッシング/UX）を明記する
- **通知**
  - `preload.js` は Web Notification を前提に権限要求を補助しているため、挙動変更は慎重に行う

## 変更の指針（エージェント向け）

- **UI は基本的に messenger.com 側**なので、アプリ側の変更は「ウィンドウ挙動」「外部リンク制御」「OS 統合（トレイ/バッジ/ショートカット）」が中心になります。
- `main.js` の `webPreferences` を変更する場合は、セキュリティ設定が後退していないか必ず確認してください。
- 新しいローカル資材（HTML/CSS/画像等）を追加してパッケージに含める場合は、`package.json` の `build.files` を更新します。

## テスト/品質

現状、lint/test の専用スクリプトはありません。変更後は最低限:

- `pnpm start` で起動できること
- 外部リンクが意図通りに既定ブラウザへ飛ぶこと
- Windows/Linux でトレイが動作すること（可能なら）
- macOS で未読バッジが更新されること（可能なら）

