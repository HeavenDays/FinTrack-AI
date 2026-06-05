"use client";

import { useState } from "react";
import { useLearningNotes, useLearningSuggestions } from "@/hooks/useExpenses";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { formatTanggal } from "@/lib/utils";
import { LEARNING_TOPICS } from "@/types";
import type { LearningNote } from "@/types";
import {
  BookOpen, Plus, Trash2, CheckCircle2, Clock, RefreshCw,
  Sparkles, Target, Trophy, Lightbulb, Search, Filter,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  "in-progress": { label: "Sedang Dipelajari", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: Clock },
  completed: { label: "Selesai", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", icon: CheckCircle2 },
  review: { label: "Perlu Review", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)", icon: RefreshCw },
};

export default function CatatanPage() {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useLearningNotes();
  const { suggestions, isLoading: aiLoading, refresh: refreshAI } = useLearningSuggestions();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredNotes = notes.filter((n: LearningNote) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchTopic = !filterTopic || n.topic === filterTopic;
    const matchStatus = !filterStatus || n.status === filterStatus;
    return matchSearch && matchTopic && matchStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !topic) return;
    setIsSubmitting(true);
    try {
      await addNote({ title, content, topic });
      setTitle("");
      setContent("");
      setTopic("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateNote(id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await deleteNote(id); } finally { setDeletingId(null); }
  };

  const completedCount = notes.filter((n: LearningNote) => n.status === "completed").length;
  const inProgressCount = notes.filter((n: LearningNote) => n.status === "in-progress").length;
  const topicsCount = new Set(notes.map((n: LearningNote) => n.topic)).size;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Catatan Belajar</h1>
        <p className="page-subtitle">Catat perjalanan belajar Anda dan dapatkan saran AI untuk berkembang</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid mb-5 stagger-children">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
              <BookOpen size={18} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total Catatan</p>
              <p className="text-xl font-bold">{notes.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
              <CheckCircle2 size={18} style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Selesai</p>
              <p className="text-xl font-bold" style={{ color: "#10b981" }}>{completedCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
              <Clock size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>In Progress</p>
              <p className="text-xl font-bold" style={{ color: "#f59e0b" }}>{inProgressCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
              <Target size={18} style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Topik</p>
              <p className="text-xl font-bold" style={{ color: "#8b5cf6" }}>{topicsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-two-col">
        {/* Left: Notes List */}
        <div>
          {/* Search & Filter */}
          <Card className="mb-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type="text" placeholder="Cari catatan..." className="input-field pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <select className="input-field pl-9" style={{ minWidth: "140px" }} value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
                  <option value="">Semua Topik</option>
                  {LEARNING_TOPICS.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <select className="input-field" style={{ minWidth: "140px" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="in-progress">Sedang Dipelajari</option>
                <option value="completed">Selesai</option>
                <option value="review">Perlu Review</option>
              </select>
            </div>
          </Card>

          {/* Notes List */}
          {isLoading ? (
            <Card>
              <div className="empty-state">
                <div className="btn-spinner mx-auto mb-3" style={{ width: 24, height: 24, borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Memuat catatan...</p>
              </div>
            </Card>
          ) : filteredNotes.length === 0 ? (
            <Card>
              <div className="empty-state">
                <BookOpen size={32} className="mb-3" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {search || filterTopic || filterStatus ? "Tidak ada catatan yang sesuai filter" : "Belum ada catatan. Mulai catat pembelajaran Anda!"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note: LearningNote) => {
                const cfg = statusConfig[note.status] || statusConfig["in-progress"];
                const StatusIcon = cfg.icon;
                return (
                  <Card key={note.id}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                            {note.topic}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                            <StatusIcon size={10} /> {cfg.label}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {note.title}
                        </h4>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)} isLoading={deletingId === note.id}>
                        <Trash2 size={14} style={{ color: "var(--danger)" }} />
                      </Button>
                    </div>
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {formatTanggal(note.createdAt)}
                      </span>
                      <div className="flex gap-1.5">
                        {["in-progress", "completed", "review"].map((s) => {
                          const c = statusConfig[s];
                          const isActive = note.status === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleStatusChange(note.id, s)}
                              className="px-2 py-1 rounded-md text-[10px] font-medium transition-all"
                              style={{
                                background: isActive ? c.bg : "transparent",
                                color: isActive ? c.color : "var(--text-muted)",
                                border: `1px solid ${isActive ? c.color + "40" : "transparent"}`,
                              }}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Form + AI Suggestions */}
        <div className="right-panel">
          {/* Add Note Form */}
          <Card>
            <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Tambah Catatan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Judul" type="text" placeholder="React Server Components" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Select label="Topik" options={LEARNING_TOPICS.map((t) => ({ value: t, label: t }))} value={topic} onChange={(e) => setTopic(e.target.value)} />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Apa yang Anda pelajari?
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Hari ini saya belajar tentang..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ resize: "vertical", minHeight: "100px" }}
                />
              </div>
              <Button type="submit" isLoading={isSubmitting} className="w-full flex items-center justify-center gap-2">
                <Plus size={16} /> Simpan Catatan
              </Button>
            </form>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: "#8b5cf6" }} />
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Saran AI Mentor</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refreshAI()} isLoading={aiLoading}>
                <RefreshCw size={14} />
              </Button>
            </div>

            {aiLoading ? (
              <div className="py-6 text-center">
                <div className="btn-spinner mx-auto mb-2" style={{ width: 20, height: 20, borderColor: "var(--border)", borderTopColor: "#8b5cf6" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Menganalisis pembelajaran Anda...</p>
              </div>
            ) : suggestions ? (
              <div className="space-y-4">
                {/* Summary */}
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {suggestions.ringkasan}
                </p>

                {/* Achievements */}
                {suggestions.pencapaian.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Trophy size={13} style={{ color: "#f59e0b" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>Pencapaian</span>
                    </div>
                    <div className="space-y-1.5">
                      {suggestions.pencapaian.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <span style={{ color: "#f59e0b" }}>✦</span> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb size={13} style={{ color: "#10b981" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#10b981" }}>Saran Belajar</span>
                  </div>
                  <div className="space-y-1.5">
                    {suggestions.saranBelajar.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "#10b981" }}>→</span> {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Target */}
                <div className="p-3 rounded-xl" style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target size={12} style={{ color: "#6366f1" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>Target Minggu Ini</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>{suggestions.targetMingguIni}</p>
                </div>

                {/* Motivation */}
                <div className="pt-3 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                    &ldquo;{suggestions.motivasi}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                Tambah catatan belajar untuk mendapatkan saran AI
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
