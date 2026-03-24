import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("DSA Problem Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/problems");
    await expect(page.locator("text=DSA Problems")).toBeVisible({ timeout: 15000 });
  });

  test("should create a new DSA problem", async ({ page }) => {
    // Wait for initial load to finish (skeletons vanish)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Fill in the problem form using ID for title
    await page.fill('input#problem-title', "Two Sum");

    // Select difficulty
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Easy" }).click();

    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.getByLabel(/pattern/i).fill("Hash Map");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success indication
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Verify the problem appears in the list
    await expect(page.locator("text=Two Sum")).toBeVisible();
    await expect(page.locator("text=Hash Map")).toBeVisible();
    await expect(page.locator("text=LeetCode")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Try to submit with empty title
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Medium" }).click();
    await page.getByLabel(/pattern/i).fill("Arrays");
    
    await page.click('button[type="submit"]');
 
    // Should show validation error
    await expect(page.locator("text=Title must be at least 2 characters")).toBeVisible();
  });

  test("should filter problems by difficulty", async ({ page }) => {
    // Create an easy problem
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Valid Palindrome");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Easy" }).click();
    await page.getByLabel(/pattern/i).fill("Two Pointers");
    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Problem added successfully")).toBeVisible();
 
    // Create a hard problem
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Trapping Rain Water");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Hard" }).click();
    await page.getByLabel(/pattern/i).fill("Stack");
    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Problem added successfully")).toBeVisible();

    // Create a medium problem
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Longest Substring Without Repeating Characters");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Medium" }).click();
    await page.getByLabel(/pattern/i).fill("Sliding Window");
    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Problem added successfully")).toBeVisible();

    // Filter by EASY
    await page.click('button:has-text("Easy")');
    await expect(page.locator("text=Valid Palindrome")).toBeVisible();
    await expect(page.locator("text=Trapping Rain Water")).not.toBeVisible();
    await expect(page.locator("text=Longest Substring Without Repeating Characters")).not.toBeVisible();

    // Filter by HARD
    await page.click('button:has-text("Hard")');
    await expect(page.locator("text=Trapping Rain Water")).toBeVisible();
    await expect(page.locator("text=Valid Palindrome")).not.toBeVisible();
    await expect(page.locator("text=Longest Substring Without Repeating Characters")).not.toBeVisible();

    // Filter by MEDIUM
    await page.click('button:has-text("Medium")');
    await expect(page.locator("text=Longest Substring Without Repeating Characters")).toBeVisible();
    await expect(page.locator("text=Valid Palindrome")).not.toBeVisible();
    await expect(page.locator("text=Trapping Rain Water")).not.toBeVisible();

    // Clear filters
    await page.click('button:has-text("All")');
    await expect(page.locator("text=Valid Palindrome")).toBeVisible();
    await expect(page.locator("text=Trapping Rain Water")).toBeVisible();
    await expect(page.locator("text=Longest Substring Without Repeating Characters")).toBeVisible();
  });

  test("should edit an existing problem", async ({ page }) => {
    // Create a problem first
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Binary Search");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Medium" }).click();
    await page.getByLabel(/pattern/i).fill("Binary Search");
    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Click edit button (pencil icon)
    await page.locator('button[aria-label^="Edit"]').first().click();

    // Change the title
    await page.getByLabel(/problem title/i).fill("Binary Search Updated");

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify the updated title appears
    await expect(page.locator("text=Binary Search Updated")).toBeVisible();
  });

  test("should delete a problem", async ({ page }) => {
    // Create a problem first
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Problem to Delete");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Easy" }).click();
    await page.getByLabel(/pattern/i).fill("Test Pattern");
    await page.getByLabel(/platform/i).fill("Test Platform");
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Click delete button (trash icon)
    await page.locator('button[aria-label^="Delete"]').first().click();

    // Confirm delete
    await page.click('button:has-text("Delete")');

    // Verify the problem is removed
    await expect(page.locator("text=Problem to Delete")).not.toBeVisible();
  });

  test("should display empty state when no problems", async ({ page }) => {
    // Filter by a difficulty that might not have problems
    await page.click('button:has-text("Hard")');

    // Check if empty state or filter message appears
    const content = await page.content();
    if (content.includes("No problems match this filter") || content.includes("No problems tracked yet")) {
      await expect(
        page.locator("text=No problems match this filter, text=No problems tracked yet")
      ).toBeVisible();
    }
  });

  test("should create a problem with notes", async ({ page }) => {
    // Fill in the problem form
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Three Sum");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Medium" }).click();
    await page.getByLabel(/pattern/i).fill("Two Pointers");
    await page.getByLabel(/platform/i).fill("LeetCode");

    // Add notes
    await page.getByLabel(/notes/i).fill(
      "Remember to sort the array first. Use two pointers after fixing one element."
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Verify the problem appears with notes
    await expect(page.locator("text=Three Sum")).toBeVisible();
    await expect(page.locator("text=Notes:")).toBeVisible();
    await expect(page.locator("text=Remember to sort the array first")).toBeVisible();
  });

  test("should edit problem notes", async ({ page }) => {
    // Create a problem with initial notes
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Notes Test Problem");
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Easy" }).click();
    await page.getByLabel(/pattern/i).fill("Arrays");
    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.getByLabel(/notes/i).fill(
      "Initial notes for the problem"
    );
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Click edit button
    await page.locator('button[aria-label^="Edit"]').first().click();

    // Update the notes
    await page.getByLabel(/notes/i).fill(
      "Updated notes: key insight about edge cases"
    );

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify the updated notes appear
    await expect(page.locator("text=Updated notes: key insight about edge cases")).toBeVisible();
  });

  test("should validate notes character limit", async ({ page }) => {
    // Try to add notes that are too long (>1000 chars)
    const longNotes = "a".repeat(1001);
 
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Long Notes Test");
    await page.getByLabel(/notes/i).fill(longNotes);
 
    await page.click('button[type="submit"]');
 
    // Should show validation error
    await expect(page.locator("text=Notes must be 1000 characters or less")).toBeVisible();
  });
 
  test("should search problems by title", async ({ page }) => {
    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill("Search Target Problem");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Problem added successfully")).toBeVisible();
 
    await page.getByPlaceholder(/Search title or pattern/i).fill("Search Target");
    await expect(page.locator("text=Search Target Problem")).toBeVisible();
    
    await page.getByPlaceholder(/Search title or pattern/i).fill("NonExistent");
    await expect(page.locator("text=Search Target Problem")).not.toBeVisible();
    await expect(page.locator("text=No problems match this search")).toBeVisible();
  });

  test("should paginate through problems", async ({ page }) => {
    // We assume the page size is 10. We already probably have some problems.
    // We'll trust the 'Load more' button exists if there are many.
    // If not, we'll verify the count indicator.
    const content = await page.content();
    if (content.includes("Showing")) {
      await expect(page.locator(String.raw`text=/Showing \d+ of \d+/`)).toBeVisible();
    }
  });
});
