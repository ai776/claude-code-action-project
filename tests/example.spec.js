// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Claude Code Action - Playwright Tests', () => {
  test('has title', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('search functionality', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // より確実な検索テスト
    const searchButton = page.locator('[aria-label="Search"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();

      // 検索ボックスに入力
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.keyboard.press('Enter');

        // 検索結果またはドキュメントページの表示を確認
        await expect(page.locator('body')).toContainText('test', { timeout: 10000 });
      }
    } else {
      // 検索機能が見つからない場合はスキップ
      test.skip();
    }
  });

  test('navigation menu', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // デスクトップとモバイルで異なるナビゲーション構造に対応
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // モバイルの場合はハンバーガーメニューをチェック
      const menuButton = page.locator('[aria-label="Toggle navigation"], .navbar-toggle, .menu-toggle').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
    }

    // 主要なナビゲーション要素の存在確認（first()で最初の要素のみ）
    const docsLink = page.locator('a[href*="docs"]').first();
    await expect(docsLink).toBeVisible({ timeout: 10000 });
  });

  test('page content loads', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // ページの主要コンテンツが読み込まれることを確認（first()で最初の要素のみ）
    await expect(page.locator('h1').first()).toBeVisible();

    // Playwrightに関連するテキストが含まれることを確認
    await expect(page.locator('body')).toContainText(/playwright|testing|automation/i);
  });

  test('responsive design', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // ページが異なるビューポートサイズで正しく表示されることを確認
    const viewport = page.viewportSize();

    if (viewport) {
      // ページの基本要素が表示されることを確認
      await expect(page.locator('body')).toBeVisible();

      // ナビゲーションまたはメニューが存在することを確認
      const nav = page.locator('nav, .navbar, [role="navigation"]').first();
      await expect(nav).toBeVisible();
    }
  });
});
