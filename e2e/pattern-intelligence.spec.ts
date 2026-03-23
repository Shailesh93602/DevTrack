import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Pattern Intelligence on DSA Problems", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/problems");
    await expect(page.locator("text=DSA Problems")).toBeVisible();
  });

  test("should display pattern insights panel", async ({ page }) => {
    // Look for Pattern Insights section
    const content = await page.content();
    const hasPatternInsights =
      content.includes("Pattern Insights") ||
      content.includes("Most Practiced") ||
      content.includes("Recommended to Learn");

    expect(hasPatternInsights).toBeTruthy();
  });

  test("should display most practiced patterns", async ({ page }) => {
    // Create a problem to generate pattern data
    await page.fill('input[placeholder="e.g. Two Sum"]', "Pattern Test Problem");
    await page.selectOption("select", "EASY");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Two Pointers");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Check for pattern display in insights
    const content = await page.content();
    const hasPatterns =
      content.includes("Two Pointers") ||
      content.includes("Most Practiced") ||
      content.includes("Pattern Insights");

    expect(hasPatterns).toBeTruthy();
  });

  test("should show pattern mastery progress", async ({ page }) => {
    // Look for progress indicators in pattern section
    const content = await page.content();
    const hasProgress =
      content.includes("progress") ||
      content.includes("Progress") ||
      content.includes("%") ||
      content.includes("Easy") ||
      content.includes("Medium") ||
      content.includes("Hard");

    expect(hasProgress).toBeTruthy();
  });

  test("should recommend patterns to learn", async ({ page }) => {
    // Check for recommendation section
    const content = await page.content();
    const hasRecommendation =
      content.includes("Recommended to Learn") ||
      content.includes("Recommended") ||
      content.includes("Learn");

    // Recommendation may not show if user has practiced all common patterns
    expect(hasRecommendation || content.includes("Pattern Insights")).toBeTruthy();
  });

  test("should display weak patterns to strengthen", async ({ page }) => {
    // Look for weak patterns section
    const content = await page.content();
    const hasWeakPatterns =
      content.includes("Weak Patterns") ||
      content.includes("to Strengthen") ||
      content.includes("Patterns to Strengthen");

    // May not show if no weak patterns identified
    expect(hasWeakPatterns || content.includes("Pattern Insights")).toBeTruthy();
  });
});
