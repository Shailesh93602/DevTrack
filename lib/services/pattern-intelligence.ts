import { prisma } from "@/lib/db/prisma";

export interface PatternStats {
  pattern: string;
  count: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  lastSolvedAt: Date | null;
}

export interface PatternAnalysis {
  mostPracticed: PatternStats[];
  weakPatterns: PatternStats[];
  recommendedPattern: string | null;
  totalPatterns: number;
  masteryProgress: Record<string, number>;
}

// Common interview patterns with frequency weights
const INTERVIEW_PATTERNS = [
  { pattern: "Two Pointers", weight: 10 },
  { pattern: "Sliding Window", weight: 9 },
  { pattern: "Binary Search", weight: 9 },
  { pattern: "BFS", weight: 10 },
  { pattern: "DFS", weight: 10 },
  { pattern: "Dynamic Programming", weight: 10 },
  { pattern: "Graph", weight: 8 },
  { pattern: "Heap/Priority Queue", weight: 7 },
  { pattern: "Trie", weight: 6 },
  { pattern: "Union Find", weight: 6 },
  { pattern: "Topological Sort", weight: 6 },
  { pattern: "Greedy", weight: 7 },
  { pattern: "Backtracking", weight: 7 },
  { pattern: "Bit Manipulation", weight: 5 },
];

export async function analyzePatterns(userId: string): Promise<PatternAnalysis> {
  const problems = await prisma.dSAProblem.findMany({
    where: { userId },
    select: {
      pattern: true,
      difficulty: true,
      solvedAt: true,
    },
    orderBy: { solvedAt: "desc" },
  });

  const patternMap = new Map<string, PatternStats>();

  for (const problem of problems) {
    const existing = patternMap.get(problem.pattern);
    if (existing) {
      existing.count++;
      if (problem.difficulty === "EASY") existing.easyCount++;
      else if (problem.difficulty === "MEDIUM") existing.mediumCount++;
      else if (problem.difficulty === "HARD") existing.hardCount++;
      if (!existing.lastSolvedAt || problem.solvedAt > existing.lastSolvedAt) {
        existing.lastSolvedAt = problem.solvedAt;
      }
    } else {
      patternMap.set(problem.pattern, {
        pattern: problem.pattern,
        count: 1,
        easyCount: problem.difficulty === "EASY" ? 1 : 0,
        mediumCount: problem.difficulty === "MEDIUM" ? 1 : 0,
        hardCount: problem.difficulty === "HARD" ? 1 : 0,
        lastSolvedAt: problem.solvedAt,
      });
    }
  }

  const allPatterns = Array.from(patternMap.values());
  
  // Sort by count descending for most practiced
  const mostPracticed = [...allPatterns]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Weak patterns: low count or high easy ratio (not challenging enough)
  const weakPatterns = [...allPatterns]
    .filter((p) => {
      const hasStruggled = p.mediumCount + p.hardCount < 2;
      const lowExposure = p.count < 3;
      return hasStruggled || lowExposure;
    })
    .sort((a, b) => a.count - b.count)
    .slice(0, 5);

  // Calculate mastery progress (0-100%)
  const masteryProgress: Record<string, number> = {};
  for (const p of allPatterns) {
    const difficultyScore = p.easyCount * 1 + p.mediumCount * 2 + p.hardCount * 3;
    const maxScore = p.count * 3;
    masteryProgress[p.pattern] = Math.min(100, Math.round((difficultyScore / maxScore) * 100));
  }

  // Recommend next pattern to learn
  const practicedPatternNames = new Set(allPatterns.map((p) => p.pattern.toLowerCase()));
  const unpracticedInterviewPatterns = INTERVIEW_PATTERNS.filter(
    (p) => !practicedPatternNames.has(p.pattern.toLowerCase())
  );

  let recommendedPattern: string | null = null;
  if (unpracticedInterviewPatterns.length > 0) {
    // Recommend highest-weight unpracticed pattern
    recommendedPattern = unpracticedInterviewPatterns.sort((a, b) => b.weight - a.weight)[0].pattern;
  } else if (weakPatterns.length > 0) {
    // Recommend weakest practiced pattern
    recommendedPattern = weakPatterns[0].pattern;
  }

  return {
    mostPracticed,
    weakPatterns,
    recommendedPattern,
    totalPatterns: allPatterns.length,
    masteryProgress,
  };
}
