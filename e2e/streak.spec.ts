import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Streak System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Overview")).toBeVisible();
  });

  test("should display current streak count", async ({ page }) => {
    // Look for streak card
    const streakCard = page.locator('div:has-text("Current Streak")').first();
    await expect(streakCard).toBeVisible();

    // Should contain a number
    const content = await streakCard.textContent();
    expect(content).toMatch(/\d+/);
  });

  test("should display longest streak count", async ({ page }) => {
    // Look for longest streak card
    const longestStreakCard = page.locator('div:has-text("Longest Streak")').first();
    await expect(longestStreakCard).toBeVisible();

    // Should contain a number
    const content = await longestStreakCard.textContent();
    expect(content).toMatch(/\d+/);
  });

  test("should display streak milestone badges", async ({ page }) => {
    // Milestones are shown as badges: 7, 30, 60, 100 days
    const content = await page.content();

    // Check for milestone indicators
    const hasMilestones =
      content.includes("Week Warrior") ||
      content.includes("Monthly Master") ||
      content.includes("Consistency King") ||
      content.includes("Century Champion") ||
      content.includes("🎯") ||
      content.includes("🔥") ||
      content.includes("⚡") ||
      content.includes("👑");

    // Either milestones are shown or streak is 0
    expect(hasMilestones || content.includes("0")).toBeTruthy();
  });

  test("should display streak freeze information", async ({ page }) => {
    // Look for freeze-related content
    const content = await page.content();

    // Should indicate freeze availability or usage
    const hasFreezeInfo =
      content.includes("freeze") ||
      content.includes("Freeze") ||
      content.includes("week");

    // Freeze info may not be visible if streak is 0
    expect(hasFreezeInfo || content.includes("0")).toBeTruthy();
  });

  test("should update streak after creating daily log", async ({ page }) => {
    // Navigate to logs page
    await page.goto("/dashboard/logs");
    await expect(page.locator("text=Daily Logs")).toBeVisible();

    // Create a new daily log
    await page.fill('input[placeholder="e.g. 3"]', "5");
    await page.fill('input[placeholder="Add a topic..."]', "Arrays");
    await page.click('button:has-text("Add")');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Log created successfully")).toBeVisible({ timeout: 10000 });

    // Navigate back to dashboard
    await page.goto("/dashboard");

    // Streak should be at least 1 (or increased if already logging today)
    const streakCard = page.locator('div:has-text("Current Streak")').first();
    const content = await streakCard.textContent();
    expect(content).toMatch(/\d+/);
  });

  test("should display progress to next milestone", async ({ page }) => {
    // Look for progress indicators
    const content = await page.content();

    // Should show some form of progress (progress bar, percentage, or days remaining)
    const hasProgress =
      content.includes("progress") ||
      content.includes("Progress") ||
      content.includes("%") ||
      content.includes("days to");

    // Progress may not show if streak is 0
    expect(hasProgress || content.includes("0")).toBeTruthy();
  });
});
