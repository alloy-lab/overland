import { expect, Page, test } from '@playwright/test';

test.describe('Frontend', () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page).toHaveTitle(/Overland Stack/);

    // Check for the main description text
    const description = page.locator('p').first();
    await expect(description).toContainText(
      'A modern, full-stack web application starter'
    );

    // Check for the "Get Started" button
    const getStartedButton = page.locator('text=Get Started');
    await expect(getStartedButton).toBeVisible();
  });
});
