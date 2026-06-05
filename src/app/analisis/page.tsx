"use client";

import { useAIPrediction, useDashboardStats, useExpenses } from "@/hooks/useExpenses";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PredictionCard from "@/components/ai/PredictionCard";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import CategoryList from "@/components/dashboard/CategoryList";
import { formatRupiah } from "@/lib/utils";
import { Sparkles, TrendingUp, TrendingDown, BarChart3, RefreshCw, Download } from "lucide-react";
import { generatePDF } from "@/lib/pdfExport";
import { useState } from "react";
import PDFPreviewModal from "@/components/dashboard/PDFPreviewModal";

export default function AnalisisPage() {
  const { prediction, isLoading, isError, refreshPrediction } = useAIPrediction();
  const { stats } = useDashboardStats();
  const { expenses } = useExpenses();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<any>(null);

  const handleExportPDF = () => {
    const doc = generatePDF(expenses, stats, prediction);
    setActiveDoc(doc);
    
    const blobUrl = doc.output("bloburl");
    setPdfBlobUrl(blobUrl.toString());
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = () => {
    if (activeDoc) {
      activeDoc.save(`FinTrack-Laporan-${new Date().toISOString().slice(0, 10)}.pdf`);
      setIsPreviewOpen(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Analisis AI</h1>
            <p className="page-subtitle">
              Prediksi dan rekomendasi cerdas berdasarkan pola pengeluaran Anda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download size={14} />
              Ekspor Laporan PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshPrediction}
              className="flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh Prediksi
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-grid stagger-children mb-5">
        {/* Prediksi Besok */}
        <Card glowing>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl" style={{ background: "var(--primary-glow)" }}>
              <TrendingUp size={18} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Prediksi Besok
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {prediction?.prediksiHarianEsok?.nominal ? formatRupiah(prediction.prediksiHarianEsok.nominal) : "—"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {prediction?.prediksiHarianEsok?.alasan || "Menunggu data..."}
          </p>
        </Card>

        {/* Prediksi Bulan Depan */}
        <Card glowing>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.12)" }}>
              <BarChart3 size={18} style={{ color: "var(--success)" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Prediksi Bulan Depan
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {prediction?.prediksiBulananDepan?.nominal ? formatRupiah(prediction.prediksiBulananDepan.nominal) : "—"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {prediction?.prediksiBulananDepan?.alasan || "Menunggu data..."}
          </p>
        </Card>

        {/* Kategori Tertinggi */}
        <Card glowing>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.12)" }}>
              <TrendingDown size={18} style={{ color: "var(--danger)" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Kategori Boros Terprediksi
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {prediction?.prediksiBulananDepan?.kategoriPrediksiTinggi || "—"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Kategori yang diprediksi paling boros
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="dashboard-two-col">
        <div className="flex flex-col gap-5">
          {/* Chart */}
          {stats?.weeklyTrend && (
            <ExpenseChart
              data={stats.weeklyTrend}
              title="Tren Pengeluaran 7 Hari Terakhir"
            />
          )}

          {/* Category Breakdown */}
          {stats?.categoryBreakdown && (
            <CategoryList data={stats.categoryBreakdown} />
          )}
        </div>

        <div className="right-panel">
          {/* Full AI Prediction Card */}
          <PredictionCard
            prediction={prediction}
            isLoading={isLoading}
            error={isError}
            onRefresh={refreshPrediction}
          />

          {/* AI Info Card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} style={{ color: "var(--primary)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Tentang Prediksi AI
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Prediksi dihasilkan oleh <strong style={{ color: "var(--text-primary)" }}>Google Gemini AI</strong> berdasarkan analisis pola historis pengeluaran Anda selama 90 hari terakhir.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Semakin banyak data pengeluaran yang Anda masukkan, semakin akurat prediksi yang dihasilkan. Minimal 3 transaksi diperlukan untuk memulai analisis.
              </p>
              <div
                className="mt-3 p-2.5 rounded-xl text-xs"
                style={{
                  background: "var(--primary-glow)",
                  color: "var(--text-secondary)",
                }}
              >
                💡 Prediksi bersifat estimasi dan sebaiknya digunakan sebagai panduan perencanaan, bukan keputusan mutlak.
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfBlobUrl={pdfBlobUrl}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
}
