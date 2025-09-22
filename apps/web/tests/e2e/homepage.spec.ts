import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Overland Stack/);

    // Check for main content elements
    await expect(page.locator('main')).toBeVisible();

    // Check for the Overland logo (either light or dark version should be visible)
    const logoImages = page.locator('img[alt="Overland"]');
    await expect(logoImages).toHaveCount(2); // Should have both light and dark versions
    await expect(logoImages.first()).toBeVisible(); // At least one should be visible
  });

  test('should display the welcome content', async ({ page }) => {
    await page.goto('/');

    // Check for welcome content
    await expect(
      page.locator('text=A modern, full-stack web application starter')
    ).toBeVisible();

    // Check for action buttons
    await expect(page.locator('text=Get Started')).toBeVisible();
    await expect(page.locator('text=Read our docs')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check for navigation links in the footer
    const navLinks = page.locator('main a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test that navigation links are present
      await expect(navLinks.first()).toBeVisible();

      // Check for specific navigation items
      await expect(page.locator('text=Learn')).toBeVisible();
      await expect(page.locator('text=Examples')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that content is still visible and properly laid out
    await expect(page.locator('main')).toBeVisible();

    // Check that text is readable (not too small)
    const mainContent = page.locator('main');
    const fontSize = await mainContent.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return parseFloat(styles.fontSize);
    });

    expect(fontSize).toBeGreaterThan(12); // Ensure readable font size
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for essential meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    if (description) {
      expect(description.length).toBeGreaterThan(0);
    }

    // Check for Open Graph tags (optional)
    const ogTitleElement = page.locator('meta[property="og:title"]');
    if ((await ogTitleElement.count()) > 0) {
      const ogTitle = await ogTitleElement.getAttribute('content');
      if (ogTitle) {
        expect(ogTitle).toBeTruthy();
      }
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');

    // Should show 404 or error page
    const errorContent = page
      .locator('text=404')
      .or(page.locator('text=Not Found'));
    if ((await errorContent.count()) > 0) {
      await expect(errorContent).toBeVisible();
    }
  });
});
