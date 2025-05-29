# Claude Code Action プロジェクト

このプロジェクトはClaude Code Action (CCA) とPlaywright MCPを使用した包括的な開発支援システムです。

## 🚀 機能

### 🤖 Claude開発支援
- Claude Code Actionによる自動コードレビュー
- AIによるコード改善提案
- 自動テスト実行
- CLI開発アシスタント

### 🎭 Playwright MCP統合
- **ブラウザ自動化**: Claudeが直接ブラウザを操作
- **リアルタイムテスト**: Webアプリのテスト・デバッグ
- **スクリーンショット**: 自動的な画面キャプチャ
- **要素操作**: クリック、入力、テキスト取得
- **JavaScript実行**: ページ内でのスクリプト実行

## 📦 セットアップ

### 1. 基本インストール
```bash
# リポジトリをクローン
git clone <repository-url>
cd claude-code-action-project

# 依存関係をインストール
npm install

# Playwright MCPの依存関係をインストール
npm run mcp:install

# Playwrightブラウザをインストール
npm run playwright:install
```

### 2. 環境変数設定
```bash
# Claude API キーを設定
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 3. MCP設定（Claude Desktop用）
`mcp-config.json`をClaude Desktopの設定に追加：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["./playwright-mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🎯 使用方法

### Claude開発アシスタント
```bash
# コードレビュー
npm run claude:review index.js

# 機能実装
npm run claude:implement "新しい機能の説明"

# リファクタリング提案
npm run claude:refactor index.js

# テストケース生成
npm run claude:test index.js
```

### Playwright MCP
```bash
# MCPサーバー起動
npm run mcp:playwright

# Claude Desktopから以下の操作が可能：
# - ブラウザ起動
# - ページナビゲーション
# - 要素クリック・入力
# - スクリーンショット撮影
# - JavaScript実行
```

### GitHub Actions
プルリクエストを作成すると、以下が自動実行されます：
- テスト実行
- コード品質チェック
- 自動レビューコメント

## 🛠️ 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm start` | アプリケーション起動 |
| `npm test` | テスト実行 |
| `npm run claude:review <file>` | コードレビュー |
| `npm run claude:implement "<description>"` | 機能実装 |
| `npm run claude:refactor <file>` | リファクタリング提案 |
| `npm run claude:test <file>` | テストケース生成 |
| `npm run mcp:playwright` | Playwright MCPサーバー起動 |

## 🎭 Playwright MCP機能詳細

### ブラウザ操作
- **launch_browser**: ブラウザ起動（ヘッドレス/GUI選択可能）
- **navigate**: 指定URLへの移動
- **click**: 要素クリック
- **type**: テキスト入力
- **screenshot**: スクリーンショット撮影

### 情報取得
- **get_text**: 要素のテキスト取得
- **wait_for_element**: 要素の表示待機
- **evaluate**: JavaScript実行

### 使用例
```javascript
// Claude Desktopで以下のような指示が可能：
// "ブラウザを起動してGoogleに移動し、検索ボックスに'Claude MCP'と入力してスクリーンショットを撮って"
```

## 🔧 開発

### テスト実行
```bash
# 全テスト実行
npm test

# Playwright MCPテスト
npm test playwright-mcp.test.js
```

### 新機能追加
1. GitHub Issueを作成
2. `@claude` コメントで開発指示
3. プルリクエスト作成
4. 自動テスト・レビュー実行

## 📚 技術スタック

- **Node.js**: ランタイム環境
- **Jest**: テストフレームワーク
- **Playwright**: ブラウザ自動化
- **Claude API**: AI開発支援
- **GitHub Actions**: CI/CD
- **MCP**: Model Context Protocol

## 🤝 貢献

1. Forkしてブランチを作成
2. 変更を実装
3. テストを追加
4. プルリクエストを作成

## 📄 ライセンス

MIT License
