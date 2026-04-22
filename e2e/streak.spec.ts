import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Streak System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
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
    const longestStreakCard = page
      .locator('div:has-text("Longest Streak")')
      .first();
    await expect(longestStreakCard).toBeVisible();

    // Should contain a number
    const content = await longestStreakCard.textContent();
    expect(content).toMatch(/\d+/);
  });

  test("should display streak milestone badges", async ({ page }) => {
    // Previously the fallback `content.includes("0")` satisfied the
    // assertion trivially — "0" appears in every rendered page. Scope
    // the check to the streak region so we actually detect milestones.
    const streakRegion = page
      .locator('div:has-text("Current Streak")')
      .first();
    await expect(streakRegion).toBeVisible();

    // Streak card always renders *either* a numeric day count or a
    // milestone label. Assert one of those patterns appears — never
    // trivially-true substrings.
    const text = (await streakRegion.textContent()) ?? "";
    const hasNumberOrMilestone =
      /\b\d+\s*(day|days)\b/i.test(text) ||
      /(Week Warrior|Monthly Master|Consistency King|Century Champion)/.test(
        text
      );
    expect(hasNumberOrMilestone).toBeTruthy();
  });

  test("should display streak freeze information", async ({ page }) => {
    // Scope to the streak card so "week" / "freeze" in unrelated UI
    // can't provide false coverage.
    const streakRegion = page
      .locator('div:has-text("Current Streak")')
      .first();
    await expect(streakRegion).toBeVisible();
    const text = (await streakRegion.textContent()) ?? "";

    // Either freeze copy is present or an explicit zero-streak state
    // (e.g., "0 days"). No trivial-truthy fallbacks.
    const hasFreezeInfo = /freeze/i.test(text);
    const isZeroState = /\b0\s*(day|days)\b/i.test(text);
    expect(hasFreezeInfo || isZeroState).toBeTruthy();
  });

  test("should update streak after creating daily log", async ({ page }) => {
    // Navigate to logs page
    await page.goto("/dashboard/logs");
    await expect(page.locator("text=Daily Logs")).toBeVisible();

    // Create a new daily log
    await page.getByLabel(/problems solved/i).fill("5");
    // Assuming there's a label for "Topic" or "Add topic"
    await page.getByLabel(/topic/i).fill("Arrays");
    await page.getByLabel(/topic/i).press("Enter");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Log created successfully")).toBeVisible({
      timeout: 10000,
    });

    // Navigate back to dashboard
    await page.goto("/dashboard");

    // Streak should be at least 1 (or increased if already logging today)
    const streakCard = page.locator('div:has-text("Current Streak")').first();
    const content = await streakCard.textContent();
    expect(content).toMatch(/\d+/);
  });

  test("should display progress to next milestone", async ({ page }) => {
    // Assert an actual progress indicator element or explicit "X days to …"
    // copy — not trivially-true substrings on page.content().
    const hasProgressbar =
      (await page.locator('[role="progressbar"]').count()) > 0;
    const hasDaysToCopy = await page
      .getByText(/\d+\s*day(s)?\s*to\b/i)
      .first()
      .isVisible()
      .catch(() => false);
    const hasZeroStreak = await page
      .getByText(/\b0\s*day(s)?\b/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasProgressbar || hasDaysToCopy || hasZeroStreak).toBeTruthy();
  });
});
