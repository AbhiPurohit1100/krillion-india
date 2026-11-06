/**
 * Puffer Party Turn-Based Scoring System
 *
 * Revised Rules:
 * - Scoring is based on answer uniqueness within the current round.
 * - The first player to submit a particular normalized answer gets 10 points.
 * - Any subsequent player submitting the same answer (duplicate) gets 0 points.
 * - Different valid answers get 10 points.
 * - Invalid answers get 0 points.
 * - Timed-out turns get 0 points.
 */

export interface TurnScoringResult {
  isValid: boolean;
  isDuplicate: boolean;
  points: number;
}

export function evaluateTurnScore(
  isValid: boolean,
  currentNormalizedOrCanonical: string,
  existingUsedAnswerKeys: string[]
): TurnScoringResult {
  if (!isValid) {
    return {
      isValid: false,
      isDuplicate: false,
      points: 0,
    };
  }

  const cleanKey = currentNormalizedOrCanonical.toLowerCase().trim();
  const isDuplicate = existingUsedAnswerKeys.some(
    (key) => key.toLowerCase().trim() === cleanKey
  );

  return {
    isValid: true,
    isDuplicate,
    points: isDuplicate ? 0 : 10,
  };
}
