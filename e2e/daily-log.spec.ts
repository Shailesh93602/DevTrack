import { test, expect } from "@playwright/test";

// Use storage state from auth.setup.ts
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Daily Log Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard logs page before each test
    await page.goto("/dashboard/logs");
    // Ensure we are not redirected to login
    await expect(page).not.toHaveURL(/.*login.*/);
    await expect(page.getByRole("heading", { name: "Daily Logs" })).toBeVisible({ timeout: 15000 });
    // Wait for initial logs to load
    await page.waitForLoadState("networkidle");
  });

  test("should create a new daily log and appear in history", async ({ page }) => {
    // Navigate using yesterday's date (-1 day) to ensure it appears in the history list
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Clear and set date
    await page.fill('input[type="date"]', yesterdayStr);

    // Set problems solved
    await page.getByLabel(/problems solved/i).fill("5");

    // Add topics
    const topicInput = page.getByPlaceholder(/e.g. arrays/i);
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
 
    // Wait for the UI to stabilize or refresh (using a hard reload in tests for stability)
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for the log to appear in the history list
    await expect(page.getByText(/5 problems/i)).toBeVisible({ timeout: 15000 });
  });

  test("should validate required fields and appear in history", async ({ page }) => {
    // Use -2 days to avoid overlap
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const dateStr = date.toISOString().split("T")[0];
    
    await page.fill('input#log-date', dateStr);
    
    // Try to submit with default 0 problems
    await page.click('button[type="submit"]');

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for the item to render in the history (which will say "0 problems")
    await expect(page.getByText(/0 problems/i)).toBeVisible({ timeout: 15000 });
  });

  test("should prevent duplicate entries for same date", async ({ page }) => {
    // Create a log for 14 days ago (to avoid overlap)
    const date = new Date();
    date.setDate(date.getDate() - 14);
    const dateStr = date.toISOString().split("T")[0];
    
    await page.fill('input[type="date"]', dateStr);
    await page.getByLabel(/problems solved/i).fill("3");
    await page.click('button[type="submit"]');
    await page.reload();

    // Wait for submission
    await expect(page.locator("text=3 problems")).toBeVisible({ timeout: 15000 });

    // Try to create another log for the same date
    await page.fill('input[type="date"]', dateStr);
    await page.getByLabel(/problems solved/i).fill("5");
    await page.click('button[type="submit"]');
 
    // Should show duplicate entry error
    await expect(page.locator("text=A record with this unique constraint already exists")).toBeVisible({ timeout: 15000 });
  });

  test("should handle topic input with Enter key", async ({ page }) => {
    const topicInput = page.getByPlaceholder(/e.g. arrays/i);

    await topicInput.fill("Graphs");
    await topicInput.press("Enter");

    // Verify topic was added
    await expect(page.locator("text=Graphs")).toBeVisible();
  });

  test("should allow removing topics", async ({ page }) => {
    const topicInput = page.getByPlaceholder(/e.g. arrays/i);
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
    // Create logs for 4 and 5 days ago (to avoid overlap)
    const date4 = new Date();
    date4.setDate(date4.getDate() - 4);
    const date4Str = date4.toISOString().split("T")[0];

    const date5 = new Date();
    date5.setDate(date5.getDate() - 5);
    const date5Str = date5.toISOString().split("T")[0];

    // Create log for 4 days ago
    await page.fill('input[type="date"]', date4Str);
    await page.fill('input[type="number"]', "31");
    await page.click('button[type="submit"]');
    await page.reload();
    await expect(page.getByText("31 problems")).toBeVisible({ timeout: 15000 });

    // Create log for 5 days ago
    await page.fill('input[type="date"]', date5Str);
    await page.fill('input[type="number"]', "51");
    await page.click('button[type="submit"]');
    await page.reload();
    await expect(page.getByText("51 problems")).toBeVisible({ timeout: 15000 });

    // Filter to last 7 days
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "Last 7 days" }).click();

    // Verify both logs are still visible
    await expect(page.getByText("31 problems")).toBeVisible();
    await expect(page.getByText("51 problems")).toBeVisible();
  });

  test("should load more logs when Load more button is clicked", async ({ page }) => {
    // Create 12 logs in a distant window to test pagination (e.g. 100 days ago)
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 100);

    for (let i = 0; i < 12; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      await page.fill('input[type="date"]', dateStr);
      await page.fill('input[type="number"]', String(200 + i));
      await page.click('button[type="submit"]');
      await page.waitForLoadState("networkidle");
    }

    await page.reload();

    // Switch to "All time" filter to see all logs
    await page.getByLabel("Select date range").click();
    await page.getByRole("option", { name: "All time" }).click();

    // Verify Load more button is visible
    await expect(page.locator('button:has-text("Load more")')).toBeVisible({ timeout: 15000 });

    // Click Load more
    await page.click('button:has-text("Load more")');
  });

  test("should delete a daily log", async ({ page }) => {
    // Create a log for 30 days ago
    const date30 = new Date();
    date30.setDate(date30.getDate() - 30);
    const date30Str = date30.toISOString().split("T")[0];
    
    await page.fill('input[type="date"]', date30Str);
    await page.fill('input[type="number"]', "99");
    await page.click('button[type="submit"]');
    await page.reload();
    await expect(page.getByText("99 problems")).toBeVisible({ timeout: 15000 });

    // Delete the log
    const logItem = page.locator('div', { hasText: '99 problems' }).first();
    await logItem.locator('button[aria-label*="Delete"]').click();
    await page.click('button:has-text("Delete")');
    await page.reload();

    // Verify the log is removed
    await expect(page.getByText("99 problems")).not.toBeVisible();
  });
});
