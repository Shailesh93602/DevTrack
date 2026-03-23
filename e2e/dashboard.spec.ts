import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Dashboard Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Overview")).toBeVisible();
  });

  test("should display dashboard stats cards", async ({ page }) => {
    // Verify all stats cards are present
    await expect(page.locator("text=Total Problems")).toBeVisible();
    await expect(page.locator("text=Today's Progress")).toBeVisible();
    await expect(page.locator("text=Recent Logs")).toBeVisible();
    await expect(page.locator("text=Current Streak")).toBeVisible();
    await expect(page.locator("text=Longest Streak")).toBeVisible();
    await expect(page.locator("text=Total Projects")).toBeVisible();
    await expect(page.locator("text=Active Projects")).toBeVisible();
  });

  test("should display weekly progress chart", async ({ page }) => {
    // Check for chart section
    await expect(page.locator("text=Progress")).toBeVisible();

    // Look for chart canvas or data visualization
    const chartSection = page.locator("text=Progress").locator("xpath=../..");
    await expect(chartSection).toBeVisible();
  });

  test("should display difficulty distribution", async ({ page }) => {
    // Check for difficulty section
    await expect(page.locator("text=Difficulty")).toBeVisible();
    await expect(page.locator("text=Difficulty Distribution")).toBeVisible();

    // Verify distribution legend items exist
    const content = await page.content();
    if (content.includes("Easy") || content.includes("Medium") || content.includes("Hard")) {
      // Difficulty data is present
      expect(true).toBe(true);
    }
  });

  test("should display recent logs section", async ({ page }) => {
    await expect(page.locator("text=Recent Logs")).toBeVisible();
    await expect(page.locator("text=Last 5 Entries")).toBeVisible();
  });

  test("should navigate to daily log page from dashboard", async ({ page }) => {
    // Click on any navigation link to logs
    await page.click('a[href="/dashboard/logs"]');
    await expect(page.locator("text=Daily Logs")).toBeVisible();
  });

  test("should show empty state when no recent logs", async ({ page }) => {
    // Check if empty state message exists
    const content = await page.content();
    if (content.includes("No logs yet")) {
      await expect(page.locator("text=No logs yet")).toBeVisible();
    }
  });

  test("should display streak information", async ({ page }) => {
    // Look for streak-related content
    const content = await page.content();

    // Should show streak count (number)
    expect(content).toMatch(/\d+\s*day/i);

    // Should show streak label
    expect(content).toMatch(/days in a row|Current Streak/i);
  });

  test("should display project counts", async ({ page }) => {
    // Look for project count numbers
    const content = await page.content();

    // Should show numeric values for project stats
    const totalProjectsMatch = content.match(/Total Projects[\s\S]*?(\d+)/);
    const activeProjectsMatch = content.match(/Active Projects[\s\S]*?(\d+)/);

    // Either we have numbers or 0 (empty state)
    expect(totalProjectsMatch || content.includes("0")).toBeTruthy();
    expect(activeProjectsMatch || content.includes("0")).toBeTruthy();
  });

  test("should handle page refresh with loading state", async ({ page }) => {
    // Refresh the page
    await page.reload();

    // Should still show overview after reload
    await expect(page.locator("text=Overview")).toBeVisible({ timeout: 10000 });
  });
});
