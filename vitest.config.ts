import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only (Playwright owns e2e). Resolves the `@/` alias the app uses.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
