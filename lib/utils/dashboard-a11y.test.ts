import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { MilestoneList } from "@/components/dashboard/MilestoneList";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";

// The axe violations found on the dashboard pages (2026-10-25, signed-in
// sweep against a local DB): gridcells with no row, unnamed progress bars, an
// icon-only link, low-contrast recommendation text, and no h1.

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {} }),
}));

const project = {
  id: "proj1",
  name: "Axe Project",
  description: null,
  status: "IN_PROGRESS" as const,
  progress: 40,
  dueDate: null,
  techStack: [],
  createdAt: "2026-10-01T00:00:00.000Z",
};

const tags = (html: string, pattern: RegExp) => html.match(pattern) ?? [];

describe("dashboard accessibility", () => {
  it("heatmap cells are named images, never orphan gridcells", () => {
    const html = renderToStaticMarkup(
      createElement(ActivityHeatmap, { data: [] })
    );
    expect(html).not.toContain('role="gridcell"');
    const cells = tags(html, /<div[^>]*activity on[^>]*>/g);
    expect(cells.length).toBeGreaterThan(80);
    for (const cell of cells) expect(cell).toContain('role="img"');
  });

  it("every progress bar has an accessible name with its value", () => {
    const html = [
      renderToStaticMarkup(createElement(ProjectList, { projects: [project] })),
      renderToStaticMarkup(
        createElement(MilestoneList, { projectId: "proj1", milestones: [] })
      ),
    ].join("");
    const bars = tags(html, /<div[^>]*role="progressbar"[^>]*>/g);
    expect(bars.length).toBe(2);
    for (const bar of bars) expect(bar).toMatch(/aria-label="[^"]*\d+%"/);
  });

  it("every project link has discernible text", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectList, { projects: [project] })
    );
    for (const [, attrs, body] of html.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/g)) {
      const text = body.replace(/<[^>]*>/g, "").trim();
      expect(text || /aria-label="[^"]+"/.exec(attrs)?.[0]).toBeTruthy();
    }
  });

  it("recommendation badges and metrics use theme tokens at full contrast", () => {
    const html = renderToStaticMarkup(
      createElement(RecommendationsCard, {
        recommendations: [
          {
            id: "r1",
            urgency: "high",
            icon: "!",
            title: "Log today",
            reason: "Keep the streak",
            cta: { label: "Log", href: "/dashboard/logs" },
            metric: { label: "Streak", value: 3 },
          },
        ],
      })
    );
    expect(html).not.toMatch(/amber-|dark:|text-muted-foreground\/80/);
  });

  it.each(["logs", "problems", "projects", "projects/[id]", "settings"])(
    "/dashboard/%s renders an h1",
    (route) => {
      const source = readFileSync(
        join(
          __dirname,
          "..",
          "..",
          "app",
          "(dashboard)",
          "dashboard",
          route,
          "page.tsx"
        ),
        "utf8"
      );
      expect(source).toMatch(/<h1[\s>]/);
    }
  );
});

describe("settings time-zone row", () => {
  it("returns one snapshot object until the store changes (no render loop)", async () => {
    const { getClientSnapshot } =
      await import("@/components/dashboard/DetectedTimezoneRow");
    const first = getClientSnapshot();
    expect(first?.tz).toBeTruthy();
    expect(getClientSnapshot()).toBe(first);
  });
});
