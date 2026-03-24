import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Project Milestones", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/projects");
    await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  });

  test("should display milestones for a project", async ({ page }) => {
    // Create a project with milestones
    await page.fill('input#name', "Milestone Test Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Click on the project to view details
    await page.locator("text=Milestone Test Project").first().click();

    // Look for milestones section
    await expect(page.getByRole("heading", { name: "Milestones" })).toBeVisible();
  });

  test("should add a milestone to a project", async ({ page }) => {
    // Create a project
    await page.fill('input#name', "Add Milestone Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Add Milestone Project").first().click();

    // Click Add Milestone button
    await page.getByRole("button", { name: "Add Milestone" }).click();

    // Fill in milestone title
    await page.fill('input#milestone-title', "Initial Setup");

    // Submit
    await page.getByRole("button", { name: "Add Milestone" }).click();

    // Verify milestone was added
    await expect(page.locator("text=Initial Setup")).toBeVisible();
  });

  test("should complete a milestone", async ({ page }) => {
    // Create a project with milestone
    await page.fill('input#name', "Complete Milestone Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Complete Milestone Project").first().click();

    // Add a milestone first
    await page.getByRole("button", { name: "Add Milestone" }).click();
    await page.fill('input#milestone-title', "Test Milestone");
    await page.getByRole("button", { name: "Add Milestone" }).click();

    // Complete the milestone using the checkbox
    await page.getByLabel("Complete Test Milestone").check();

    // Verify milestone is marked complete
    await expect(page.getByText("Test Milestone")).toHaveClass(/line-through/);
  });

  test("should delete a milestone", async ({ page }) => {
    // Create a project
    await page.fill('input#name', "Delete Milestone Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Delete Milestone Project").first().click();

    // Add a milestone first
    await page.getByRole("button", { name: "Add Milestone" }).click();
    await page.fill('input#milestone-title', "Milestone to Delete");
    await page.getByRole("button", { name: "Add Milestone" }).click();

    // Delete the milestone
    await page.getByLabel("Delete Milestone to Delete").click();

    // Verify milestone is removed
    await expect(page.locator("text=Milestone to Delete")).not.toBeVisible();
  });

  test("should update project progress when milestone is completed", async ({ page }) => {
    // Create a project
    await page.fill('input#name', "Progress Test Project");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // Open project details
    await page.locator("text=Progress Test Project").first().click();

    // Verify project shows progress
    await expect(page.getByText(/Progress/)).toBeVisible();
    await expect(page.getByText(/0%/)).toBeVisible();

    // Add a milestone
    await page.getByRole("button", { name: "Add Milestone" }).click();
    await page.fill('input#milestone-title', "First Milestone");
    await page.getByRole("button", { name: "Add Milestone" }).click();

    // Complete the milestone
    await page.getByLabel("Complete First Milestone").check();

    // Verify progress is now 100%
    await expect(page.getByText(/100%/)).toBeVisible();
  });
});
