import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import { resolveAlternates } from "next/dist/lib/metadata/resolvers/resolve-basics";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import {
  AUTHOR_URL,
  LANDING_FEATURES,
  SITE_URL,
} from "@/lib/seo/structured-data";

/**
 * Canonicals and JSON-LD, checked in what Next actually produces.
 *
 * Live on 2026-10-19 no page carried a canonical and the site had no
 * structured data at all. Canonicals are resolved with Next's own
 * resolveAlternates against the root layout's metadataBase; the JSON-LD is
 * read out of the home page's rendered HTML.
 */
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "" }),
  Geist_Mono: () => ({ variable: "" }),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/auth/supabase-server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

const ROOT = join(__dirname, "..", "..");

type PageModule = { metadata?: Metadata; default?: () => unknown };

const PAGES: Record<string, () => Promise<PageModule>> = {
  "/": () => import("@/app/page"),
  "/login": () => import("@/app/(auth)/login/page"),
  "/signup": () => import("@/app/(auth)/signup/page"),
  "/legal/privacy": () => import("@/app/legal/privacy/page"),
  "/legal/terms": () => import("@/app/legal/terms/page"),
};

async function canonicalOf(route: string): Promise<string | null> {
  const { metadata: root } = (await import("@/app/layout")) as {
    metadata: Metadata;
  };
  const { metadata } = await PAGES[route]();
  const resolved = await resolveAlternates(
    metadata?.alternates ?? root.alternates ?? null,
    root.metadataBase as URL,
    Promise.resolve(route),
    { trailingSlash: false } as never
  );
  return resolved?.canonical?.url?.toString() ?? null;
}

async function homeHtml(): Promise<string> {
  const { default: Home } = await PAGES["/"]();
  const element = (await (
    Home as () => Promise<ReactElement>
  )()) as ReactElement;
  return renderToStaticMarkup(element);
}

function jsonLdNodes(html: string): Array<Record<string, unknown>> {
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ];
  return blocks.flatMap((b) => {
    const doc = JSON.parse(b[1]) as {
      "@graph"?: Array<Record<string, unknown>>;
    };
    return doc["@graph"] ?? [doc as Record<string, unknown>];
  });
}

describe("canonical URLs", () => {
  it("the sitemap and this check cover the same pages", () => {
    const listed = sitemap().map((e) => new URL(e.url).pathname);
    expect(listed.sort()).toEqual(Object.keys(PAGES).sort());
  });

  it.each(Object.keys(PAGES))(
    "%s declares itself as canonical",
    async (route) => {
      const expected = route === "/" ? SITE_URL : `${SITE_URL}${route}`;
      expect(await canonicalOf(route)).toBe(expected);
    }
  );

  it("the root layout declares no canonical (pages would inherit it)", async () => {
    const { metadata } = (await import("@/app/layout")) as {
      metadata: Metadata;
    };
    expect(metadata.alternates?.canonical).toBeUndefined();
  });
});

describe("home page JSON-LD", () => {
  it("renders WebSite and WebApplication once each", async () => {
    const types = jsonLdNodes(await homeHtml()).map((n) => n["@type"]);
    expect(types.filter((t) => t === "WebSite")).toHaveLength(1);
    expect(types.filter((t) => t === "WebApplication")).toHaveLength(1);
  });

  it("every listed feature is a heading the page renders", async () => {
    const html = await homeHtml();
    const app = jsonLdNodes(html).find((n) => n["@type"] === "WebApplication");
    const features = app?.featureList as string[];
    expect(features.length).toBeGreaterThan(0);
    for (const f of features) {
      expect(LANDING_FEATURES).toContain(f);
      expect(html).toContain(`>${f}</h3>`);
    }
  });

  it("the description is the text the hero renders", async () => {
    const html = await homeHtml();
    const site = jsonLdNodes(html).find((n) => n["@type"] === "WebSite");
    expect(html).toContain(`>${site?.description as string}<`);
  });

  it("the author is the person the footer links to", async () => {
    const html = await homeHtml();
    const person = jsonLdNodes(html).find((n) => n["@type"] === "Person");
    expect(person?.url).toBe(AUTHOR_URL);
    expect(html).toContain(`<a href="${AUTHOR_URL}"`);
    expect(html).toMatch(
      /Built by\s*<a href="https:\/\/shaileshchaudhari\.vercel\.app"[^>]*>Shailesh Chaudhari<\/a>/
    );
  });

  it("claims no rating, review or user count", async () => {
    const raw = (await homeHtml()).match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    )?.[1];
    expect(raw).toBeTruthy();
    expect(raw).not.toMatch(/aggregateRating|"review"|userInteractionCount/);
  });
});

describe("robots.txt", () => {
  it("lets every crawler, AI ones included, reach public pages", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    // One `*` group only: a named group would replace it for that bot.
    expect(list.map((r) => r.userAgent)).toEqual(["*"]);
    const disallow = [list[0].disallow].flat();
    for (const path of Object.keys(PAGES)) {
      expect(
        disallow.some((d) => d && path.startsWith(d)),
        path
      ).toBe(false);
    }
    expect(disallow).toContain("/dashboard/");
  });
});

// Cross-tab sync depends on the DailyLog table being in the supabase_realtime
// publication, a database setting the code cannot guarantee. Public copy must
// not promise it; the README keeps the technical note instead.
describe("no cross-tab sync claim in public copy", () => {
  const SYNC_CLAIM = /real-?time|across (every )?tabs?|multi-tab|synced/i;

  it("home page, metadata, manifest, OG image and llms.txt", async () => {
    const { metadata: root } = (await import("@/app/layout")) as {
      metadata: Metadata;
    };
    const { metadata: home } = (await PAGES["/"]()) as { metadata: Metadata };
    const { default: manifest } = await import("@/app/manifest");
    const surfaces: Record<string, string> = {
      "home html": await homeHtml(),
      "root description": String(root.description),
      "home description": String(home.description),
      manifest: String(manifest().description),
      "opengraph-image": readFileSync(
        join(ROOT, "app", "opengraph-image.tsx"),
        "utf8"
      ),
      "llms.txt": readFileSync(join(ROOT, "public", "llms.txt"), "utf8"),
    };
    for (const [surface, text] of Object.entries(surfaces)) {
      expect(text, surface).not.toMatch(SYNC_CLAIM);
    }
  });

  it("the README says Realtime needs the publication step", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    expect(readme).toContain(
      'ALTER PUBLICATION supabase_realtime ADD TABLE "DailyLog";'
    );
    expect(readme).not.toMatch(/sync across tabs via Supabase Realtime/i);
  });
});
