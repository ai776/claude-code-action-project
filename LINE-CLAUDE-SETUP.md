# 📱 LINE → Claude Code Action セットアップガイド

LINEメッセージから直接Claude Code Actionを実行できるシステムの構築方法です。

## 🎯 システム概要

```
LINE Bot → Google Apps Script → GitHub Issues → Claude Code Action
```

1. **LINEでメッセージ送信** → `"claude レビューして"`
2. **Google Apps Scriptが受信** → GitHub Issueを自動作成
3. **GitHub Actionsが実行** → @claude機能が動作
4. **Claudeが自動応答** → GitHub Issueにコメント投稿

## 🛠️ セットアップ手順

### 1. LINE Bot作成

#### 1.1 LINE Developers Console
1. [LINE Developers](https://developers.line.biz/) にアクセス
2. 新しいプロバイダーを作成
3. Messaging API チャンネルを作成

#### 1.2 必要な情報を取得
```
Channel Access Token: 長期トークンを発行
Channel Secret: 基本設定から取得
```

### 2. Google Apps Script設定

#### 2.1 新しいプロジェクト作成
1. [Google Apps Script](https://script.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. `line-claude-bridge.js` のコードを貼り付け

#### 2.2 プロパティ設定
```javascript
// スクリプトエディタで実行
function setupProperties() {
  const props = PropertiesService.getScriptProperties();

  props.setProperties({
    'LINE_ACCESS_TOKEN': 'YOUR_LINE_CHANNEL_ACCESS_TOKEN',
    'GH_OWNER': 'ai776',  // GitHubユーザー名
    'GH_REPO': 'claude-code-action-project',  // リポジトリ名
    'GH_TOKEN': 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN',
    'SPREADSHEET_ID': 'YOUR_GOOGLE_SPREADSHEET_ID'  // ログ用（オプション）
  });
}
```

#### 2.3 Webアプリとしてデプロイ
1. 「デプロイ」→「新しいデプロイ」
2. 種類：「ウェブアプリ」
3. 実行者：「自分」
4. アクセス：「全員」
5. デプロイしてWebアプリURLを取得

### 3. GitHub設定

#### 3.1 Personal Access Token作成
1. GitHub Settings → Developer settings → Personal access tokens
2. 必要な権限：
   - `repo` (リポジトリへのフルアクセス)
   - `issues` (Issueの作成・編集)

#### 3.2 Claude Code Actionリポジトリ確認
- `claude-code-action-project` リポジトリが存在することを確認
- GitHub Actionsワークフローが正常動作することを確認

### 4. LINE Bot Webhook設定

#### 4.1 Webhook URL設定
1. LINE Developers Console → Messaging API設定
2. Webhook URL: `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL`
3. Webhook利用：「オン」
4. 検証：「無効」（Google Apps Scriptでは署名検証を省略）

#### 4.2 応答設定
- 応答メッセージ：「オフ」
- あいさつメッセージ：「オフ」
- Webhook：「オン」

### 5. Google Sheets ログ設定（オプション）

#### 5.1 スプレッドシート作成
1. 新しいGoogle Sheetsを作成
2. スプレッドシートIDをコピー（URLの一部）
3. Google Apps ScriptのプロパティにSPREADSHEET_IDを設定

## 🧪 テスト方法

### 1. LINE Botを友達追加
QRコードまたはBot IDで友達追加

### 2. メッセージ送信テスト
```
claude レビューして
→ GitHub Issueが作成され、Claude Code Actionが実行される

playwright test
→ Playwrightテストが実行される

help
→ 使い方ガイドが表示される
```

### 3. 動作確認
1. LINEで応答メッセージを確認
2. GitHubでIssueが作成されているか確認
3. GitHub ActionsでClaude応答が投稿されるか確認

## 📋 利用可能なコマンド

### Claude関連
```
claude レビューして
claude 機能追加して
claude 現在の状況は？
claude バグを修正して
```

### Playwright関連
```
playwright test
playwright help
playwright generate https://example.com
```

### 一般
```
help / ヘルプ
→ 使い方を表示

普通のメッセージ
→ 自動的に@claudeが付与される
```

## 🔧 カスタマイズ

### 設定変更
```javascript
const CONF = {
  CLAUDE_REPO: 'your-repo-name',     // デフォルトリポジトリ
  ENABLE_AUTO_CLAUDE: true,          // 自動@claude付与
  ENABLE_RICH_REPLY: true,           // リッチな返信
};
```

### ラベル追加
GitHub Issueに自動的に以下のラベルが付与されます：
- `line-bot`
- `auto-generated`

## 🚨 トラブルシューティング

### よくある問題

#### 1. LINE Botが応答しない
- Webhook URLが正しく設定されているか確認
- Google Apps Scriptがデプロイされているか確認
- LINE_ACCESS_TOKENが正しく設定されているか確認

#### 2. GitHub Issueが作成されない
- GH_TOKENの権限を確認
- リポジトリ名（GH_OWNER/GH_REPO）を確認
- Google Apps Scriptのログを確認

#### 3. Claude Code Actionが動作しない
- GitHub Actionsワークフローが有効か確認
- @claudeコメントが正しく投稿されているか確認
- ANTHROPIC_API_KEYが設定されているか確認

### ログ確認方法
1. Google Apps Script → 実行ログ
2. Google Sheets → ログスプレッドシート
3. GitHub → Actions タブ

## 🎉 完成！

これでLINEから直接Claude Code Actionを実行できるようになりました！

**使用例:**
```
LINE: "claude このコードをレビューして"
↓
GitHub Issue作成: "@claude このコードをレビューして"
↓
Claude Code Action実行
↓
GitHub Issue応答: "🤖 Claude からの返答..."
```

## 🔗 関連リンク

- [LINE Developers](https://developers.line.biz/)
- [Google Apps Script](https://script.google.com/)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [Claude Code Action Project](https://github.com/ai776/claude-code-action-project)
