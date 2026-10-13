import type { PatternAnalysis, PatternStat } from "@/types/dsa-problem";

/** Solve counts keyed by pattern name, trimmed, in first-seen order. */
export function countPatterns(
  problems: readonly { pattern: string }[]
): Map<string, number> {
  const patternCounts = new Map<string, number>();
  for (const problem of problems) {
    const normalizedPattern = problem.pattern.trim();
    patternCounts.set(
      normalizedPattern,
      (patternCounts.get(normalizedPattern) ?? 0) + 1
    );
  }
  return patternCounts;
}

function toPatternStats(
  patternCounts: Map<string, number>,
  totalProblems: number
): PatternStat[] {
  return Array.from(patternCounts.entries()).map(([pattern, count]) => ({
    pattern,
    count,
    percentage:
      totalProblems > 0 ? Math.round((count / totalProblems) * 100) : 0,
  }));
}

/** Patterns by count (desc, then name); leastPracticed is null when all tie. */
export function buildPatternAnalysis(
  problems: readonly { pattern: string }[]
): PatternAnalysis {
  const totalProblems = problems.length;
  if (totalProblems === 0) {
    return {
      patterns: [],
      summary: {
        totalProblems: 0,
        uniquePatterns: 0,
        mostPracticed: null,
        leastPracticed: null,
      },
    };
  }

  const patterns = toPatternStats(countPatterns(problems), totalProblems).sort(
    (a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern)
  );
  const mostPracticed = patterns[0] ?? null;
  const leastPracticed = patterns.at(-1) ?? null;

  return {
    patterns,
    summary: {
      totalProblems,
      uniquePatterns: patterns.length,
      mostPracticed,
      leastPracticed:
        leastPracticed?.count === mostPracticed?.count ? null : leastPracticed,
    },
  };
}

/** Per-pattern counts sorted by count only (desc); ties keep first-seen order. */
export function calculatePatternStats(
  problems: readonly { pattern: string }[]
): PatternStat[] {
  return toPatternStats(countPatterns(problems), problems.length).sort(
    (a, b) => b.count - a.count
  );
}
