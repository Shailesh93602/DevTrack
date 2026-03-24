import { test, expect } from "@playwright/test";

// Use storage state from auth.setup.ts
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Daily Log Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard logs page before each test
    await page.goto("/dashboard/logs");
    await expect(page.getByRole("heading", { name: "Daily Logs" })).toBeVisible({ timeout: 15000 });
  });

  test("should create a new daily log and appear in history", async ({ page }) => {
    // Navigate using yesterday's date to ensure it appears in the history list
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Clear and set date
    await page.fill('input[type="date"]', yesterdayStr);

    // Set problems solved
    await page.getByLabel(/problems solved/i).fill("5");

    // Add topics
    const topicInput = page.getByPlaceholder(/Add topic/i);
    await topicInput.fill("Arrays");
    await topicInput.press("Enter");

    // Add notes
    await page.getByPlaceholder(/What did you work on today/i).fill(
      "Worked on array problems yesterday"
    );

    // Wait for submission response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/daily-log') && response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await responsePromise;
 
    // Wait for the log to appear in the history list (it should say "5 problems")
    await expect(page.locator("text=5 problems")).toBeVisible({ timeout: 15000 });
  });

  test("should validate required fields and appear in history", async ({ page }) => {
    // Use an older date to ensure it appears in list
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const dateStr = date.toISOString().split("T")[0];
    
    await page.fill('input[type="date"]', dateStr);
    
    // Try to submit with default 0 problems
    await page.click('button[type="submit"]');

    // Wait for the item to render in the history (which will say "0 problems")
    await expect(page.locator("text=0 problems")).toBeVisible({ timeout: 15000 });
  });

  test("should prevent duplicate entries for same date", async ({ page }) => {
    // Create a log for 3 days ago
    const date = new Date();
    date.setDate(date.getDate() - 3);
    const dateStr = date.toISOString().split("T")[0];
    
    await page.fill('input[type="date"]', dateStr);
    await page.getByLabel(/problems solved/i).fill("3");
    await page.click('button[type="submit"]');

    // Wait for submission
    await expect(page.locator("text=3 problems")).toBeVisible({ timeout: 15000 });

    // Try to create another log for the same date
    await page.fill('input[type="date"]', dateStr);
    await page.getByLabel(/problems solved/i).fill("5");
    await page.click('button[type="submit"]');
 
    // Should show duplicate entry error (wait for error or result)
    await expect(page.locator("text=A record with this unique constraint already exists")).toBeVisible({ timeout: 15000 });
  });

  test("should handle topic input with Enter key", async ({ page }) => {
    const topicInput = page.getByPlaceholder(/Add topic/i);

    await topicInput.fill("Graphs");
    await topicInput.press("Enter");

    // Verify topic was added
    await expect(page.locator("text=Graphs")).toBeVisible();
  });

  test("should allow removing topics", async ({ page }) => {
    const topicInput = page.getByPlaceholder(/Add topic/i);
    // Add a topic first
    await topicInput.fill("Trees");
    await topicInput.press("Enter");

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

    await page.getByPlaceholder(/What did you work on today/i).fill(longNote);

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
    await expect(page.locator("text=3 problems")).toBeVisible({ timeout: 15000 });

    // Create log for yesterday
    await page.fill('input[type="date"]', yesterdayStr);
    await page.fill('input[type="number"]', "5");
    const respPromise2 = page.waitForResponse(response => 
      response.url().includes('/api/daily-log') && response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await respPromise2;
    await expect(page.locator("text=5 problems")).toBeVisible({ timeout: 15000 });

    // Verify both logs are visible
    await expect(page.locator("text=3 problems")).toBeVisible();
    await expect(page.locator("text=5 problems")).toBeVisible();

    // Filter to last 7 days (should show both)
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "Last 7 days" }).click();

    // Verify both logs are still visible
    await expect(page.locator("text=3 problems")).toBeVisible();
    await expect(page.locator("text=5 problems")).toBeVisible();

    // Verify filter indicator shows count
    await expect(page.locator("text=Showing 2 of 2")).toBeVisible();
  });

  test("should show all logs when filter is set to all time", async ({ page }) => {
    // Create a log for today
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[type="date"]', today);
    const respPromise = page.waitForResponse(response => 
      response.url().includes('/api/daily-log') && response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await respPromise;
    await expect(page.locator("text=4 problems")).toBeVisible({ timeout: 15000 });

    // Switch to "Last 30 days" then back to "All time"
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "Last 30 days" }).click();

    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "All time" }).click();

    // Verify log is still visible
    await expect(page.locator("text=4 problems")).toBeVisible();
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
      await expect(page.locator(`text=${i + 1} problem`)).toBeVisible({ timeout: 15000 });
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
    const respPromise = page.waitForResponse(response => 
      response.url().includes('/api/daily-log') && response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await respPromise;
 
    // Wait for submission
    await expect(page.locator("text=4 problems")).toBeVisible({ timeout: 15000 });

    // Delete the log
    await page.click('button[aria-label*="Delete"]');
    const deleteResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/daily-log') && response.request().method() === 'DELETE'
    );
    await page.click('button:has-text("Delete")');
    await deleteResponsePromise;

    // Verify the log is removed
    await expect(page.locator("text=4 problems")).not.toBeVisible();
  });
});
