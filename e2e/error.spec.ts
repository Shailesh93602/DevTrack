import { test, expect } from "@playwright/test";

test.describe("Error Pages", () => {
  test("should display 404 page for non-existent routes", async ({ page }) => {
    // Navigate to a definitely non-existent route
    await page.goto("/definitely-not-a-route-123", {
      waitUntil: "networkidle",
    });

    // Should show 404 text or Not Found. Previously written as
    // `text=Page Not Found, text=404` which Playwright does not parse
    // as a union — the comma is not a CSS combinator for the text
    // engine, so the selector never matched and the test gave false
    // coverage.
    await expect(page.getByText(/Page Not Found|404/i).first()).toBeVisible();

    // Should have a link back to home
    await expect(
      page.getByRole("link", { name: /Go Back|Home|Dashboard/i })
    ).toBeVisible();
  });
});
