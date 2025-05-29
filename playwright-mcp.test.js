/**
 * Playwright MCP Server テスト
 */

const { chromium } = require('playwright');

// テスト用のシンプルなPlaywrightサーバークラス
class TestPlaywrightServer {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launchBrowser(args = {}) {
    try {
      const { headless = true, viewport = { width: 1280, height: 720 } } = args;

      this.browser = await chromium.launch({ headless });
      this.page = await this.browser.newPage();
      await this.page.setViewportSize(viewport);

      return {
        content: [
          {
            type: 'text',
            text: `ブラウザが起動しました (ヘッドレス: ${headless}, ビューポート: ${viewport.width}x${viewport.height})`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `ブラウザ起動エラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async navigate(url) {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      await this.page.goto(url);
      const title = await this.page.title();

      return {
        content: [
          {
            type: 'text',
            text: `${url} に移動しました。ページタイトル: "${title}"`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `ナビゲーションエラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async screenshot(path = 'screenshot.png') {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      await this.page.screenshot({ path });

      return {
        content: [
          {
            type: 'text',
            text: `スクリーンショットを ${path} に保存しました`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `スクリーンショットエラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async evaluate(script) {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      const result = await this.page.evaluate(script);

      return {
        content: [
          {
            type: 'text',
            text: `スクリプト実行結果: ${JSON.stringify(result)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `スクリプト実行エラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }

      return {
        content: [
          {
            type: 'text',
            text: 'ブラウザを閉じました'
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `ブラウザ終了エラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
}

describe('Playwright MCP Server', () => {
  let server;

  beforeEach(() => {
    server = new TestPlaywrightServer();
  });

  afterEach(async () => {
    if (server.browser) {
      await server.closeBrowser();
    }
  });

  test('サーバーが正常に初期化される', () => {
    expect(server).toBeDefined();
    expect(server.browser).toBeNull();
    expect(server.page).toBeNull();
  });

  test('ブラウザ起動機能をテスト', async () => {
    const result = await server.launchBrowser({ headless: true });

    expect(result.content[0].text).toContain('ブラウザが起動しました');
    expect(server.browser).toBeDefined();
    expect(server.page).toBeDefined();
  }, 30000);

  test('ナビゲーション機能をテスト', async () => {
    // まずブラウザを起動
    await server.launchBrowser({ headless: true });

    // Googleに移動
    const result = await server.navigate('https://www.google.com');

    expect(result.content[0].text).toContain('https://www.google.com に移動しました');
  }, 30000);

  test('スクリーンショット機能をテスト', async () => {
    await server.launchBrowser({ headless: true });
    await server.navigate('https://www.google.com');

    const result = await server.screenshot('test-screenshot.png');

    expect(result.content[0].text).toContain('スクリーンショットを test-screenshot.png に保存しました');
  }, 30000);

  test('JavaScript実行機能をテスト', async () => {
    await server.launchBrowser({ headless: true });
    await server.navigate('https://www.google.com');

    const result = await server.evaluate('() => document.title');

    expect(result.content[0].text).toContain('スクリプト実行結果');
  }, 30000);

  test('ブラウザ未起動時のエラーハンドリング', async () => {
    const result = await server.navigate('https://www.google.com');

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('ブラウザが起動していません');
  });
});
