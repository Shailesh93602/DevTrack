import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

// Test user credentials
export const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: "TestPassword123!",
  name: "Test User",
};

setup("create account and login", async ({ page }) => {
  // Navigate to signup page
  await page.goto("/signup");

  // Fill in registration form
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.fill('input[name="confirmPassword"]', TEST_USER.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard or confirmation
  await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });

  // Verify we're logged in by checking for dashboard elements
  await expect(page.locator("text=Dashboard")).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login");

  // Fill in login form
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });

  // Verify we're logged in
  await expect(page.locator("text=Dashboard")).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
