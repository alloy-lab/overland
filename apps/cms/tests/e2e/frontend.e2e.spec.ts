import { expect, Page, test } from '@playwright/test';

test.describe('Frontend', () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test('can go on homepage', async ({ page }) => {
    await page.goto('/');

    // Check for the welcome message
    const welcomeMessage = page.locator('h1');
    await expect(welcomeMessage).toContainText(
      'Welcome to your new Overland project'
    );

    // Check for the admin panel link
    const adminLink = page.locator('text=Go to admin panel');
    await expect(adminLink).toBeVisible();
  });
});
