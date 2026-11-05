import { RarityTier } from "../../types/game";

export interface ScoreCalculation {
  rarityTier: RarityTier;
  rarityScore: number;
  altitudeGain: number;
  estimatedShare: number;
}

/**
 * Calculates Bayesian rarity score and corresponding kite altitude.
 * The rarer the valid answer, the higher the score and altitude.
 */
export function calculateRarityScore(
  isValid: boolean,
  priorShare: number,
  observedCount: number = 0,
  totalObserved: number = 0,
  priorStrength: number = 1000
): ScoreCalculation {
  if (!isValid) {
    return {
      rarityTier: "invalid",
      rarityScore: 0,
      altitudeGain: 0,
      estimatedShare: 1.0,
    };
  }

  // Bayesian estimation: (prior_share * prior_strength + observed_count) / (prior_strength + total_observed)
  const estimatedShare =
    (priorShare * priorStrength + observedCount) /
    (priorStrength + totalObserved);

  // Score formula: logarithmic or inverted share curve to reward rare answers steeply
  let rarityTier: RarityTier = "common";
  let rarityScore = 150;

  if (estimatedShare <= 0.03) {
    // Ultra Rare (e.g. Naseeruddin Shah, Karun Nair, Chenna Poda, Mahanagar)
    rarityTier = "ultra_rare";
    rarityScore = Math.round(850 + (1 - estimatedShare / 0.03) * 150);
  } else if (estimatedShare <= 0.08) {
    // Rare (e.g. Manoj Bajpayee, Gundappa Viswanath, Hampi, Byomkesh Bakshi)
    rarityTier = "rare";
    rarityScore = Math.round(600 + (1 - (estimatedShare - 0.03) / 0.05) * 240);
  } else if (estimatedShare <= 0.20) {
    // Uncommon (e.g. Mithun Chakraborty, Rahul Dravid, Sarabhai vs Sarabhai)
    rarityTier = "uncommon";
    rarityScore = Math.round(350 + (1 - (estimatedShare - 0.08) / 0.12) * 240);
  } else {
    // Common (e.g. Amitabh Bachchan, Sachin Tendulkar, Virat Kohli, 3 Idiots)
    rarityTier = "common";
    rarityScore = Math.round(150 + Math.max(0, 1 - estimatedShare) * 180);
  }

  // Altitude mapping: 1 point ~ 1.5 meters lift
  const altitudeGain = Math.round(rarityScore * 1.55);

  return {
    rarityTier,
    rarityScore,
    altitudeGain,
    estimatedShare,
  };
}
