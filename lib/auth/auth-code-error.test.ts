import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// A failed code exchange must land on a page that exists, tells the user what
// happened, links back to sign-in and stays out of search results.

vi.mock("@/lib/auth/supabase-server", () => ({
  createServerSupabaseClient: async () => ({
    auth: {
      exchangeCodeForSession: async () => ({ error: new Error("bad code") }),
    },
  }),
}));

const ROOT = join(__dirname, "..", "..");

async function failedCallbackPath(query: string): Promise<string> {
  const { GET } = await import("@/app/auth/callback/route");
  const response = await GET(
    new Request(`https://devtrack.test/auth/callback${query}`)
  );
  expect(response.status).toBe(307);
  return new URL(String(response.headers.get("location"))).pathname;
}

describe("/auth/callback error page", () => {
  it("redirects a failed or missing code to a page that exists", async () => {
    for (const query of ["", "?code=expired"]) {
      const path = await failedCallbackPath(query);
      expect(path).toBe("/auth/auth-code-error");
      expect(existsSync(join(ROOT, "app", path, "page.tsx")), path).toBe(true);
    }
  });

  it("renders a heading, a message and a link back to /login", async () => {
    const page = (await import("@/app/auth/auth-code-error/page")) as {
      default: () => ReactElement;
    };
    const html = renderToStaticMarkup(page.default());
    expect(html).toMatch(/<h1[^>]*>[^<]+/);
    expect(html).toContain("expired");
    expect(html).toMatch(/<a[^>]*href="\/login"/);
  });

  it("is noindex", async () => {
    const { metadata } = (await import("@/app/auth/auth-code-error/page")) as {
      metadata: Metadata;
    };
    expect(metadata.robots).toMatchObject({ index: false });
  });
});
