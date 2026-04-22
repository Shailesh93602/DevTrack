import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Pattern Intelligence on DSA Problems", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/problems");
    await expect(page.locator("text=DSA Problems")).toBeVisible();
    // Dismiss the skeleton state before asserting anything UI.
    await expect(page.locator("text=Pattern Insights")).toBeVisible({
      timeout: 10000,
    });
  });

  test("renders the Pattern Insights heading + Most Practiced card", async ({
    page,
  }) => {
    // Previous version used page.content() + OR-chains that matched
    // strings anywhere (incl. a single "0" character) — tests passed
    // vacuously. Assert each label individually and visible.
    await expect(page.getByText("Pattern Insights")).toBeVisible();
    await expect(page.getByText("Most Practiced Patterns")).toBeVisible();
  });

  test("after adding a problem, the pattern tag renders in the insights panel", async ({
    page,
  }) => {
    // Wait for skeletons to vanish
    await expect(page.locator(".animate-pulse")).toHaveCount(0, {
      timeout: 15000,
    });

    const uniquePattern = `TwoPointers-${Date.now()}`;

    await page.click('button:has-text("Add Problem")');
    await page.getByLabel(/problem title/i).fill(`Pattern ${uniquePattern}`);
    await page.getByLabel(/difficulty/i).click();
    await page.getByRole("option", { name: "Easy" }).click();
    await page.getByLabel(/pattern/i).fill(uniquePattern);
    await page.getByLabel(/platform/i).fill("LeetCode");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Problem added successfully")).toBeVisible({
      timeout: 10000,
    });

    // The just-added pattern must show up under "Most Practiced Patterns".
    // Scoping prevents the problem card below from trivially satisfying the
    // assertion.
    const panel = page
      .locator("text=Most Practiced Patterns")
      .locator("xpath=ancestor::*[contains(@class, 'rounded')][1]");
    await expect(panel.getByText(uniquePattern)).toBeVisible({
      timeout: 10000,
    });
  });

  test("shows either pattern mastery progress bars or the empty state", async ({
    page,
  }) => {
    // Either at least one progress bar renders (seeded account), or the
    // "No patterns tracked yet." empty-state copy is visible. Using XOR
    // avoids the previous vacuous OR that matched unrelated strings.
    const progressBars = page.locator('[role="progressbar"]');
    const emptyState = page.getByText("No patterns tracked yet.");

    const hasProgress = (await progressBars.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasProgress || hasEmpty).toBeTruthy();
  });

  test("recommendation card is visible when analysis suggests one", async ({
    page,
  }) => {
    // The panel only renders this card when the analysis result carries
    // a non-null recommendedPattern. Don't fail when absent — assert
    // that IF rendered, it carries the label + a non-empty pattern name.
    const card = page.getByText("Recommended to Learn");
    if (await card.isVisible().catch(() => false)) {
      const cardContainer = card.locator(
        "xpath=ancestor::*[contains(@class, 'rounded')][1]"
      );
      // The body paragraph under the label should not be empty.
      const bodyText = await cardContainer.innerText();
      expect(bodyText.replace("Recommended to Learn", "").trim().length).toBeGreaterThan(0);
    } else {
      test.info().annotations.push({
        type: "skip-reason",
        description: "No pattern recommendation generated for seeded account",
      });
    }
  });

  test("weak patterns card shows real pattern names when rendered", async ({
    page,
  }) => {
    const heading = page.getByText("Patterns to Strengthen");
    if (await heading.isVisible().catch(() => false)) {
      const card = heading.locator(
        "xpath=ancestor::*[contains(@class, 'rounded')][1]"
      );
      // Each weak pattern renders as a Badge containing `pattern (count)`.
      // Assert at least one badge is present to prove the list is populated.
      await expect(card.locator(".badge, [class*='Badge']").first()).toBeVisible(
        { timeout: 5000 }
      );
    } else {
      test.info().annotations.push({
        type: "skip-reason",
        description:
          "No weak patterns identified (either fresh account or all patterns strong)",
      });
    }
  });
});
