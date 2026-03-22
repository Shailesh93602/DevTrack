import { test, expect } from "@playwright/test";

// Use a unique email for each test run to avoid conflicts
test.describe.configure({ mode: "serial" });

const uniqueId = Date.now();
const testUser = {
  email: `testuser_${uniqueId}@example.com`,
  password: "TestPassword123",
};

test.describe("Authentication Flows", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");

    // Check for key elements on the login page
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("should show validation errors for empty fields on login", async ({ page }) => {
    await page.goto("/login");

    // Submit empty form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for validation error messages
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should show validation error for invalid email format", async ({ page }) => {
    await page.goto("/login");

    // Enter invalid email
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for email validation error
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("should show error for non-existent user on login", async ({ page }) => {
    await page.goto("/login");

    // Enter credentials for non-existent user
    await page.getByLabel("Email").fill(`nonexistent_${uniqueId}@example.com`);
    await page.getByLabel("Password").fill("WrongPassword123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for error message
    await expect(page.getByText(/invalid|not found|credentials/i)).toBeVisible({ timeout: 5000 });
  });

  test("should successfully sign up a new user", async ({ page }) => {
    await page.goto("/signup");

    // Check signup page loaded
    await expect(page.getByRole("heading", { name: /create account|sign up/i })).toBeVisible();

    // Fill in signup form
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: /create account|sign up/i }).click();

    // Should redirect to dashboard after successful signup
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    
    // Verify we're on dashboard
    await expect(page.getByRole("heading", { name: /overview|dashboard/i })).toBeVisible();
  });

  test("should show password requirements on signup page", async ({ page }) => {
    await page.goto("/signup");

    // Check password requirements are displayed
    await expect(page.getByText("At least 8 characters")).toBeVisible();
    await expect(page.getByText("One uppercase letter")).toBeVisible();
    await expect(page.getByText("One lowercase letter")).toBeVisible();
    await expect(page.getByText("One number")).toBeVisible();
  });

  test("should show validation error for weak password on signup", async ({ page }) => {
    await page.goto("/signup");

    // Enter valid email but weak password
    await page.getByLabel("Email").fill(`test_${uniqueId + 1}@example.com`);
    await page.getByLabel("Password").fill("weak");
    await page.getByRole("button", { name: /create account/i }).click();

    // Check for password validation errors
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  });

  test("should successfully log in with newly created user", async ({ page }) => {
    await page.goto("/login");

    // Fill in credentials for the user created in previous test
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    
    // Verify we're on dashboard
    await expect(page.getByRole("heading", { name: /overview|dashboard/i })).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("MySecretPassword");

    // Initially should be password type
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click show password button (eye icon)
    await page.getByRole("button", { name: /show password/i }).click();

    // Should now be text type
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click hide password button
    await page.getByRole("button", { name: /hide password/i }).click();

    // Should be password type again
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should navigate between login and signup pages", async ({ page }) => {
    await page.goto("/login");

    // Click sign up link
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByRole("heading", { name: /create account|sign up/i })).toBeVisible();

    // Click sign in link
    await page.getByRole("link", { name: /sign in|login/i }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("should preserve form values on validation error", async ({ page }) => {
    await page.goto("/login");

    const emailValue = "test@example.com";
    
    // Fill only email, leave password empty
    await page.getByLabel("Email").fill(emailValue);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check validation error
    await expect(page.getByText("Password is required")).toBeVisible();

    // Email should still be filled
    await expect(page.getByLabel("Email")).toHaveValue(emailValue);
  });
});
