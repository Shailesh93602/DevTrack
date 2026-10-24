import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

// The 404 page must follow the Design Rules: no gradients, inline styles,
// shadows or dark: overrides, and it must still link home and to the app.

async function renderNotFound(): Promise<string> {
  const page = (await import("@/app/not-found")) as {
    default: () => ReactElement;
  };
  return renderToStaticMarkup(page.default());
}

function classTokens(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)].flatMap((match) =>
    match[1].split(/\s+/)
  );
}

describe("app/not-found.tsx", () => {
  it("renders a heading and links to /, /dashboard, /login and /signup", async () => {
    const html = await renderNotFound();
    expect(html).toMatch(/<h1[^>]*>Page not found<\/h1>/);
    for (const href of ["/", "/dashboard", "/login", "/signup"]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("has no inline style attribute", async () => {
    expect(await renderNotFound()).not.toMatch(/\sstyle="/);
  });

  it("uses no gradient, shadow or dark: classes", async () => {
    const banned = classTokens(await renderNotFound()).filter((token) => {
      const parts = token.split(":");
      const utility = parts[parts.length - 1];
      return (
        parts.includes("dark") ||
        /^(bg-(gradient|linear|radial|conic)-|from-|via-|to-)/.test(utility) ||
        (/^shadow(-|$)/.test(utility) && utility !== "shadow-none")
      );
    });
    expect(banned).toEqual([]);
  });
});
