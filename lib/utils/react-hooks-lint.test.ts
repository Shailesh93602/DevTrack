import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

// eslint-config-next 16.4.2 brings react-hooks/set-state-in-effect. These four
// components were rewritten to the patterns React recommends (store the
// previous prop, derive, useSyncExternalStore); the rule must stay on and
// they must stay clean under it.

const ROOT = join(__dirname, "..", "..");
const RULE = "react-hooks/set-state-in-effect";
const FILES = [
  "hooks/useRealtimeLogs.ts",
  "components/dashboard/PaginatedProblemList.tsx",
  "components/dashboard/SessionTracker.tsx",
];

const eslint = new ESLint({ cwd: ROOT });

describe(
  RULE,
  () => {
    it("is enabled as an error by the repo config", async () => {
      for (const file of FILES) {
        const config = await eslint.calculateConfigForFile(join(ROOT, file));
        const setting = config.rules?.[RULE];
        const severity = Array.isArray(setting) ? setting[0] : setting;
        expect([2, "error"], file).toContain(severity);
      }
    });

    it("eslint-config-next is pinned exactly to 16.4.2", () => {
      const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
      expect(pkg.devDependencies["eslint-config-next"]).toBe("16.4.2");
    });

    it("reports nothing in the rewritten components", async () => {
      const results = await eslint.lintFiles(FILES.map((f) => join(ROOT, f)));
      const hits = results.flatMap((result) =>
        result.messages
          .filter((message) => message.ruleId === RULE)
          .map((message) => `${result.filePath}:${message.line}`)
      );
      expect(hits).toEqual([]);
    });

    it("is not switched off inline", () => {
      for (const file of FILES) {
        const source = readFileSync(join(ROOT, file), "utf8");
        expect(source, file).not.toMatch(
          /eslint-disable[^\n]*set-state-in-effect/
        );
      }
    });
  },
  30_000
);
