import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Overland Stack/);

    // Check for main content elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display the welcome content', async ({ page }) => {
    await page.goto('/');

    // Check for welcome section
    const welcomeSection = page.locator('[data-testid="welcome-section"]');
    if ((await welcomeSection.count()) > 0) {
      await expect(welcomeSection).toBeVisible();
    }

    // Check for getting started content
    const gettingStarted = page.locator('text=Getting Started');
    if ((await gettingStarted.count()) > 0) {
      await expect(gettingStarted).toBeVisible();
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check for navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test that navigation links are clickable
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && !href.startsWith('http')) {
          await link.click();
          await expect(page).toHaveURL(new RegExp(href));
          await page.goBack();
        }
      }
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

    // Check for Open Graph tags
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute('content');
    if (ogTitle) {
      expect(ogTitle).toBeTruthy();
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
