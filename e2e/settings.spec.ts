import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("should display user information", async ({ page }) => {
    // Should show user email or profile info
    const content = await page.content();
    expect(content).toMatch(/email|profile|user/i);
  });

  test("should display sign out button", async ({ page }) => {
    // Look for sign out button
    await expect(page.locator('button:has-text("Sign out")')).toBeVisible();
  });

  test("should sign out user", async ({ page }) => {
    // Click sign out
    await page.click('button:has-text("Sign out")');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator("text=Sign in")).toBeVisible();
  });

  test("should navigate back to dashboard", async ({ page }) => {
    // Click on dashboard link
    await page.click('a[href="/dashboard"]');

    // Should be on dashboard
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
