/**
 * LINE → Claude Code Action Bridge (Enhanced版)
 * LINEメッセージを受信してGitHub Issueを作成し、@claude機能を自動実行
 * @license MIT
 */

/* ---------- 設定 ---------- */
const CONF = {
  LINE_ACCESS_TOKEN:   PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN'),
  GH_OWNER:            PropertiesService.getScriptProperties().getProperty('GH_OWNER'),
  GH_REPO:             PropertiesService.getScriptProperties().getProperty('GH_REPO'),
  GH_TOKEN:            PropertiesService.getScriptProperties().getProperty('GH_TOKEN'),
  SPREADSHEET_ID:      PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),

  // Claude Code Action 固有設定
  CLAUDE_REPO:         'claude-code-action-project', // デフォルトリポジトリ
  ENABLE_AUTO_CLAUDE:  true,  // @claudeを自動付与するか
  ENABLE_RICH_REPLY:   true,  // リッチな返信を有効にするか
};

/* ---------- エントリポイント ---------- */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Empty POST body');

    const payload = JSON.parse(e.postData.contents);
    if (!payload.events || !Array.isArray(payload.events)) throw new Error('Invalid LINE payload');

    payload.events
      .filter(evt => evt.type === 'message' && evt.message && evt.message.type === 'text')
      .forEach(evt => handleTextMessage(evt));

    return ContentService.createTextOutput('OK');
  } catch (err) {
    console.error(`doPost error: ${err.message}\n${err.stack}`);
    logToSheet({ status: 'ERROR', message: err.message });
    return ContentService.createTextOutput('Error').setHttpStatusCode(500);
  }
}

/* ---------- メッセージ処理（強化版） ---------- */
function handleTextMessage(event) {
  const userText = (event.message.text || '').trim();
  if (!userText) return;

  // コマンド解析
  const command = parseCommand(userText);

  let issueTitle, issueBody, issueUrl;

  switch (command.type) {
    case 'claude':
      issueTitle = `@claude ${command.content}`;
      issueBody = createClaudeIssueBody(command.content, event);
      break;

    case 'playwright':
      issueTitle = `@playwright ${command.content}`;
      issueBody = createPlaywrightIssueBody(command.content, event);
      break;

    case 'help':
      replyToLine(event.replyToken, getHelpMessage());
      return;

    default:
      // 通常のメッセージは自動的に@claudeを付与
      if (CONF.ENABLE_AUTO_CLAUDE) {
        issueTitle = `@claude ${userText}`;
        issueBody = createClaudeIssueBody(userText, event);
      } else {
        issueTitle = userText;
        issueBody = createGenericIssueBody(userText, event);
      }
  }

  issueUrl = createGithubIssue(issueTitle, issueBody);

  logToSheet({
    userId:  event.source && event.source.userId,
    message: userText,
    command: command.type,
    url:     issueUrl,
    status:  issueUrl ? 'OK' : 'NG',
  });

  const replyText = createReplyMessage(command.type, issueUrl, userText);
  replyToLine(event.replyToken, replyText);
}

/* ---------- コマンド解析 ---------- */
function parseCommand(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.startsWith('claude ') || lowerText.startsWith('@claude ')) {
    return { type: 'claude', content: text.replace(/^(@?claude\s+)/i, '') };
  }

  if (lowerText.startsWith('playwright ') || lowerText.startsWith('@playwright ')) {
    return { type: 'playwright', content: text.replace(/^(@?playwright\s+)/i, '') };
  }

  if (lowerText === 'help' || lowerText === 'ヘルプ') {
    return { type: 'help', content: '' };
  }

  return { type: 'auto', content: text };
}

/* ---------- Issue本文作成 ---------- */
function createClaudeIssueBody(content, event) {
  return `## 🤖 LINE経由のClaude依頼

**依頼内容:**
${content}

**送信者情報:**
- User ID: ${event.source?.userId || 'Unknown'}
- 送信時刻: ${new Date().toLocaleString('ja-JP')}
- 送信方法: LINE Bot

**期待される動作:**
Claude Code Actionが自動的に分析を行い、適切な応答を生成します。

---
*この依頼はLINE Botから自動生成されました*`;
}

function createPlaywrightIssueBody(content, event) {
  return `## 🎭 LINE経由のPlaywright依頼

**依頼内容:**
${content}

**送信者情報:**
- User ID: ${event.source?.userId || 'Unknown'}
- 送信時刻: ${new Date().toLocaleString('ja-JP')}
- 送信方法: LINE Bot

**期待される動作:**
Playwrightアシスタントが自動的にテスト関連の支援を提供します。

---
*この依頼はLINE Botから自動生成されました*`;
}

function createGenericIssueBody(content, event) {
  return `## 📝 LINE経由の一般依頼

**内容:**
${content}

**送信者情報:**
- User ID: ${event.source?.userId || 'Unknown'}
- 送信時刻: ${new Date().toLocaleString('ja-JP')}
- 送信方法: LINE Bot

---
*この依頼はLINE Botから自動生成されました*`;
}

/* ---------- 返信メッセージ作成 ---------- */
function createReplyMessage(commandType, issueUrl, originalText) {
  if (!issueUrl) {
    return `❌ Issue作成に失敗しました\n\n送信内容: ${originalText}`;
  }

  const baseMessage = `✅ Issue を作成しました！\n${issueUrl}\n\n`;

  if (!CONF.ENABLE_RICH_REPLY) {
    return baseMessage;
  }

  switch (commandType) {
    case 'claude':
      return baseMessage +
        `🤖 Claude Code Actionが分析中...\n` +
        `数分後にGitHubで自動応答が投稿されます。\n\n` +
        `💡 他の使い方:\n` +
        `• "claude レビューして" - コードレビュー\n` +
        `• "claude 機能追加" - 新機能提案\n` +
        `• "playwright test" - テスト実行`;

    case 'playwright':
      return baseMessage +
        `🎭 Playwrightアシスタントが対応中...\n` +
        `テスト関連の支援を提供します。\n\n` +
        `🧪 利用可能なコマンド:\n` +
        `• "playwright help" - ヘルプ表示\n` +
        `• "playwright test" - テスト実行\n` +
        `• "playwright generate URL" - テスト生成`;

    default:
      return baseMessage +
        `🚀 Claude Code Actionが自動実行されます。\n\n` +
        `📱 便利なコマンド:\n` +
        `• "help" - 使い方を表示\n` +
        `• "claude [依頼]" - Claude指定\n` +
        `• "playwright [依頼]" - Playwright指定`;
  }
}

/* ---------- ヘルプメッセージ ---------- */
function getHelpMessage() {
  return `🤖 Claude Code Action LINE Bot

📋 **使い方:**

**Claude関連:**
• "claude レビューして" - コードレビュー
• "claude 機能追加して" - 新機能提案
• "claude 現在の状況は？" - プロジェクト分析

**Playwright関連:**
• "playwright test" - テスト実行
• "playwright help" - Playwrightヘルプ
• "playwright generate https://example.com" - テスト生成

**一般:**
• 普通にメッセージを送ると自動的に@claudeが付きます
• "help" - このヘルプを表示

🔗 **GitHub:** ${CONF.GH_OWNER}/${CONF.GH_REPO}

💡 **仕組み:**
LINEメッセージ → GitHub Issue → Claude自動応答`;
}

/* ---------- GitHub Issue 作成（強化版） ---------- */
function createGithubIssue(title, body) {
  try {
    const repoName = CONF.GH_REPO || CONF.CLAUDE_REPO;
    const url = `https://api.github.com/repos/${CONF.GH_OWNER}/${repoName}/issues`;

    const payload = {
      title: title,
      body: body,
      labels: ['line-bot', 'auto-generated']  // ラベル追加
    };

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: `token ${CONF.GH_TOKEN}` },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    if (res.getResponseCode() !== 201) {
      throw new Error(`GitHub ${res.getResponseCode()}: ${res.getContentText()}`);
    }

    const issueData = JSON.parse(res.getContentText());
    console.log(`Created issue #${issueData.number}: ${issueData.html_url}`);
    return issueData.html_url;

  } catch (err) {
    console.error(`createGithubIssue error: ${err.message}`);
    return null;
  }
}

/* ---------- LINE 返信 ---------- */
function replyToLine(replyToken, text) {
  try {
    const res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${CONF.LINE_ACCESS_TOKEN}` },
      payload: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text }],
      }),
      muteHttpExceptions: true,
    });

    if (res.getResponseCode() !== 200) {
      console.error(`LINE reply failed: ${res.getResponseCode()} ${res.getContentText()}`);
    }
  } catch (err) {
    console.error(`replyToLine error: ${err.message}`);
  }
}

/* ---------- Google Sheets へのログ（強化版） ---------- */
function logToSheet(obj) {
  try {
    if (!CONF.SPREADSHEET_ID) return;
    const ss    = SpreadsheetApp.openById(CONF.SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'UserId', 'Message', 'Command', 'IssueURL', 'Status']);
    }
    sheet.appendRow([
      new Date(),
      obj.userId  || '',
      obj.message || '',
      obj.command || '',
      obj.url     || '',
      obj.status  || 'NG',
    ]);
  } catch (err) {
    console.error(`logToSheet error: ${err.message}`);
  }
}

/* ---------- 設定用ヘルパー関数 ---------- */
function setupProperties() {
  const props = PropertiesService.getScriptProperties();

  // 設定例（実際の値に置き換えてください）
  props.setProperties({
    'LINE_ACCESS_TOKEN': 'YOUR_LINE_ACCESS_TOKEN',
    'GH_OWNER': 'ai776',
    'GH_REPO': 'claude-code-action-project',
    'GH_TOKEN': 'YOUR_GITHUB_TOKEN',
    'SPREADSHEET_ID': 'YOUR_SPREADSHEET_ID'
  });

  console.log('Properties set successfully!');
}
