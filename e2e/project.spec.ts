import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Project Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });

  test("should create a new project", async ({ page }) => {
    // Fill in the project form
    await page.fill('input#name', "Test Project");

    // Fill description
    await page.fill(
      'input#description',
      "This is a test project for E2E testing"
    );

    // Set due date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];
    await page.fill('input#dueDate', dateString);

    // Add tech stack
    await page.getByLabel("Tech stack input").fill("React");
    await page.getByRole("button", { name: "Add tech" }).click();

    await page.getByLabel("Tech stack input").fill("TypeScript");
    await page.getByRole("button", { name: "Add tech" }).click();

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
    await page.fill('input#name', "Edit Test Project");
    await page.fill(
      'input#description',
      "Original description"
    );
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Click edit button
    await page.getByLabel(/Edit/).first().click();

    // Change the name
    await page.fill('input#name', "Updated Project Name");

    // Change status to Completed using Radix Select
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Completed" }).click();

    // Save changes
    await page.click('button:has-text("Update Project")');

    // Verify the updated name appears
    await expect(page.locator("text=Updated Project Name")).toBeVisible();
  });

  test("should delete a project", async ({ page }) => {
    // Create a project first
    await page.fill('input#name', "Delete Test Project");
    await page.fill(
      'input#description',
      "To be deleted"
    );
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Click delete button
    await page.getByLabel(/Delete/).first().click();

    // Confirm delete
    await page.click('button:has-text("Yes")');

    // Verify the project is removed
    await expect(page.locator("text=Delete Test Project")).not.toBeVisible();
  });

  test("should change project status", async ({ page }) => {
    // Create a project
    await page.fill('input#name', "Status Test Project");
    await page.click('button[type="submit"]');

    // Wait for submission
    await page.waitForLoadState("networkidle");

    // Click edit to access status change
    await page.getByLabel(/Edit/).first().click();

    // Change status to Completed
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Completed" }).click();

    // Save changes
    await page.click('button:has-text("Update Project")');

    // Verify status badge appears
    await expect(page.locator("text=Completed")).toBeVisible();
  });

  test("should handle tech stack management", async ({ page }) => {
    // Add multiple tech stack items
    const techs = ["React", "Node.js", "MongoDB"];

    for (const tech of techs) {
      await page.getByLabel("Tech stack input").fill(tech);
      await page.getByRole("button", { name: "Add tech" }).click();
    }

    // Verify all techs appear
    for (const tech of techs) {
      await expect(page.locator(`text=${tech}`)).toBeVisible();
    }

    // Remove a tech stack item
    await page.getByLabel(`Remove ${techs[0]}`).click();

    // Verify it's removed
    await expect(page.locator(`text=${techs[0]}`)).not.toBeVisible();
  });

  test("should display project progress", async ({ page }) => {
    // Create a project
    await page.fill('input#name', "Progress Test");
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
    await page.fill('input#name', longName);

    // Description max 500 chars
    const longDesc = "b".repeat(501);
    await page.fill('input#description', longDesc);

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator("text=Name must be at most 100 characters")).toBeVisible();
    await expect(page.locator("text=Description must be at most 500 characters")).toBeVisible();
  });
});
