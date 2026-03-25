import { test as setup, expect } from "@playwright/test";
import { TEST_USER } from "./global-setup";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  page.on("console", (msg) => console.log(`[BROWSER] ${msg.text()}`));
  page.on("pageerror", (err) =>
    console.error(`[BROWSER ERROR] ${err.message}`)
  );

  console.log("[Auth Setup] Navigating to /login...");
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  console.log("[Auth Setup] Filling credentials...");
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.locator('input[type="password"]').fill(TEST_USER.password);

  console.log("[Auth Setup] Clicking Sign In...");
  await page.getByRole("button", { name: /sign in/i }).click();

  console.log("[Auth Setup] Waiting for dashboard redirect...");
  await page.waitForURL(/.*dashboard.*/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();

  console.log("[Auth Setup] Saving storage state...");
  await page.context().storageState({ path: authFile });
  console.log("[Auth Setup] Completed.");
});
