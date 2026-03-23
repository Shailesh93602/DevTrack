import { test as setup, expect } from "@playwright/test";
import { TEST_USER } from "./global-setup";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("load");

  await page.locator("input#email").fill(TEST_USER.email);
  await page.locator("input#password").fill(TEST_USER.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.waitForURL(/.*dashboard.*/, { timeout: 30000 });
  await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
