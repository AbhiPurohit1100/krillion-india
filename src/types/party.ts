export type PufferRoomStatus =
  | "WAITING"
  | "COUNTDOWN"
  | "ROUND_START"
  | "PLAYER_TURN"
  | "TURN_RESULT"
  | "IN_PROGRESS"
  | "ROUND_RESULTS"
  | "FINAL_RESULTS"
  | "CANCELLED";


export type PufferRoundStatus = "ACTIVE" | "SCORING" | "REVEALED";

export interface PartyPlayer {
  id: string;
  anonId: string;
  nickname: string;
  isHost: boolean;
  totalScore: number;
  isActive: boolean;
  joinedAt: string;
}

export interface PartySubmission {
  id: string;
  playerId: string;
  playerNickname: string;
  rawAnswer: string;
  canonicalName?: string | null;
  isValid: boolean;
  roundPoints: number;
  duplicateCount?: number;
}

export interface PartyQuestionInfo {
  id: string;
  questionText: string;
  category: string;
  subcategory?: string;
  difficulty: string;
  explanation?: string;
}

export interface PartyRound {
  id: string;
  roundNumber: number;
  question: PartyQuestionInfo;
  status: PufferRoundStatus;
  startedAt: string;
  deadline: string;
  submissionsCount: number;
  submissions?: PartySubmission[]; // Live broadcasted answers for current round
}

export interface PartyRoomState {
  id: string;
  code: string;
  hostId: string;
  status: PufferRoomStatus;
  maxPlayers: number;
  totalRounds: number;
  currentRoundNumber: number;
  roundDeadline: string | null;
  turnOrder: string[]; // List of player IDs in playing order
  activeTurnIndex: number; // Current index in turnOrder
  activePlayerId: string | null; // ID of player whose turn it is
  players: PartyPlayer[];
  currentRound: PartyRound | null;
  previousRound?: PartyRound | null;
}
