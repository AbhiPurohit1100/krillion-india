"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PartyRoomState, PartyPlayer } from "@/types/party";
import PartyLobby from "@/components/party/PartyLobby";
import PartyGame from "@/components/party/PartyGame";
import PartyRoundResults from "@/components/party/PartyRoundResults";
import PartyFinalResults from "@/components/party/PartyFinalResults";
import { Anchor } from "lucide-react";

export default function PartyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = ((params.code as string) || "").toUpperCase();

  const [anonId, setAnonId] = useState("");
  const [roomState, setRoomState] = useState<PartyRoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 1. Fetch current room state
  const fetchRoomState = useCallback(async () => {
    if (!roomCode) return;
    try {
      const res = await fetch(`/api/party/rooms/${roomCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Room not found or expired.");
        }
        return;
      }
      const data = await res.json();
      if (data.room) {
        setRoomState(data.room);
      }
    } catch (err: any) {
      console.error("Fetch room state failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [roomCode]);

  // 2. Initialize anon player ID & first fetch
  useEffect(() => {
    let savedAnon = localStorage.getItem("krillion_anonymous_id") || "";
    if (!savedAnon) {
      savedAnon = "anon_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("krillion_anonymous_id", savedAnon);
    }
    setAnonId(savedAnon);
    fetchRoomState();
  }, [fetchRoomState]);

  // 3. Supabase Realtime Subscription
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`party-room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "puffer_rooms",
          filter: `code=eq.${roomCode}`,
        },
        () => {
          fetchRoomState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "puffer_players",
        },
        () => {
          fetchRoomState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "puffer_rounds",
        },
        () => {
          fetchRoomState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "puffer_submissions",
        },
        () => {
          fetchRoomState();
        }
      )
      .subscribe();

    // Fallback polling every 2s for rock-solid sync
    const fallbackPoll = setInterval(fetchRoomState, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackPoll);
    };
  }, [roomCode, fetchRoomState]);

  // 4. Server-Authoritative Turn Timer Monitor: Advance if current turn deadline passed
  useEffect(() => {
    if (
      !roomState ||
      (roomState.status !== "PLAYER_TURN" && (roomState.status as string) !== "IN_PROGRESS") ||
      !roomState.roundDeadline
    ) {
      return;
    }

    const deadlineTime = new Date(roomState.roundDeadline).getTime();
    const checkTimer = setInterval(async () => {
      const now = Date.now();
      // Only call advance if current time has genuinely passed the deadline by at least 1.5s
      if (now > deadlineTime + 1500) {
        try {
          await fetch(`/api/party/rooms/${roomCode}/advance`, { method: "POST" });
          fetchRoomState();
        } catch {}
      }
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [roomState?.status, roomState?.roundDeadline, roomState?.activeTurnIndex, roomCode, fetchRoomState]);


  // ── Actions ────────────────────────────────────────────────
  const handleStartGame = async () => {
    setIsStartingGame(true);
    setError(null);
    try {
      const res = await fetch(`/api/party/rooms/${roomCode}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostAnonId: anonId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start game.");
      if (data.room) setRoomState(data.room);
    } catch (err: any) {
      setError(err?.message || "Failed to start game.");
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await fetch(`/api/party/rooms/${roomCode}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId }),
      });
    } catch {}
    router.push("/party");
  };

  const handleSubmitAnswer = async (rawAnswer: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/party/rooms/${roomCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAnonId: anonId,
          rawAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer.");

      if (data.room) setRoomState(data.room);

      // Return result to PartyGame to handle invalid answer retry feedback
      return {
        isValid: data.isValid,
        message: data.message,
      };
    } catch (err: any) {
      setError(err?.message || "Failed to submit answer.");
      return { isValid: false, message: err?.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceRound = async () => {
    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/party/rooms/${roomCode}/advance`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.room) setRoomState(data.room);
    } catch (err: any) {
      console.error("Advance failed:", err);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handlePlayAgain = async () => {
    setIsResetting(true);
    try {
      await handleStartGame();
    } finally {
      setIsResetting(false);
    }
  };

  // ── Render Loading / Error ─────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative min-h-screen sky-bg flex flex-col items-center justify-center p-6 text-white font-pixel">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 animate-spin flex items-center justify-center text-cyan-300 mb-3">
          <Anchor className="w-6 h-6" />
        </div>
        <p className="text-sm">Connecting to Puffer Party room...</p>
      </div>
    );
  }

  if (error && !roomState) {
    return (
      <div className="relative min-h-screen sky-bg flex flex-col items-center justify-center p-6 text-white font-pixel text-center">
        <div className="krillion-border rounded-2xl bg-slate-950/90 p-8 max-w-md space-y-4">
          <h2 className="text-xl font-bold text-rose-400">ROOM ERROR</h2>
          <p className="text-xs text-slate-300">{error}</p>
          <button
            onClick={() => router.push("/party")}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
          >
            RETURN TO PARTY LOBBY
          </button>
        </div>
      </div>
    );
  }

  if (!roomState) return null;

  const currentPlayer = roomState.players.find((p) => p.anonId === anonId);
  const isHost = Boolean(currentPlayer?.isHost);

  return (
    <div className="relative min-h-screen sky-bg flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto select-none pt-12 sm:pt-16">
      {/* ── PHASE 1: WAITING IN LOBBY ────────────────────────── */}
      {roomState.status === "WAITING" && (
        <PartyLobby
          roomCode={roomCode}
          players={roomState.players}
          currentPlayerAnonId={anonId}
          isHost={isHost}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          isStarting={isStartingGame}
          error={error}
        />
      )}

      {/* ── PHASE 2: TURN-BASED GAMEPLAY (PLAYER_TURN / IN_PROGRESS) ── */}
      {(roomState.status === "PLAYER_TURN" || (roomState.status as string) === "IN_PROGRESS") &&
        roomState.currentRound && (
          <PartyGame
            round={roomState.currentRound}
            players={roomState.players}
            currentPlayerAnonId={anonId}
            activePlayerId={roomState.activePlayerId}
            turnOrder={roomState.turnOrder}
            activeTurnIndex={roomState.activeTurnIndex}
            onSubmitAnswer={handleSubmitAnswer}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}

      {/* ── PHASE 3: ROUND RESULTS ───────────────────────────── */}
      {roomState.status === "ROUND_RESULTS" && roomState.currentRound && (
        <PartyRoundResults
          round={roomState.currentRound}
          players={roomState.players}
          currentPlayerAnonId={anonId}
          isHost={isHost}
          onAdvance={handleAdvanceRound}
          isAdvancing={isAdvancing}
        />
      )}

      {/* ── PHASE 4: FINAL RESULTS ───────────────────────────── */}
      {roomState.status === "FINAL_RESULTS" && (
        <PartyFinalResults
          players={roomState.players}
          currentPlayerAnonId={anonId}
          isHost={isHost}
          onPlayAgain={handlePlayAgain}
          isResetting={isResetting}
        />
      )}
    </div>
  );
}
