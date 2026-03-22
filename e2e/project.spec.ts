import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Project Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/projects");
    await expect(page.locator("text=Projects")).toBeVisible();
  });

  test("should create a new project", async ({ page }) => {
    // Fill in the project form
    await page.fill('input[placeholder="e.g. Personal Website"]', "Test Project");

    // Fill description
    await page.fill(
      'input[placeholder="Brief description of your project"]', 
      "This is a test project for E2E testing"
    );

    // Set due date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];
    await page.fill('input[type="date"]', dateString);

    // Add tech stack
    await page.fill('input[placeholder="e.g. React, Node.js, PostgreSQL"]', "React");
    await page.click('button:has-text("Add")');

    await page.fill('input[placeholder="e.g. React, Node.js, PostgreSQL"]', "TypeScript");
    await page.click('button:has-text("Add")');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success (page refresh)
    await page.waitForLoadState("networkidle");

    // Verify the project appears in the list
    await expect(page.locator("text=Test Project")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Try to submit without a name
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("should edit an existing project", async ({ page }) => {
    // Create a project first
    await page.fill('input[placeholder="e.g. Personal Website"]', "Edit Test Project");
    await page.fill(
      'input[placeholder="Brief description of your project"]', 
      "Original description"
    );
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Click edit button (pencil icon)
    await page.locator('button[aria-label^="Edit"]').first().click();

    // Change the name
    await page.fill('input[placeholder="e.g. Personal Website"]', "Updated Project Name");

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify the updated name appears
    await expect(page.locator("text=Updated Project Name")).toBeVisible();
  });

  test("should delete a project", async ({ page }) => {
    // Create a project first
    await page.fill('input[placeholder="e.g. Personal Website"]', "Delete Test Project");
    await page.fill(
      'input[placeholder="Brief description of your project"]', 
      "To be deleted"
    );
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Click delete button (trash icon)
    await page.locator('button[aria-label^="Delete"]').first().click();

    // Confirm delete
    await page.click('button:has-text("Delete")');

    // Verify the project is removed
    await expect(page.locator("text=Delete Test Project")).not.toBeVisible();
  });

  test("should change project status", async ({ page }) => {
    // Create a project
    await page.fill('input[placeholder="e.g. Personal Website"]', "Status Test Project");
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Click edit to access status change
    await page.locator('button[aria-label^="Edit"]').first().click();

    // Change status to Completed
    await page.selectOption("select", "COMPLETED");

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify status badge appears
    await expect(page.locator("text=Completed")).toBeVisible();
  });

  test("should handle tech stack management", async ({ page }) => {
    // Add multiple tech stack items
    const techs = ["React", "Node.js", "MongoDB"];

    for (const tech of techs) {
      await page.fill('input[placeholder="e.g. React, Node.js, PostgreSQL"]', tech);
      await page.click('button:has-text("Add")');
    }

    // Verify all techs appear
    for (const tech of techs) {
      await expect(page.locator(`text=${tech}`)).toBeVisible();
    }

    // Remove a tech stack item
    await page.locator(`button[aria-label="Remove \"${techs[0]}\""]`).click();

    // Verify it's removed
    await expect(page.locator(`text=${techs[0]}`)).not.toBeVisible();
  });

  test("should display project progress", async ({ page }) => {
    // Create a project
    await page.fill('input[placeholder="e.g. Personal Website"]', "Progress Test");
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Look for progress indicator or status
    const content = await page.content();
    expect(content).toMatch(/In Progress|IN_PROGRESS|progress/i);
  });

  test("should handle character limits", async ({ page }) => {
    // Name max 100 chars
    const longName = "a".repeat(101);
    await page.fill('input[placeholder="e.g. Personal Website"]', longName);

    // Description max 500 chars
    const longDesc = "b".repeat(501);
    await page.fill('input[placeholder="Brief description of your project"]', longDesc);

    await page.click('button[type="submit"]');

    // Should show character limit indicators
    await expect(page.locator("text=100")).toBeVisible();
    await expect(page.locator("text=500")).toBeVisible();
  });
});
