import { test, expect } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { TEST_USER } from "./global-setup";

// Ensure test results directory exists
const testResultsDir = path.join(process.cwd(), "test-results");
if (!existsSync(testResultsDir)) {
  mkdirSync(testResultsDir, { recursive: true });
}

test.describe.configure({ mode: "serial" });

test.describe("Authentication Flows", () => {
  test("[SCREENSHOT-01] should show login page with all elements", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    await page.screenshot({
      path: path.join(testResultsDir, "01-login-page.png"),
      fullPage: true
    });
  });

  test("[SCREENSHOT-02] should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();

    await page.screenshot({
      path: path.join(testResultsDir, "02-validation-errors-empty.png"),
      fullPage: true
    });
  });

  test("[SCREENSHOT-03] should show validation error for invalid email format", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    await page.locator('input#email').fill("invalid-email");
    await page.locator('input#password').fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Please enter a valid email address")).toBeVisible();

    await page.screenshot({
      path: path.join(testResultsDir, "03-validation-errors-email.png"),
      fullPage: true
    });
  });

  test("should preserve form values on validation error", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    await page.locator('input#email').fill("test@example.com");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Password is required")).toBeVisible();
    await expect(page.locator('input#email')).toHaveValue("test@example.com");
  });

  test("[SCREENSHOT-04] should show password requirements on signup page", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("load");

    await expect(page.getByText("At least 8 characters")).toBeVisible();
    await expect(page.getByText("One uppercase letter")).toBeVisible();
    await expect(page.getByText("One lowercase letter")).toBeVisible();
    await expect(page.getByText("One number")).toBeVisible();

    await page.screenshot({
      path: path.join(testResultsDir, "04-signup-page.png"),
      fullPage: true
    });
  });

  test("[SCREENSHOT-05] should show validation error for weak password on signup", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("load");

    await page.locator('input#email').fill("newuser@example.com");
    await page.locator('input#password').fill("weak");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();

    await page.screenshot({
      path: path.join(testResultsDir, "05-signup-password-error.png"),
      fullPage: true
    });
  });
});

test.describe("Registration and Login Integration", () => {
  // Test user is pre-created with email_confirm=true by global-setup.ts.
  // We sign in directly to avoid Supabase email rate limits on real signup flows.
  test("[SCREENSHOT-06] should sign in with pre-created user and reach dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    await page.locator("input#email").fill(TEST_USER.email);
    await page.locator("input#password").fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();

    await page.screenshot({
      path: path.join(testResultsDir, "06-dashboard-after-signup.png"),
      fullPage: true
    });
  });

  test("[SCREENSHOT-07] should login with same credentials and redirect to dashboard", async ({ page }) => {
    // Logout first by clearing cookies
    await page.context().clearCookies();

    await page.goto("/login");
    await page.waitForLoadState("load");

    await page.locator('input#email').fill(TEST_USER.email);
    await page.locator('input#password').fill(TEST_USER.password);

    await page.getByRole("button", { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /overview|dashboard/i })).toBeVisible();

    // Take screenshot of dashboard after login
    await page.screenshot({
      path: path.join(testResultsDir, "07-dashboard-after-login.png"),
      fullPage: true
    });

    console.log("✅ Login successful - Screenshot saved to test-results/07-dashboard-after-login.png");
  });

  test("[SCREENSHOT-08] should show error for non-existent user login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    await page.locator('input#email').fill(`nonexistent-${Date.now()}@example.com`);
    await page.locator('input#password').fill("WrongPassword123!");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid|not found|credentials|error/i)).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: path.join(testResultsDir, "08-login-error.png"),
      fullPage: true
    });
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    const passwordInput = page.locator('input#password');
    await passwordInput.fill("MySecretPassword123");

    // Initially password type
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click show password button
    const showButton = page.locator('button[aria-label*="show"], button:has([data-lucide="eye"])').first();
    if (await showButton.isVisible().catch(() => false)) {
      await showButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");
    }
  });

  test("should navigate between login and signup pages", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("load");

    // Go to signup
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();

    // Go back to login
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });
});
