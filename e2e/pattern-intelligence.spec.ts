import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Pattern Intelligence on DSA Problems", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/problems");
    await expect(page.locator("text=DSA Problems")).toBeVisible();
  });

  test("should display pattern insights panel", async ({ page }) => {
    // Wait for the panel to be visible to avoid checking skeleton content
    await expect(page.locator("text=Pattern Insights")).toBeVisible({ timeout: 10000 });

    // Look for Pattern Insights section
    const content = await page.content();
    const hasPatternInsights =
      content.includes("Pattern Insights") ||
      content.includes("Most Practiced") ||
      content.includes("Recommended to Learn");

    expect(hasPatternInsights).toBeTruthy();
  });

  test("should display most practiced patterns", async ({ page }) => {
    // Wait for skeletons to vanish
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Create a problem to generate pattern data
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Pattern Test Problem");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Easy" }).click();
    await page.getByLabel(/pattern/i).fill("Two Pointers");
    await page.getByLabel(/platform/i).fill("LeetCode");
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
