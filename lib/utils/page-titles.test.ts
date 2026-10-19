import type { Metadata } from "next";
import { resolveTitle } from "next/dist/lib/metadata/resolvers/resolve-title";
import { describe, expect, it, vi } from "vitest";

// Resolves each page's real `metadata` against the root layout's template with
// Next's own resolveTitle — the doubled brand only exists after that step.

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "" }),
  Geist_Mono: () => ({ variable: "" }),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

type PageModule = { metadata?: Metadata };

const ROUTES: Record<string, () => Promise<PageModule>> = {
  "/legal/privacy": () => import("@/app/legal/privacy/page"),
  "/legal/terms": () => import("@/app/legal/terms/page"),
  "/login": () => import("@/app/(auth)/login/page"),
  "/signup": () => import("@/app/(auth)/signup/page"),
};

async function rootLayoutMetadata(): Promise<Metadata> {
  const layout = (await import("@/app/layout")) as { metadata: Metadata };
  return layout.metadata;
}

async function resolvedTitles() {
  const root = await rootLayoutMetadata();
  const rootTitle = resolveTitle(root.title ?? null, null);
  return Promise.all(
    Object.entries(ROUTES).map(async ([route, load]) => {
      const { metadata } = await load();
      const title = metadata?.title
        ? resolveTitle(metadata.title, rootTitle.template).absolute
        : rootTitle.absolute;
      return {
        route,
        title,
        description: metadata?.description ?? root.description,
      };
    })
  );
}

describe("page titles (LIVE_SMOKE_2026-10-19 D3)", () => {
  it("names the brand exactly once on every checked route", async () => {
    for (const page of await resolvedTitles()) {
      expect(page.title.split("DevTrack").length - 1, page.title).toBe(1);
    }
  });

  it("gives each checked route its own title and description", async () => {
    const root = await rootLayoutMetadata();
    const rootTitle = resolveTitle(root.title ?? null, null).absolute;
    const pages = await resolvedTitles();
    for (const page of pages) {
      expect(page.title, page.route).not.toBe(rootTitle);
      expect(page.description, page.route).toBeTruthy();
      expect(page.description, page.route).not.toBe(root.description);
    }
    const titles = pages.map((page) => page.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
