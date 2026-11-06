import { prisma } from "../prisma";
import { SEED_QUESTIONS, SeedQuestion } from "../seed-data";
import { PartyRoomState, PartyPlayer, PartyRound, PartySubmission } from "@/types/party";
import { evaluateTurnScore } from "./partyScoring";
import { resolveAnswer } from "../services/resolutionService";
import { normalizeAnswer } from "../normalization";

/**
 * Generate a 6-character clean room code
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Pick 5 unique random questions from the available question pool
 */
export async function pickFiveQuestions(): Promise<SeedQuestion[]> {
  try {
    const dbQuestions = await prisma.question.findMany({
      where: { status: "PUBLISHED" },
      take: 57,
    });
    if (dbQuestions.length >= 5) {
      const shuffled = [...dbQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5).map((q, idx) => ({
        id: q.id,
        order: idx + 1,
        questionText: q.question_text,
        category: q.category,
        subcategory: q.subcategory || "",
        difficulty: (q.difficulty as any) || "medium",
        explanation: q.explanation || "",
        entities: [],
      }));
    }
  } catch {}

  const shuffled = [...SEED_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

/**
 * Get question info by ID
 */
export async function getQuestionInfo(questionId: string) {
  const seed = SEED_QUESTIONS.find((q) => q.id === questionId);
  if (seed) {
    return {
      id: seed.id,
      questionText: seed.questionText,
      category: seed.category,
      subcategory: seed.subcategory,
      difficulty: seed.difficulty,
      explanation: seed.explanation,
    };
  }

  try {
    const dbQ = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (dbQ) {
      return {
        id: dbQ.id,
        questionText: dbQ.question_text,
        category: dbQ.category,
        subcategory: dbQ.subcategory || undefined,
        difficulty: dbQ.difficulty,
        explanation: dbQ.explanation || undefined,
      };
    }
  } catch {}

  return {
    id: questionId,
    questionText: "Unknown Question",
    category: "General",
    difficulty: "medium",
  };
}

/**
 * Assembles full client-ready room state
 */
export async function getFullRoomState(roomCode: string): Promise<PartyRoomState | null> {
  const room = await prisma.pufferRoom.findUnique({
    where: { code: roomCode.toUpperCase() },
    include: {
      players: {
        orderBy: { joined_at: "asc" },
      },
      rounds: {
        orderBy: { round_number: "asc" },
        include: {
          submissions: {
            include: {
              player: true,
            },
            orderBy: { submitted_at: "asc" },
          },
        },
      },
    },
  });

  if (!room) return null;

  const players: PartyPlayer[] = room.players.map((p) => ({
    id: p.id,
    anonId: p.anon_id,
    nickname: p.nickname,
    isHost: p.is_host,
    totalScore: p.total_score,
    isActive: p.is_active,
    joinedAt: p.joined_at.toISOString(),
  }));

  const turnOrder = room.turn_order ? room.turn_order.split(",") : [];
  const activeTurnIndex = room.active_turn_index || 0;
  const activePlayerId = turnOrder[activeTurnIndex] || null;

  const currentRoundRecord = room.rounds.find((r) => r.round_number === room.current_round) || null;
  const previousRoundRecord =
    room.current_round > 1
      ? room.rounds.find((r) => r.round_number === room.current_round - 1) || null
      : null;

  let currentRound: PartyRound | null = null;
  if (currentRoundRecord) {
    const qInfo = await getQuestionInfo(currentRoundRecord.question_id);

    // IN TURN-BASED MODE: Submissions are revealed in real-time immediately after accepted!
    const submissions: PartySubmission[] = currentRoundRecord.submissions.map((s) => ({
      id: s.id,
      playerId: s.player_id,
      playerNickname: s.player.nickname,
      rawAnswer: s.raw_answer,
      canonicalName: s.canonical_name,
      isValid: s.is_valid,
      roundPoints: s.round_points,
    }));

    currentRound = {
      id: currentRoundRecord.id,
      roundNumber: currentRoundRecord.round_number,
      question: qInfo,
      status: currentRoundRecord.status,
      startedAt: currentRoundRecord.started_at.toISOString(),
      deadline: room.round_deadline ? room.round_deadline.toISOString() : currentRoundRecord.deadline.toISOString(),
      submissionsCount: currentRoundRecord.submissions.length,
      submissions,
    };
  }

  let previousRound: PartyRound | null = null;
  if (previousRoundRecord) {
    const prevQ = await getQuestionInfo(previousRoundRecord.question_id);
    previousRound = {
      id: previousRoundRecord.id,
      roundNumber: previousRoundRecord.round_number,
      question: prevQ,
      status: previousRoundRecord.status,
      startedAt: previousRoundRecord.started_at.toISOString(),
      deadline: previousRoundRecord.deadline.toISOString(),
      submissionsCount: previousRoundRecord.submissions.length,
      submissions: previousRoundRecord.submissions.map((s) => ({
        id: s.id,
        playerId: s.player_id,
        playerNickname: s.player.nickname,
        rawAnswer: s.raw_answer,
        canonicalName: s.canonical_name,
        isValid: s.is_valid,
        roundPoints: s.round_points,
      })),
    };
  }

  return {
    id: room.id,
    code: room.code,
    hostId: room.host_id,
    status: room.status,
    maxPlayers: room.max_players,
    totalRounds: room.total_rounds,
    currentRoundNumber: room.current_round,
    roundDeadline: room.round_deadline ? room.round_deadline.toISOString() : null,
    turnOrder,
    activeTurnIndex,
    activePlayerId,
    players,
    currentRound,
    previousRound,
  };
}

/**
 * Advances the turn to the next player, or advances the round if all players have completed their turn.
 */
export async function advanceTurnOrRound(roomCode: string): Promise<PartyRoomState | null> {
  const room = await prisma.pufferRoom.findUnique({
    where: { code: roomCode.toUpperCase() },
    include: {
      players: true,
      rounds: {
        include: { submissions: true },
      },
    },
  });

  if (!room) return null;

  const turnOrder = room.turn_order ? room.turn_order.split(",") : [];
  const nextTurnIndex = room.active_turn_index + 1;
  const now = new Date();

  // If there are more players whose turn it is this round
  if (nextTurnIndex < turnOrder.length) {
    const turnDeadline = new Date(now.getTime() + 30 * 1000); // 30s per player turn

    await prisma.pufferRoom.update({
      where: { id: room.id },
      data: {
        active_turn_index: nextTurnIndex,
        round_deadline: turnDeadline,
        status: "PLAYER_TURN",
      },
    });
  } else {
    // All players have taken their turn in this round!
    const isFinalRound = room.current_round >= room.total_rounds;

    // Mark current round revealed
    const currentRound = room.rounds.find((r) => r.round_number === room.current_round);
    if (currentRound) {
      await prisma.pufferRound.update({
        where: { id: currentRound.id },
        data: {
          status: "REVEALED",
          ended_at: now,
        },
      });
    }

    await prisma.pufferRoom.update({
      where: { id: room.id },
      data: {
        status: isFinalRound ? "FINAL_RESULTS" : "ROUND_RESULTS",
      },
    });
  }

  return getFullRoomState(roomCode);
}
