import { existsSync } from "node:fs";
import { join } from "node:path";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieToSet = { name: string; value: string; options?: object };
type CookieAdapter = { setAll: (cookies: CookieToSet[]) => void };

let currentUser: { id: string; email: string } | null = null;
let refreshedCookies: CookieToSet[] = [];

// Stands in for Supabase: getUser() refreshes an expired session and hands the
// rotated tokens to setAll, as @supabase/ssr does.
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    config: { cookies: CookieAdapter }
  ) => ({
    auth: {
      getUser: async () => {
        if (refreshedCookies.length) config.cookies.setAll(refreshedCookies);
        return { data: { user: currentUser } };
      },
    },
  }),
}));

const ROOT = join(__dirname, "..", "..");

// Next only runs a proxy (formerly middleware) from the project root; one in lib/ is never loaded.
describe("auth proxy is the file Next loads", () => {
  it("lives at the repo root, not under lib/", () => {
    expect(existsSync(join(ROOT, "proxy.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib", "utils", "proxy.ts"))).toBe(false);
  });
});

describe("auth proxy behaviour", async () => {
  const { default: proxy, config } = await import("@/proxy");
  const request = (path: string) => new NextRequest(`http://localhost${path}`);

  beforeEach(() => {
    currentUser = null;
    refreshedCookies = [];
  });

  it("covers the dashboard and login routes", () => {
    expect(config.matcher).toEqual(["/dashboard/:path*", "/login"]);
  });

  it("sends a signed-out visitor from /dashboard to /login", async () => {
    const response = await proxy(request("/dashboard/projects"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("sends a signed-in user from /login to /dashboard", async () => {
    currentUser = { id: "user-1", email: "user@example.com" };
    const response = await proxy(request("/login"));
    expect(response.headers.get("location")).toBe("http://localhost/dashboard");
  });

  // Server components cannot write cookies, so this is the only place a
  // refreshed (rotated) token pair reaches the browser.
  it("writes the refreshed session cookies onto the response", async () => {
    currentUser = { id: "user-1", email: "user@example.com" };
    refreshedCookies = [{ name: "sb-auth-token", value: "rotated-pair" }];
    const response = await proxy(request("/dashboard"));
    expect(response.cookies.get("sb-auth-token")?.value).toBe("rotated-pair");
  });
});
