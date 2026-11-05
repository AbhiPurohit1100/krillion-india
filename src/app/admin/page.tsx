"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowLeft,
  CheckCircle,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  XCircle,
} from "lucide-react";

interface QuestionCandidate {
  id: string;
  question_text: string;
  category: string;
  subcategory?: string;
  difficulty: string;
  status: string;
  explanation?: string;
  valid_entities?: {
    entity: {
      canonical_name: string;
      aliases?: { alias: string }[];
    };
  }[];
}

export default function AdminDashboardPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING_APPROVAL");
  const [questions, setQuestions] = useState<QuestionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async (qId: string) => {
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: qId,
          editedQuestionText: editingId === qId ? editText : undefined,
        }),
      });

      if (res.ok) {
        showToast("Question successfully approved!");
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        setEditingId(null);
      }
    } catch (err) {
      showToast("Approval failed.");
    }
  };

  const handleReject = async (qId: string) => {
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId }),
      });

      if (res.ok) {
        showToast("Question marked as rejected.");
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
      }
    } catch (err) {
      showToast("Rejection failed.");
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    showToast("Triggering Groq AI to generate 3 candidate questions...");
    try {
      const res = await fetch("/api/admin/generate", { method: "POST" });
      if (res.ok) {
        showToast("3 new candidate questions generated!");
        setStatusFilter("PENDING_APPROVAL");
        fetchQuestions();
      }
    } catch (err) {
      showToast("Candidate generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto pt-24 px-4 sm:px-8 pb-16 space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ocean-950 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-sunset-gold/50 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sunset-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ocean-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sunset-gold/15 text-sunset-gold border border-sunset-gold/30">
              <Shield className="w-6 h-6" />
            </span>
            <span>Quizmaster Admin Panel</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review AI-generated trivia candidates, edit accepted answers, and publish to the daily game.
          </p>
        </div>

        {/* Generate Candidates Action */}
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sunset-gold to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-black text-sm shadow-lg shadow-sunset-gold/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? "Generating..." : "Generate 3 Candidates (Groq AI)"}</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["PENDING_APPROVAL", "APPROVED", "PUBLISHED", "REJECTED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              statusFilter === st
                ? "bg-white text-slate-950 shadow-md scale-105"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-sm font-bold text-slate-400 rounded-3xl">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <p className="text-base font-bold text-white">No questions found in &quot;{statusFilter}&quot;</p>
          <p className="text-xs text-slate-400">
            Click &quot;Generate 3 Candidates&quot; above to create fresh questions with Groq AI!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4 transition-all"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold">
                    <span className="px-2.5 py-0.5 rounded-full bg-sunset-gold/15 text-sunset-gold border border-sunset-gold/30">
                      {q.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-ocean-500/15 text-ocean-300 border border-ocean-500/30 capitalize">
                      {q.difficulty}
                    </span>
                    <span className="text-slate-500">· ID: {q.id}</span>
                  </div>

                  {editingId === q.id ? (
                    <div className="pt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/5 border border-sunset-gold font-bold text-white text-base focus:ring-2 focus:ring-sunset-gold"
                        rows={2}
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-400 font-bold mt-1 underline hover:text-white"
                      >
                        Cancel Editing
                      </button>
                    </div>
                  ) : (
                    <h2
                      onClick={() => {
                        setEditingId(q.id);
                        setEditText(q.question_text);
                      }}
                      className="text-lg font-black text-white leading-snug cursor-pointer hover:text-sunset-gold transition-colors"
                      title="Click to edit wording"
                    >
                      {q.question_text}
                    </h2>
                  )}
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    q.status === "APPROVED" || q.status === "PUBLISHED"
                      ? "bg-emerald-600 text-white"
                      : q.status === "REJECTED"
                      ? "bg-rose-600 text-white"
                      : "bg-sunset-gold text-slate-950 font-black"
                  }`}
                >
                  {q.status}
                </span>
              </div>

              {/* Explanation */}
              {q.explanation && (
                <p className="text-xs text-slate-300 italic bg-white/5 p-3 rounded-xl border border-white/10">
                  💡 {q.explanation}
                </p>
              )}

              {/* Accepted Canonical Answers & Aliases */}
              {q.valid_entities && q.valid_entities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Accepted Canonical Entities ({q.valid_entities.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {q.valid_entities.map((ve, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-200 shadow-sm"
                      >
                        <span>{ve.entity.canonical_name}</span>
                        {ve.entity.aliases && ve.entity.aliases.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({ve.entity.aliases.map((a) => a.alias).join(", ")})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {q.status === "PENDING_APPROVAL" && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleReject(q.id)}
                    className="px-4 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Candidate</span>
                  </button>

                  <button
                    onClick={() => handleApprove(q.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Question</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
