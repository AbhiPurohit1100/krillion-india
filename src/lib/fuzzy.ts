/**
 * Fuzzy Matching Engine
 * Uses Levenshtein distance and Trigram similarity to match player input against
 * canonical names and aliases while protecting against false positives.
 */

export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

export function similarityRatio(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return 1.0 - distance / maxLen;
}

export function trigramSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length < 3 || s2.length < 3) {
    return similarityRatio(s1, s2);
  }

  const getTrigrams = (str: string): Set<string> => {
    const padded = `  ${str} `;
    const set = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) {
      set.add(padded.substring(i, i + 3));
    }
    return set;
  };

  const t1 = getTrigrams(s1);
  const t2 = getTrigrams(s2);

  let matches = 0;
  t1.forEach((tri) => {
    if (t2.has(tri)) matches++;
  });

  const total = t1.size + t2.size;
  return total === 0 ? 0 : (2.0 * matches) / total;
}

export interface FuzzyMatchResult {
  matchedTarget: string;
  score: number;
}

export function findBestFuzzyMatch(
  query: string,
  targets: string[],
  minThreshold: number = 0.82
): FuzzyMatchResult | null {
  if (!query || targets.length === 0) return null;

  let bestScore = 0;
  let bestTarget = "";

  for (const target of targets) {
    // Exact or contained word matching
    if (query === target) {
      return { matchedTarget: target, score: 1.0 };
    }

    // Only do fuzzy matching if length difference is reasonably small
    if (Math.abs(query.length - target.length) > 5) continue;

    const levScore = similarityRatio(query, target);
    const triScore = trigramSimilarity(query, target);
    const score = Math.max(levScore, triScore);

    if (score > bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  }

  if (bestScore >= minThreshold) {
    return { matchedTarget: bestTarget, score: bestScore };
  }

  return null;
}
