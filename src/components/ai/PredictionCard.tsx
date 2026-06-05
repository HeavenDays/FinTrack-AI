"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { AIPredictionResponse } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { Sparkles, RefreshCw, AlertTriangle, Lightbulb } from "lucide-react";

interface PredictionCardProps {
  prediction: AIPredictionResponse | undefined;
  isLoading: boolean;
  error: any;
  onRefresh: () => void;
}

export default function PredictionCard({
  prediction,
  isLoading,
  error,
  onRefresh,
}: PredictionCardProps) {
  if (error) {
    const isDataShortage = error.message?.includes("Minimal 3 data");
    return (
      <Card>
        <div className="text-center py-6">
          <AlertTriangle
            size={32}
            className="mx-auto mb-3"
            style={{ color: isDataShortage ? "var(--warning)" : "var(--danger)" }}
          />
          <p className="text-sm mb-4 px-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {error.message || "Terjadi kesalahan pada sistem prediksi AI."}
          </p>
          {!isDataShortage && (
            <Button variant="secondary" size="sm" onClick={onRefresh}>
              Coba Lagi
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (isLoading || !prediction) {
    return (
      <Card glowing>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} style={{ color: "var(--primary)" }} />
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Prediksi AI
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div
                className="h-3 rounded-full mb-2"
                style={{ background: "var(--surface-hover)", width: `${70 + i * 10}%` }}
              />
              <div
                className="h-5 rounded-full"
                style={{ background: "var(--surface-hover)", width: `${40 + i * 5}%` }}
              />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card glowing>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--primary-glow)" }}>
            <Sparkles size={16} style={{ color: "var(--primary)" }} />
          </div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Prediksi AI
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: "var(--text-muted)" }}
          aria-label="Refresh prediksi"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Prediksi Harian */}
      <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Prediksi Besok
        </p>
        <p className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {formatRupiah(prediction.prediksiHarianEsok.nominal)}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {prediction.prediksiHarianEsok.alasan}
        </p>
      </div>

      {/* Prediksi Bulanan */}
      <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Prediksi Bulan Depan
        </p>
        <p className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {formatRupiah(prediction.prediksiBulananDepan.nominal)}
        </p>
        <p className="text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
          {prediction.prediksiBulananDepan.alasan}
        </p>
        <span
          className="inline-block text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "var(--danger)",
          }}
        >
          Kategori tinggi: {prediction.prediksiBulananDepan.kategoriPrediksiTinggi}
        </span>
      </div>

      {/* Rekomendasi */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb size={13} style={{ color: "var(--success)" }} />
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--success)" }}>
            Tips Hemat
          </p>
        </div>
        <ul className="space-y-1.5">
          {prediction.rekomendasiHemat.map((tip, i) => (
            <li
              key={i}
              className="text-xs leading-relaxed pl-3 relative"
              style={{ color: "var(--text-secondary)" }}
            >
              <span
                className="absolute left-0 top-1.5 w-1 h-1 rounded-full"
                style={{ background: "var(--success)" }}
              />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Anomali */}
      {prediction.anomaliPengeluaran && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <AlertTriangle
            size={14}
            className="flex-shrink-0 mt-0.5"
            style={{ color: "var(--warning)" }}
          />
          <p className="text-xs leading-relaxed" style={{ color: "var(--warning)" }}>
            {prediction.anomaliPengeluaran}
          </p>
        </div>
      )}
    </Card>
  );
}
