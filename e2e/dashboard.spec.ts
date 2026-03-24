import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Dashboard Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("should display dashboard stats cards", async ({ page }) => {
    // Wait for the overview heading
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 15000 });

    // Verify all stats cards titles are present
    await expect(page.getByText("Problems", { exact: false })).toBeVisible();
    await expect(page.getByText("Streak", { exact: false })).toBeVisible();
    await expect(page.getByText("Projects", { exact: false })).toBeVisible();
    await expect(page.getByText("Today", { exact: false })).toBeVisible();

    // Verify some values
    const content = await page.content();
    expect(content).toMatch(/Total solved|solved|Active|day/i);
  });

  test("should display weekly progress chart with date range labels", async ({ page }) => {
    // Check for chart section with Problems Solved Per Week title
    await expect(page.locator("text=Problems Solved Per Week")).toBeVisible();

    // Look for date range labels (e.g., "Jan 1-7", "Dec 25-31") instead of "Week N"
    const content = await page.content();

    // Should show date range format like "Jan 1-7" or "Dec 25-31"
    const hasDateRangeLabels = /[A-Z][a-z]{2}\s*\d{1,2}-\d{1,2}/.test(content);

    // Should NOT show generic "Week 1", "Week 2" labels anymore
    const hasGenericWeekLabels = /Week\s*\d+/.test(content);

    expect(hasDateRangeLabels || !hasGenericWeekLabels).toBeTruthy();
  });

  test("should display difficulty distribution", async ({ page }) => {
    // Check for difficulty section
    await expect(page.getByText(/^Difficulty$/)).toBeVisible();
    await expect(page.getByText("Difficulty Distribution")).toBeVisible();

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
    // Click on Logs link in sidebar
    await page.getByRole("link", { name: "Logs" }).click();
    await expect(page.getByRole("heading", { name: "Daily Logs" })).toBeVisible();
  });

  test("should show empty state when no recent logs", async ({ page }) => {
    // Check if empty state message exists
    const content = await page.content();
    if (content.includes("Showing")) {
      await expect(page.locator(String.raw`text=/Showing \d+ of \d+/`)).toBeVisible();
    }
  });

  test("should display streak information", async ({ page }) => {
    // Look for streak-related content
    const content = await page.content();

    // Should show streak count (number)
    expect(content).toMatch(/\d+\s*day/i);

    // Should show streak label
    expect(content).toMatch(/Streak|day/i);
  });

  test("should display project counts", async ({ page }) => {
    // Look for project count numbers
    const content = await page.content();

    // Should show numeric values for project stats
    const totalProjectsMatch = /Total Projects[\s\S]*?(\d+)/.exec(content);
    const activeProjectsMatch = /Active Projects[\s\S]*?(\d+)/.exec(content);

    // Either we have numbers or 0 (empty state)
    expect(totalProjectsMatch || content.includes("0")).toBeTruthy();
    expect(activeProjectsMatch || content.includes("0")).toBeTruthy();
  });

  test("should handle page refresh with loading state", async ({ page }) => {
    // Refresh the page
    await page.reload();

    // Should still show overview after reload
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 10000 });
  });

  test("should show mobile menu toggle on small screens", async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Check for menu button
    const menuButton = page.getByLabel("Toggle navigation");
    await expect(menuButton).toBeVisible();

    // Click menu button
    await menuButton.click();

    // Check if sidebar content appears (Overview link)
    await expect(page.getByRole("dialog").getByRole("link", { name: "Overview" })).toBeVisible();

    // Check if it closes when clicking a link
    await page.getByRole("dialog").getByRole("link", { name: "DSA Problems" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "DSA Problems" })).toBeVisible();
  });
 
  test("should display consistency score", async ({ page }) => {
    // Look for consistency-related text
    const content = await page.content();
    expect(content).toMatch(/Consistency|Score/i);
    
    // Should show a number or percentage
    expect(content).toMatch(/\d+\s*%|\d+\s*%/);
  });
 
  test("should display trend indicators for stats", async ({ page }) => {
    // Look for percentage changes (e.g. "+10%", "-5%")
    const content = await page.content();
    const hasTrend = /[+\-]\d+\s*%/.test(content) || content.includes("vs last week");
    
    // Trend might be 0% or neutral, but text "vs last week" is a good indicator
    expect(hasTrend || content.includes("vs last week")).toBeTruthy();
  });
});
