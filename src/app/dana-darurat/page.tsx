"use client";

import { useState } from "react";
import { useEmergencyFund } from "@/hooks/useExpenses";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Shield, TrendingUp, ArrowDownCircle, ArrowUpCircle, Trash2, Plus, Lock } from "lucide-react";
import type { EmergencyFund } from "@/types";

export default function DanaDaruratPage() {
  const { transactions, stats, isLoading, addTransaction, deleteTransaction } = useEmergencyFund();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    try {
      await addTransaction({ amount: Number(amount), type, description: description || undefined });
      setAmount("");
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await deleteTransaction(id); } finally { setDeletingId(null); }
  };

  const progressPercent = stats?.progressPercent ?? 0;
  const progressColor = progressPercent >= 100 ? "#10b981" : progressPercent >= 50 ? "#f59e0b" : "#6366f1";

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dana Darurat</h1>
        <p className="page-subtitle">Simpanan darurat yang aman dan tidak boleh dipakai sembarangan</p>
      </div>

      {/* Progress Card */}
      <Card className="mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
            <Shield size={28} style={{ color: "#6366f1" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Saldo Dana Darurat
            </p>
            <p className="text-2xl font-bold" style={{ color: progressColor }}>
              {formatRupiah(stats?.totalBalance ?? 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Target</p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatRupiah(stats?.targetAmount ?? 10000000)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${progressColor}, ${progressPercent >= 100 ? "#34d399" : "#818cf8"})`,
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total Setor</p>
            <p className="text-sm font-bold" style={{ color: "#10b981" }}>
              {formatRupiah(stats?.totalDeposits ?? 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total Tarik</p>
            <p className="text-sm font-bold" style={{ color: "#ef4444" }}>
              {formatRupiah(stats?.totalWithdrawals ?? 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Setor Bulan Ini</p>
            <p className="text-sm font-bold" style={{ color: "#6366f1" }}>
              {formatRupiah(stats?.monthlyDeposit ?? 0)}
            </p>
          </div>
        </div>
      </Card>

      <div className="dashboard-two-col">
        {/* Left: Transaction History */}
        <div>
          <Card>
            <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Riwayat Transaksi
            </h3>
            {isLoading ? (
              <div className="empty-state">
                <div className="btn-spinner mx-auto mb-3" style={{ width: 24, height: 24, borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Memuat data...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <Lock size={32} className="mb-3" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Belum ada transaksi. Mulai setor dana darurat pertama Anda!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((t: EmergencyFund) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:opacity-90"
                    style={{ background: "var(--surface)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: t.type === "deposit"
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        {t.type === "deposit" ? (
                          <ArrowDownCircle size={18} style={{ color: "#10b981" }} />
                        ) : (
                          <ArrowUpCircle size={18} style={{ color: "#ef4444" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {t.type === "deposit" ? "Setoran" : "Penarikan"}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {t.description || formatTanggal(t.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: t.type === "deposit" ? "#10b981" : "#ef4444" }}
                      >
                        {t.type === "deposit" ? "+" : "-"}{formatRupiah(t.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(t.id)}
                        isLoading={deletingId === t.id}
                      >
                        <Trash2 size={14} style={{ color: "var(--danger)" }} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Form */}
        <div className="right-panel">
          <Card>
            <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {type === "deposit" ? "Setor Dana" : "Tarik Dana"}
            </h3>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setType("deposit")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: type === "deposit" ? "rgba(16, 185, 129, 0.15)" : "var(--surface)",
                  color: type === "deposit" ? "#10b981" : "var(--text-muted)",
                  border: `1px solid ${type === "deposit" ? "rgba(16, 185, 129, 0.3)" : "var(--border)"}`,
                }}
              >
                <TrendingUp size={14} /> Setor
              </button>
              <button
                type="button"
                onClick={() => setType("withdrawal")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: type === "withdrawal" ? "rgba(239, 68, 68, 0.15)" : "var(--surface)",
                  color: type === "withdrawal" ? "#ef4444" : "var(--text-muted)",
                  border: `1px solid ${type === "withdrawal" ? "rgba(239, 68, 68, 0.3)" : "var(--border)"}`,
                }}
              >
                <ArrowUpCircle size={14} /> Tarik
              </button>
            </div>

            {type === "withdrawal" && (
              <div
                className="p-3 rounded-xl mb-4 text-xs"
                style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
              >
                ⚠️ Penarikan hanya untuk keadaan darurat. Pastikan Anda benar-benar membutuhkannya.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Jumlah (Rp)" type="number" placeholder="500000" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="10000" />
              <Input label="Deskripsi (opsional)" type="text" placeholder={type === "deposit" ? "Alokasi gaji bulan ini" : "Alasan penarikan darurat"} value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button type="submit" isLoading={isSubmitting} className="w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                {type === "deposit" ? "Setor Dana Darurat" : "Tarik Dana Darurat"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
