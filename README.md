# Messenger Desktop

Facebook Messenger専用のデスクトップアプリケーション。Electronを使用してMac、Windows、Linux向けにビルド可能です。

## 機能

- **WebViewでMessengerを表示**: messenger.comを内蔵ブラウザで表示
- **ネイティブ通知**: デスクトップ通知をサポート
- **未読バッジ**: macOSのDockアイコンに未読数を表示
- **システムトレイ**: Windows/Linuxでシステムトレイに常駐
- **キーボードショートカット**: 新規会話（Cmd/Ctrl+N）など
- **外部リンク**: Messenger/Facebook以外のリンクはデフォルトブラウザで開く

## 必要条件

- Node.js 18以上
- pnpm（推奨）またはnpm

## インストール

```bash
# 依存関係のインストール
pnpm install

# 開発モードで起動
pnpm start
```

## ビルド

### macOS向け
```bash
pnpm run build:mac
```
出力: `dist/` ディレクトリに `.dmg` と `.zip` ファイルが生成されます。

### Windows向け
```bash
pnpm run build:win
```
出力: `dist/` ディレクトリに `.exe` インストーラーが生成されます。

### Linux向け
```bash
pnpm run build:linux
```
出力: `dist/` ディレクトリに `.AppImage` と `.deb` ファイルが生成されます。

### 全プラットフォーム向け
```bash
pnpm run build
```

## プロジェクト構造

```
messenger-desktop/
├── main.js          # Electronメインプロセス
├── preload.js       # プリロードスクリプト
├── package.json     # プロジェクト設定
├── icons/           # アプリアイコン
│   ├── icon.png     # 元画像
│   ├── icon.icns    # macOS用
│   ├── icon.ico     # Windows用
│   └── icon-*.png   # 各サイズ（Linux用）
└── README.md        # このファイル
```

## 注意事項

- このアプリはFacebookの公式アプリではありません
- Messengerの利用にはFacebookアカウントが必要です
- 初回起動時にFacebookへのログインが必要です

## ライセンス

MIT License
