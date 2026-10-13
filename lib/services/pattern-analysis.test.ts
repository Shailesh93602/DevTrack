import { describe, it, expect } from "vitest";
import {
  buildPatternAnalysis,
  calculatePatternStats,
  countPatterns,
} from "@/lib/services/pattern-analysis";

const solved = (...patterns: string[]) =>
  patterns.map((pattern) => ({ pattern }));

describe("countPatterns", () => {
  it("merges patterns that differ only by surrounding whitespace", () => {
    const counts = countPatterns(solved("DP", " DP", "DP ", "Graph"));
    expect([...counts.entries()]).toEqual([
      ["DP", 3],
      ["Graph", 1],
    ]);
  });
});

describe("buildPatternAnalysis", () => {
  it("returns an empty analysis with null extremes for no problems", () => {
    expect(buildPatternAnalysis([])).toEqual({
      patterns: [],
      summary: {
        totalProblems: 0,
        uniquePatterns: 0,
        mostPracticed: null,
        leastPracticed: null,
      },
    });
  });

  it("sorts by count, breaks ties alphabetically, and reports both extremes", () => {
    const analysis = buildPatternAnalysis(
      solved("Graph", "BFS", "DP", "DP", "DP", "Graph")
    );
    expect(analysis.patterns.map((stat) => stat.pattern)).toEqual([
      "DP",
      "Graph",
      "BFS",
    ]);
    expect(analysis.patterns[0].percentage).toBe(50);
    expect(analysis.summary.mostPracticed?.pattern).toBe("DP");
    expect(analysis.summary.leastPracticed?.pattern).toBe("BFS");
    expect(analysis.summary.uniquePatterns).toBe(3);
  });

  it("has no least-practiced pattern when every pattern ties", () => {
    const analysis = buildPatternAnalysis(solved("DP", "BFS"));
    expect(analysis.summary.mostPracticed?.pattern).toBe("BFS");
    expect(analysis.summary.leastPracticed).toBeNull();
  });
});

describe("calculatePatternStats", () => {
  it("sorts by count only, keeping first-seen order between ties", () => {
    const stats = calculatePatternStats(solved("Graph", "BFS", "DP", "DP"));
    expect(stats.map((stat) => stat.pattern)).toEqual(["DP", "Graph", "BFS"]);
    expect(stats.map((stat) => stat.percentage)).toEqual([50, 25, 25]);
  });
});
