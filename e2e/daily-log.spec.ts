import { test, expect } from "@playwright/test";

// Use storage state from auth.setup.ts
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Daily Log Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard before each test
    await page.goto("/dashboard");
    await expect(page.locator("text=Daily Log")).toBeVisible();
  });

  test("should create a new daily log", async ({ page }) => {
    // Fill in the daily log form
    const today = new Date().toISOString().split("T")[0];

    // Clear and set date
    await page.fill('input[type="date"]', today);

    // Set problems solved
    await page.fill('input[type="number"]', "5");

    // Add topics
    await page.fill('input[placeholder="e.g. arrays, dynamic programming…"]', "Arrays");
    await page.click('button:has-text("Add")');

    await page.fill('input[placeholder="e.g. arrays, dynamic programming…"]', "Dynamic Programming");
    await page.click('button:has-text("Add")');

    // Add notes
    await page.fill(
      'textarea[placeholder="What did you work on today?"]',
      "Worked on array problems and DP patterns"
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for the form to be processed (look for button to return to normal state)
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });

    // Verify the log appears in the list
    await expect(page.locator("text=Problems: 5")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Try to submit with empty fields (problems solved is 0 by default)
    await page.click('button[type="submit"]');

    // Form should submit successfully even with 0 problems
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });
  });

  test("should prevent duplicate entries for same date", async ({ page }) => {
    // First, create a log
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[type="date"]', today);
    await page.fill('input[type="number"]', "3");
    await page.click('button[type="submit"]');

    // Wait for submission
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });

    // Try to create another log for the same date
    await page.fill('input[type="number"]', "5");
    await page.click('button[type="submit"]');

    // Should show duplicate entry error
    await expect(page.locator("text=A log for this date already exists")).toBeVisible({ timeout: 5000 });
  });

  test("should handle topic input with Enter key", async ({ page }) => {
    const topicInput = page.locator('input[placeholder="e.g. arrays, dynamic programming…"]');

    await topicInput.fill("Graphs");
    await topicInput.press("Enter");

    // Verify topic was added
    await expect(page.locator("text=Graphs")).toBeVisible();
  });

  test("should allow removing topics", async ({ page }) => {
    // Add a topic first
    await page.fill('input[placeholder="e.g. arrays, dynamic programming…"]', "Trees");
    await page.click('button:has-text("Add")');

    // Verify topic appears
    await expect(page.locator("text=Trees")).toBeVisible();

    // Remove the topic using the X button
    await page.locator('button[aria-label="Remove topic Trees"]').click();

    // Verify topic is removed
    await expect(page.locator("text=Trees")).not.toBeVisible();
  });

  test("should handle notes character limit", async ({ page }) => {
    // Generate a note that's too long (>1000 chars)
    const longNote = "a".repeat(1001);

    await page.fill('textarea[placeholder="What did you work on today?"]', longNote);

    // Submit should fail with validation error
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator("text=Notes must be 1000 characters or less")).toBeVisible();
  });

  test("should filter logs by date range", async ({ page }) => {
    // Create logs for today and yesterday
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Create log for today
    await page.fill('input[type="date"]', today);
    await page.fill('input[type="number"]', "3");
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });

    // Create log for yesterday
    await page.fill('input[type="date"]', yesterdayStr);
    await page.fill('input[type="number"]', "5");
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });

    // Verify both logs are visible
    await expect(page.locator("text=Problems: 3")).toBeVisible();
    await expect(page.locator("text=Problems: 5")).toBeVisible();

    // Filter to last 7 days (should show both)
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "Last 7 days" }).click();

    // Verify both logs are still visible
    await expect(page.locator("text=Problems: 3")).toBeVisible();
    await expect(page.locator("text=Problems: 5")).toBeVisible();

    // Verify filter indicator shows count
    await expect(page.locator("text=Showing 2 of 2")).toBeVisible();
  });

  test("should show all logs when filter is set to all time", async ({ page }) => {
    // Create a log for today
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[type="date"]', today);
    await page.fill('input[type="number"]', "4");
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });

    // Switch to "Last 30 days" then back to "All time"
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "Last 30 days" }).click();

    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "All time" }).click();

    // Verify log is still visible
    await expect(page.locator("text=Problems: 4")).toBeVisible();
  });

  test("should load more logs when Load more button is clicked", async ({ page }) => {
    // Create 12 logs to test pagination (10 shown initially, 2 more on load)
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      await page.fill('input[type="date"]', dateStr);
      await page.fill('input[type="number"]', String(i + 1));
      await page.click('button[type="submit"]');
      await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });
    }

    // Switch to "All time" filter to see all logs
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "All time" }).click();

    // Verify Load more button is visible (showing 10 of 12)
    await expect(page.locator('button:has-text("Load more")')).toBeVisible();
    await expect(page.locator('button:has-text("(2 remaining)")')).toBeVisible();

    // Click Load more
    await page.click('button:has-text("Load more")');

    // Verify all 12 logs are now visible
    await expect(page.locator('button:has-text("Load more")')).not.toBeVisible();
  });

  test("should delete a daily log", async ({ page }) => {
    // Create a log first
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[type="date"]', today);
    await page.fill('input[type="number"]', "4");
    await page.click('button[type="submit"]');

    // Wait for submission
    await expect(page.locator('button[type="submit"]:has-text("Log day")')).toBeVisible({ timeout: 10000 });

    // Delete the log
    await page.click('button[aria-label^="Delete"]');
    await page.click('button:has-text("Delete")');

    // Verify the log is removed
    await expect(page.locator("text=Problems: 4")).not.toBeVisible();
  });
});
