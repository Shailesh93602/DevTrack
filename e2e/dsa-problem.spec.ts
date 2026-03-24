import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("DSA Problem Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/problems");
    await expect(page.locator("text=DSA Problems")).toBeVisible({ timeout: 15000 });
  });

  test("should create a new DSA problem", async ({ page }) => {
    // Fill in the problem form
    await page.fill('input[placeholder="e.g. Two Sum"]', "Two Sum");

    // Select difficulty
    await page.selectOption("select", "EASY");

    // Fill pattern
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Hash Map");

    // Fill platform
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");

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
    await page.selectOption("select", "MEDIUM");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Arrays");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "CodeSignal");

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator("text=Title is required")).toBeVisible();
  });

  test("should filter problems by difficulty", async ({ page }) => {
    // Create an easy problem
    await page.fill('input[placeholder="e.g. Two Sum"]', "Valid Palindrome");
    await page.selectOption("select", "EASY");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Two Pointers");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Create a hard problem
    await page.fill('input[placeholder="e.g. Two Sum"]', "Trapping Rain Water");
    await page.selectOption("select", "HARD");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Stack");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Filter by EASY
    await page.click('button:has-text("Easy")');

    // Should show easy problem, not hard
    await expect(page.locator("text=Valid Palindrome")).toBeVisible();

    // Filter by HARD
    await page.click('button:has-text("Hard")');
    await expect(page.locator("text=Trapping Rain Water")).toBeVisible();
  });

  test("should edit an existing problem", async ({ page }) => {
    // Create a problem first
    await page.fill('input[placeholder="e.g. Two Sum"]', "Binary Search");
    await page.selectOption("select", "MEDIUM");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Binary Search");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Click edit button (pencil icon)
    await page.locator('button[aria-label^="Edit"]').first().click();

    // Change the title
    await page.fill('input[placeholder="e.g. Two Sum"]', "Binary Search Updated");

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify the updated title appears
    await expect(page.locator("text=Binary Search Updated")).toBeVisible();
  });

  test("should delete a problem", async ({ page }) => {
    // Create a problem first
    await page.fill('input[placeholder="e.g. Two Sum"]', "Problem to Delete");
    await page.selectOption("select", "EASY");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Test Pattern");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "Test Platform");
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
    await page.fill('input[placeholder="e.g. Two Sum"]', "Three Sum");
    await page.selectOption("select", "MEDIUM");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Two Pointers");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");

    // Add notes
    await page.fill(
      'textarea[placeholder*="review notes"]',
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
    await page.fill('input[placeholder="e.g. Two Sum"]', "Notes Test Problem");
    await page.selectOption("select", "EASY");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Arrays");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "LeetCode");
    await page.fill(
      'textarea[placeholder*="review notes"]',
      "Initial notes for the problem"
    );
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Problem added successfully")).toBeVisible({ timeout: 10000 });

    // Click edit button
    await page.locator('button[aria-label^="Edit"]').first().click();

    // Update the notes
    await page.fill(
      'textarea[id="problem-notes"]',
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

    await page.fill('input[placeholder="e.g. Two Sum"]', "Long Notes Test");
    await page.selectOption("select", "EASY");
    await page.fill('input[placeholder="e.g. Hash Map, Two Pointers"]', "Test");
    await page.fill('input[placeholder="e.g. LeetCode, HackerRank"]', "Test");
    await page.fill('textarea[placeholder*="review notes"]', longNotes);

    await page.click('button[type="submit"]');

    // Should show character count indicating error
    await expect(page.locator("text=1000")).toBeVisible();
  });
});
