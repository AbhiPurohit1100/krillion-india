import { normalizeAnswer } from "./normalization";
import { levenshteinDistance, similarityRatio, findBestFuzzyMatch } from "./fuzzy";
import { resolveAnswer } from "./services/resolutionService";
import { calculateRarityScore } from "./services/scoringService";

async function runTests() {
  console.log("=== Running Core Backend Logic Tests ===");

  // 1. Text Normalization
  console.log("\n1. Testing Text Normalization:");
  const sample1 = "  Dr. Shah Rukh Khan!  ";
  const norm1 = normalizeAnswer(sample1);
  console.log(`Input: "${sample1}" -> Output: "${norm1}"`);
  console.assert(norm1 === "shah rukh khan", "Failed normalization test 1");

  const sample2 = "Rasgulla... (Mithai)";
  const norm2 = normalizeAnswer(sample2);
  console.log(`Input: "${sample2}" -> Output: "${norm2}"`);
  console.assert(norm2 === "rasgulla mithai", "Failed normalization test 2");

  // 2. Fuzzy Matching
  console.log("\n2. Testing Fuzzy Matching:");
  const targets = ["sachin tendulkar", "virat kohli", "rohit sharma", "rahul dravid"];
  const fuzzy1 = findBestFuzzyMatch("sachin tendulkar", targets);
  console.log("Exact match query:", fuzzy1);
  console.assert(fuzzy1?.matchedTarget === "sachin tendulkar", "Fuzzy test 1 failed");

  const fuzzy2 = findBestFuzzyMatch("sachin tendulker", targets, 0.85); // typo: 'e' instead of 'a'
  console.log("Typo query 'sachin tendulker':", fuzzy2);
  console.assert(fuzzy2?.matchedTarget === "sachin tendulkar", "Fuzzy test 2 failed");

  // 3. Answer Resolution against Q-1 (National Film Award Best Actor)
  console.log("\n3. Testing Answer Resolution Pipeline (Q-1: National Award Actors):");

  // Exact Canonical
  const res1 = await resolveAnswer("q-1", "Amitabh Bachchan");
  console.log("Q-1 'Amitabh Bachchan':", res1.isValid, res1.canonicalName, res1.matchType, `Prior: ${res1.priorFrequency}`);
  console.assert(res1.isValid && res1.matchType === "canonical", "Resolution canonical failed");

  // Alias
  const res2 = await resolveAnswer("q-1", "Big B");
  console.log("Q-1 'Big B' (alias):", res2.isValid, res2.canonicalName, res2.matchType);
  console.assert(res2.isValid && res2.matchType === "alias", "Resolution alias failed");

  // Rare Answer
  const res3 = await resolveAnswer("q-1", "Naseeruddin Shah");
  console.log("Q-1 'Naseeruddin Shah' (rare):", res3.isValid, res3.canonicalName, `Prior: ${res3.priorFrequency}`);
  console.assert(res3.isValid && res3.priorFrequency <= 0.05, "Resolution rare failed");

  // Typo Fuzzy Match
  const res4 = await resolveAnswer("q-1", "Mithun Chakrobarty");
  console.log("Q-1 'Mithun Chakrobarty' (fuzzy/alias):", res4.isValid, res4.canonicalName, res4.matchType);
  console.assert(res4.isValid, "Resolution fuzzy failed");

  // Invalid / Irrelevant
  const res5 = await resolveAnswer("q-1", "Tom Cruise");
  console.log("Q-1 'Tom Cruise' (invalid):", res5.isValid, res5.matchType);
  console.assert(!res5.isValid, "Resolution invalid test failed");

  // 4. Bayesian Scoring Comparison
  console.log("\n4. Testing Bayesian Scoring:");
  // Common answer (prior 0.40)
  const scoreCommon = calculateRarityScore(true, 0.40);
  // Rare answer (prior 0.02)
  const scoreRare = calculateRarityScore(true, 0.02);

  console.log(`Common (0.40 prior) -> Score: ${scoreCommon.rarityScore} pts, Altitude: ${scoreCommon.altitudeGain}m, Tier: ${scoreCommon.rarityTier}`);
  console.log(`Rare   (0.02 prior) -> Score: ${scoreRare.rarityScore} pts, Altitude: ${scoreRare.altitudeGain}m, Tier: ${scoreRare.rarityTier}`);

  console.assert(scoreRare.rarityScore > scoreCommon.rarityScore, "Rare answer must score higher than common answer!");
  console.assert(scoreRare.altitudeGain > scoreCommon.altitudeGain, "Rare answer must lift kite higher!");

  console.log("\n ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(console.error);

