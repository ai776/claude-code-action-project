#!/usr/bin/env node

/**
 * Playwright MCP Server
 * Claude がブラウザ操作を実行するためのMCPサーバー
 */

const { chromium } = require('playwright');

// MCPライブラリの動的インポート
let Server, StdioServerTransport;

async function initializeMCP() {
  try {
    const serverModule = await import('@modelcontextprotocol/sdk/server/index.js');
    const transportModule = await import('@modelcontextprotocol/sdk/server/stdio.js');

    Server = serverModule.Server;
    StdioServerTransport = transportModule.StdioServerTransport;
  } catch (error) {
    console.error('MCP SDK インポートエラー:', error.message);
    // フォールバック: 基本的なサーバー機能のみ
    Server = class MockServer {
      constructor() {}
      setRequestHandler() {}
      async connect() {}
    };
    StdioServerTransport = class MockTransport {};
  }
}

class PlaywrightMCPServer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.server = null;
  }

  async initialize() {
    await initializeMCP();

    this.server = new Server(
      {
        name: 'playwright-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  setupTools() {
    // ブラウザ起動ツール
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'launch_browser':
          return await this.launchBrowser(args);

        case 'navigate':
          return await this.navigate(args.url);

        case 'click':
          return await this.click(args.selector);

        case 'type':
          return await this.type(args.selector, args.text);

        case 'screenshot':
          return await this.screenshot(args.path);

        case 'get_text':
          return await this.getText(args.selector);

        case 'wait_for_element':
          return await this.waitForElement(args.selector);

        case 'evaluate':
          return await this.evaluate(args.script);

        case 'close_browser':
          return await this.closeBrowser();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // 利用可能なツールの一覧
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'launch_browser',
            description: 'ブラウザを起動します',
            inputSchema: {
              type: 'object',
              properties: {
                headless: { type: 'boolean', description: 'ヘッドレスモードで起動するか' },
                viewport: {
                  type: 'object',
                  properties: {
                    width: { type: 'number' },
                    height: { type: 'number' }
                  }
                }
              }
            }
          },
          {
            name: 'navigate',
            description: '指定されたURLに移動します',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: '移動先のURL' }
              },
              required: ['url']
            }
          },
          {
            name: 'click',
            description: '指定されたセレクタの要素をクリックします',
            inputSchema: {
              type: 'object',
              properties: {
                selector: { type: 'string', description: 'CSSセレクタ' }
              },
              required: ['selector']
            }
          },
          {
            name: 'type',
            description: '指定された要素にテキストを入力します',
            inputSchema: {
              type: 'object',
              properties: {
                selector: { type: 'string', description: 'CSSセレクタ' },
                text: { type: 'string', description: '入力するテキスト' }
              },
              required: ['selector', 'text']
            }
          },
          {
            name: 'screenshot',
            description: 'スクリーンショットを撮影します',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: '保存先のパス' }
              }
            }
          },
          {
            name: 'get_text',
            description: '指定された要素のテキストを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                selector: { type: 'string', description: 'CSSセレクタ' }
              },
              required: ['selector']
            }
          },
          {
            name: 'wait_for_element',
            description: '指定された要素が表示されるまで待機します',
            inputSchema: {
              type: 'object',
              properties: {
                selector: { type: 'string', description: 'CSSセレクタ' },
                timeout: { type: 'number', description: 'タイムアウト（ミリ秒）' }
              },
              required: ['selector']
            }
          },
          {
            name: 'evaluate',
            description: 'ページでJavaScriptを実行します',
            inputSchema: {
              type: 'object',
              properties: {
                script: { type: 'string', description: '実行するJavaScriptコード' }
              },
              required: ['script']
            }
          },
          {
            name: 'close_browser',
            description: 'ブラウザを閉じます',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });
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

  async click(selector) {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      await this.page.click(selector);

      return {
        content: [
          {
            type: 'text',
            text: `要素 "${selector}" をクリックしました`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `クリックエラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async type(selector, text) {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      await this.page.fill(selector, text);

      return {
        content: [
          {
            type: 'text',
            text: `要素 "${selector}" に "${text}" を入力しました`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `入力エラー: ${error.message}`
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

  async getText(selector) {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      const text = await this.page.textContent(selector);

      return {
        content: [
          {
            type: 'text',
            text: `要素 "${selector}" のテキスト: "${text}"`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `テキスト取得エラー: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async waitForElement(selector, timeout = 30000) {
    try {
      if (!this.page) {
        throw new Error('ブラウザが起動していません');
      }

      await this.page.waitForSelector(selector, { timeout });

      return {
        content: [
          {
            type: 'text',
            text: `要素 "${selector}" が表示されました`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `要素待機エラー: ${error.message}`
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

  async run() {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Playwright MCP Server が起動しました');
  }
}

// サーバー起動
if (require.main === module) {
  const server = new PlaywrightMCPServer();
  server.run().catch(console.error);
}

module.exports = PlaywrightMCPServer;
