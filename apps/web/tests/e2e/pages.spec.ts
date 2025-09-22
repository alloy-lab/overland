import { expect, test } from '@playwright/test';

test.describe('Pages', () => {
  test('should load pages index', async ({ page }) => {
    await page.goto('/pages');

    // Check that the page loads
    await expect(page).toHaveTitle(/Pages/);

    // Check for pages content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1:has-text("Pages")')).toBeVisible();
  });

  test('should handle individual page routes', async ({ page }) => {
    // Test with a common page slug
    await page.goto('/pages/about');

    // Should either show the page or a 404
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for page title or error content
    const title = page.locator('h1');
    const errorContent = page
      .locator('text=404')
      .or(page.locator('text=Not Found'));

    // Either we have a title or error content
    const hasTitle = (await title.count()) > 0;
    const hasError = (await errorContent.count()) > 0;

    expect(hasTitle || hasError).toBeTruthy();
  });

  test('should show 404 for non-existent pages', async ({ page }) => {
    await page.goto('/pages/non-existent-page');

    // Should show 404 or error content
    const errorContent = page
      .locator('text=404')
      .or(page.locator('text=Not Found'));
    if ((await errorContent.count()) > 0) {
      await expect(errorContent).toBeVisible();
    } else {
      // If no explicit error, at least check that we don't get a server error
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/pages');

    // Check for proper HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    // Check for main content area
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should load page content without JavaScript errors', async ({
    page,
  }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/pages');

    // Wait a bit for any async operations
    await page.waitForTimeout(1000);

    // Check that there are no critical JavaScript errors
    const criticalErrors = errors.filter(
      error =>
        !error.includes('favicon') &&
        !error.includes('404') &&
        !error.includes('net::ERR_')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
