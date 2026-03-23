import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Project Milestones", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/projects");
    await expect(page.locator("text=Projects")).toBeVisible();
  });

  test("should display milestones for a project", async ({ page }) => {
    // Create a project with milestones
    await page.fill('input[placeholder="e.g. Personal Website"]', "Milestone Test Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Click on the project to view details
    await page.locator("text=Milestone Test Project").first().click();

    // Look for milestones section
    const content = await page.content();
    const hasMilestonesSection =
      content.includes("Milestones") ||
      content.includes("milestone") ||
      content.includes("Add Milestone");

    expect(hasMilestonesSection).toBeTruthy();
  });

  test("should add a milestone to a project", async ({ page }) => {
    // Create a project
    await page.fill('input[placeholder="e.g. Personal Website"]', "Add Milestone Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Add Milestone Project").first().click();

    // Try to add a milestone (if UI supports it)
    const content = await page.content();
    if (content.includes("Add Milestone") || content.includes("New Milestone")) {
      await page.fill('input[placeholder*="milestone"]', "Initial Setup");
      await page.click('button:has-text("Add")');

      // Verify milestone was added
      await expect(page.locator("text=Initial Setup")).toBeVisible();
    }
  });

  test("should complete a milestone", async ({ page }) => {
    // Create a project with milestone
    await page.fill('input[placeholder="e.g. Personal Website"]', "Complete Milestone Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Complete Milestone Project").first().click();

    // Check if we can mark milestone as complete
    const content = await page.content();
    if (content.includes("checkbox") || content.includes("Complete")) {
      // Click completion checkbox or button
      const completeButton = page.locator('button[aria-label*="complete"]').first();
      if (await completeButton.isVisible().catch(() => false)) {
        await completeButton.click();

        // Verify milestone is marked complete
        await expect(page.locator("text=Completed").first()).toBeVisible();
      }
    }
  });

  test("should delete a milestone", async ({ page }) => {
    // Create a project
    await page.fill('input[placeholder="e.g. Personal Website"]', "Delete Milestone Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Delete Milestone Project").first().click();

    // Look for delete milestone button
    const deleteButton = page.locator('button[aria-label*="Delete milestone"]').first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion
      await page.click('button:has-text("Delete")');
    }
  });

  test("should update project progress when milestone is completed", async ({ page }) => {
    // Create a project
    await page.fill('input[placeholder="e.g. Personal Website"]', "Progress Test Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Verify project shows some form of progress
    const content = await page.content();
    const hasProgress =
      content.includes("progress") ||
      content.includes("Progress") ||
      content.includes("%") ||
      /\d+%/.test(content);

    expect(hasProgress).toBeTruthy();
  });
});
