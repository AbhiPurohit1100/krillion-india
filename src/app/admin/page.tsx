"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  ExternalLink,
  Flame,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
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
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-sky-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/60 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Game</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500 text-white text-lg">🛡️</span>
            <span>Quizmaster Admin Panel</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review AI-generated trivia candidates, edit accepted answers, and publish to the daily game.
          </p>
        </div>

        {/* Generate Candidates Action */}
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-patang-saffron to-amber-500 hover:from-amber-600 hover:to-patang-saffron text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
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
                ? "bg-slate-900 text-white shadow-md scale-105"
                : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-sm font-bold text-slate-600 rounded-3xl">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <p className="text-base font-bold text-slate-800">No questions found in &quot;{statusFilter}&quot;</p>
          <p className="text-xs text-slate-500">
            Click &quot;Generate 3 Candidates&quot; above to create fresh questions with Groq AI!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg space-y-4 hover:shadow-xl transition-all"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      {q.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 capitalize">
                      {q.difficulty}
                    </span>
                    <span className="text-slate-400">· ID: {q.id}</span>
                  </div>

                  {editingId === q.id ? (
                    <div className="pt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 rounded-xl border border-amber-400 font-bold text-slate-900 text-base focus:ring-2 focus:ring-amber-500"
                        rows={2}
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-500 font-bold mt-1 underline"
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
                      className="text-lg font-black text-slate-900 leading-snug cursor-pointer hover:text-amber-700 transition-colors title='Click to edit wording'"
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
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {q.status}
                </span>
              </div>

              {/* Explanation */}
              {q.explanation && (
                <p className="text-xs text-slate-600 italic bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                  💡 {q.explanation}
                </p>
              )}

              {/* Accepted Canonical Answers & Aliases */}
              {q.valid_entities && q.valid_entities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Accepted Canonical Entities ({q.valid_entities.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {q.valid_entities.map((ve, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm"
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
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleReject(q.id)}
                    className="px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Candidate</span>
                  </button>

                  <button
                    onClick={() => handleApprove(q.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
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

