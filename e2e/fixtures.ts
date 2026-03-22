import { test as base, expect } from "@playwright/test";

// Extend basic test with authentication fixture
export const test = base.extend<{
  authenticatedPage: void;
}>({
  authenticatedPage: [async ({ page }, use) => {
    // Navigate to login
    await page.goto("/login");

    // Use test credentials from auth.setup.ts
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    // Fill in login form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });

    // Verify we're logged in
    await expect(page.locator("text=Dashboard")).toBeVisible();

    await use();
  }, { auto: true }],
});

export { expect } from "@playwright/test";
