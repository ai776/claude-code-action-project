#!/usr/bin/env node

/**
 * Claude Development Assistant
 * Claude APIを使用した本格的な開発支援システム
 */

const fs = require('fs');
const path = require('path');

class ClaudeDevAssistant {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
  }

  /**
   * Claude APIにリクエストを送信
   */
  async callClaude(prompt, systemPrompt = null) {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const body = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: messages
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error);
      return `エラーが発生しました: ${error.message}`;
    }
  }

  /**
   * コードレビューを実行
   */
  async reviewCode(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const systemPrompt = `あなたは経験豊富なソフトウェアエンジニアです。
コードレビューを行い、以下の観点で分析してください：
- コードの品質
- セキュリティ
- パフォーマンス
- 保守性
- ベストプラクティス
日本語で回答してください。`;

    const prompt = `以下のコードをレビューしてください：

ファイル: ${filePath}
\`\`\`javascript
${code}
\`\`\`

改善点や推奨事項があれば具体的に教えてください。`;

    return await this.callClaude(prompt, systemPrompt);
  }

  /**
   * 機能実装を支援
   */
  async implementFeature(description, existingCode = '') {
    const systemPrompt = `あなたは熟練したJavaScriptエンジニアです。
要求された機能を実装し、以下を含めてください：
- 完全なコード実装
- エラーハンドリング
- JSDocコメント
- テストケースの提案
日本語でコメントを書いてください。`;

    const prompt = `以下の機能を実装してください：

要求: ${description}

既存のコード:
\`\`\`javascript
${existingCode}
\`\`\`

完全な実装コードとテストケースを提供してください。`;

    return await this.callClaude(prompt, systemPrompt);
  }

  /**
   * リファクタリング提案
   */
  async suggestRefactoring(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const systemPrompt = `あなたはコードリファクタリングの専門家です。
以下の観点でリファクタリング提案を行ってください：
- コードの構造改善
- パフォーマンス最適化
- 保守性向上
- 設計パターンの適用
具体的なコード例と共に日本語で説明してください。`;

    const prompt = `以下のコードのリファクタリング提案をしてください：

\`\`\`javascript
${code}
\`\`\`

改善されたコードと理由を示してください。`;

    return await this.callClaude(prompt, systemPrompt);
  }

  /**
   * テストケース生成
   */
  async generateTests(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const systemPrompt = `あなたはテスト駆動開発の専門家です。
包括的なテストケースを作成してください：
- 正常系テスト
- 異常系テスト
- エッジケーステスト
- パフォーマンステスト
Jestフレームワークを使用して日本語でコメントを書いてください。`;

    const prompt = `以下のコードに対する包括的なテストケースを生成してください：

\`\`\`javascript
${code}
\`\`\`

Jestを使用した完全なテストファイルを提供してください。`;

    return await this.callClaude(prompt, systemPrompt);
  }
}

// CLI インターフェース
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY環境変数が設定されていません');
    process.exit(1);
  }

  const assistant = new ClaudeDevAssistant(apiKey);

  try {
    switch (command) {
      case 'review':
        if (!target) {
          console.error('使用法: node claude-dev-assistant.js review <ファイルパス>');
          process.exit(1);
        }
        console.log('🔍 コードレビューを実行中...');
        const review = await assistant.reviewCode(target);
        console.log('\n📋 レビュー結果:\n');
        console.log(review);
        break;

      case 'implement':
        if (!target) {
          console.error('使用法: node claude-dev-assistant.js implement "機能の説明"');
          process.exit(1);
        }
        console.log('🚀 機能実装を生成中...');
        const implementation = await assistant.implementFeature(target);
        console.log('\n💻 実装コード:\n');
        console.log(implementation);
        break;

      case 'refactor':
        if (!target) {
          console.error('使用法: node claude-dev-assistant.js refactor <ファイルパス>');
          process.exit(1);
        }
        console.log('🔧 リファクタリング提案を生成中...');
        const refactoring = await assistant.suggestRefactoring(target);
        console.log('\n✨ リファクタリング提案:\n');
        console.log(refactoring);
        break;

      case 'test':
        if (!target) {
          console.error('使用法: node claude-dev-assistant.js test <ファイルパス>');
          process.exit(1);
        }
        console.log('🧪 テストケースを生成中...');
        const tests = await assistant.generateTests(target);
        console.log('\n🎯 生成されたテスト:\n');
        console.log(tests);
        break;

      default:
        console.log(`
Claude Development Assistant

使用法:
  node claude-dev-assistant.js review <ファイルパス>     # コードレビュー
  node claude-dev-assistant.js implement "機能説明"      # 機能実装
  node claude-dev-assistant.js refactor <ファイルパス>   # リファクタリング提案
  node claude-dev-assistant.js test <ファイルパス>       # テストケース生成

環境変数:
  ANTHROPIC_API_KEY: Claude APIキー
        `);
    }
  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ClaudeDevAssistant;
