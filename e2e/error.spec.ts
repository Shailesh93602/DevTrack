import { test, expect } from "@playwright/test";

test.describe("Error Pages", () => {
  test("should display 404 page for non-existent routes", async ({ page }) => {
    // Navigate to a definitely non-existent route
    await page.goto("/definitely-not-a-route-123", { waitUntil: "networkidle" });

    // Should show 404 text or Not Found
    await expect(page.locator("text=Page Not Found, text=404")).toBeVisible();
    
    // Should have a link back to home
    await expect(page.getByRole("link", { name: /Go Back|Home|Dashboard/i })).toBeVisible();
  });
});
