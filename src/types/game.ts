export type RarityTier = "common" | "uncommon" | "rare" | "ultra_rare" | "invalid";

export interface GameQuestion {
  id: string;
  order: number;
  questionText: string;
  category: string;
  subcategory?: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
}

export interface AnswerResult {
  questionId: string;
  questionText: string;
  category: string;
  rawAnswer: string;
  canonicalName?: string;
  isValid: boolean;
  rarityTier: RarityTier;
  rarityScore: number; // 0 to 1000
  altitudeGained: number; // in meters
  observedFrequency?: number;
  explanation?: string;
}

export interface GameState {
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: GameQuestion[];
  answers: AnswerResult[];
  totalScore: number;
  currentAltitude: number; // in meters (starts at e.g. 50m, max ~10,000m)
  isCompleted: boolean;
  timeRemaining: number;
  isPaused: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  totalScore: number;
  altitude: number;
  completedAt: string;
  isCurrentPlayer?: boolean;
}

