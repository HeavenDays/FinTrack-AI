"use client";

import { useState } from "react";
import { useStocks, useStockAnalysis } from "@/hooks/useExpenses";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { StockQuote } from "@/types";
import {
  TrendingUp, TrendingDown, RefreshCw, BarChart3,
  Sparkles, ArrowUpRight, ArrowDownRight, Minus,
  Target, Lightbulb, Activity, Clock, AlertTriangle,
} from "lucide-react";

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

function formatPrice(price: number, currency: string): string {
  if (currency === "IDR") {
    return `Rp ${price.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  }
  return price.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

const sentimenConfig = {
  bullish: { label: "Bullish", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", icon: TrendingUp },
  bearish: { label: "Bearish", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: TrendingDown },
  netral: { label: "Netral", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: Minus },
};

export default function SahamPage() {
  const { stocks, isSimulated, lastUpdated, isLoading, refresh } = useStocks();
  const { analysis, isLoading: aiLoading, refresh: refreshAI } = useStockAnalysis(stocks);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);

  const ihsg = stocks.find((s) => s.symbol === "JKSE" || s.symbol === "^JKSE");
  const otherStocks = stocks.filter((s) => s.symbol !== "JKSE" && s.symbol !== "^JKSE");

  const gainers = [...otherStocks].filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
  const losers = [...otherStocks].filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Monitor Saham</h1>
            <p className="page-subtitle">Pantau saham Indonesia untuk investasi reksa dana Anda</p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <Clock size={10} />
                {new Date(lastUpdated).toLocaleTimeString("id-ID")}
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={() => { refresh(); refreshAI(); }} isLoading={isLoading}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {isSimulated && (
        <div className="p-3 rounded-xl mb-5 text-xs flex items-center gap-2"
          style={{ background: "rgba(245, 158, 11, 0.08)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
          <AlertTriangle size={14} /> Data saham mungkin tidak real-time. Yahoo Finance API memerlukan koneksi internet.
        </div>
      )}

      {/* IHSG Index Card */}
      {ihsg && (
        <Card className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl"
                style={{ background: ihsg.changePercent >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
                <BarChart3 size={28} style={{ color: ihsg.changePercent >= 0 ? "#10b981" : "#ef4444" }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Indeks Harga Saham Gabungan
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {ihsg.price.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end"
                style={{ color: ihsg.changePercent >= 0 ? "#10b981" : "#ef4444" }}>
                {ihsg.changePercent >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                <span className="text-lg font-bold tabular-nums">
                  {ihsg.changePercent >= 0 ? "+" : ""}{ihsg.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                {ihsg.change >= 0 ? "+" : ""}{ihsg.change.toFixed(2)} pts
              </p>
            </div>
          </div>

          {/* IHSG Mini Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="text-center">
              <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Open</p>
              <p className="text-xs font-semibold tabular-nums">{ihsg.open.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>High</p>
              <p className="text-xs font-semibold tabular-nums" style={{ color: "#10b981" }}>{ihsg.dayHigh.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Low</p>
              <p className="text-xs font-semibold tabular-nums" style={{ color: "#ef4444" }}>{ihsg.dayLow.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Prev Close</p>
              <p className="text-xs font-semibold tabular-nums">{ihsg.previousClose.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="dashboard-two-col">
        {/* Left: Stock List */}
        <div>
          <Card>
            <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Saham Blue-Chip Indonesia
            </h3>
            <p className="text-[10px] mb-4" style={{ color: "var(--text-muted)" }}>
              Saham-saham utama yang umumnya terdapat dalam portofolio reksa dana saham
            </p>

            {isLoading ? (
              <div className="empty-state">
                <div className="btn-spinner mx-auto mb-3" style={{ width: 24, height: 24, borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Mengambil data saham...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {otherStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => setSelectedStock(stock)}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-left"
                    style={{
                      background: selectedStock?.symbol === stock.symbol ? "var(--bg-tertiary)" : "var(--surface)",
                      border: selectedStock?.symbol === stock.symbol ? "1px solid var(--primary)" : "1px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                        style={{
                          background: stock.changePercent >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: stock.changePercent >= 0 ? "#10b981" : "#ef4444",
                        }}>
                        {stock.symbol.replace(".JK", "").substring(0, 4)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {stock.symbol.replace(".JK", "")}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {formatPrice(stock.price, stock.currency)}
                      </p>
                      <div className="flex items-center gap-0.5 justify-end"
                        style={{ color: stock.changePercent >= 0 ? "#10b981" : "#ef4444" }}>
                        {stock.changePercent >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        <span className="text-[11px] font-semibold tabular-nums">
                          {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Gainers & Losers */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <Card>
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp size={14} style={{ color: "#10b981" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#10b981" }}>Top Gainers</span>
              </div>
              {gainers.length === 0 ? (
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Tidak ada saham naik</p>
              ) : gainers.slice(0, 3).map((s) => (
                <div key={s.symbol} className="flex justify-between py-1.5">
                  <span className="text-xs font-medium">{s.symbol.replace(".JK", "")}</span>
                  <span className="text-xs font-bold" style={{ color: "#10b981" }}>+{s.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </Card>
            <Card>
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingDown size={14} style={{ color: "#ef4444" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#ef4444" }}>Top Losers</span>
              </div>
              {losers.length === 0 ? (
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Tidak ada saham turun</p>
              ) : losers.slice(0, 3).map((s) => (
                <div key={s.symbol} className="flex justify-between py-1.5">
                  <span className="text-xs font-medium">{s.symbol.replace(".JK", "")}</span>
                  <span className="text-xs font-bold" style={{ color: "#ef4444" }}>{s.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Right: Stock Detail + AI Analysis */}
        <div className="right-panel">
          {/* Stock Detail */}
          {selectedStock && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    {selectedStock.symbol.replace(".JK", "")}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{selectedStock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {formatPrice(selectedStock.price, selectedStock.currency)}
                  </p>
                  <p className="text-xs font-semibold"
                    style={{ color: selectedStock.changePercent >= 0 ? "#10b981" : "#ef4444" }}>
                    {selectedStock.changePercent >= 0 ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Open", value: formatPrice(selectedStock.open, selectedStock.currency) },
                  { label: "Prev Close", value: formatPrice(selectedStock.previousClose, selectedStock.currency) },
                  { label: "Day High", value: formatPrice(selectedStock.dayHigh, selectedStock.currency), color: "#10b981" },
                  { label: "Day Low", value: formatPrice(selectedStock.dayLow, selectedStock.currency), color: "#ef4444" },
                  { label: "Volume", value: formatVolume(selectedStock.volume) },
                  { label: "Change", value: `${selectedStock.change >= 0 ? "+" : ""}${selectedStock.change.toFixed(0)}` },
                ].map((item) => (
                  <div key={item.label} className="p-2 rounded-lg" style={{ background: "var(--surface)" }}>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                    <p className="text-xs font-semibold tabular-nums" style={{ color: item.color || "var(--text-primary)" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Analysis */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: "#8b5cf6" }} />
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Analisis AI Pasar
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refreshAI()} isLoading={aiLoading}>
                <RefreshCw size={14} />
              </Button>
            </div>

            {aiLoading ? (
              <div className="py-6 text-center">
                <div className="btn-spinner mx-auto mb-2" style={{ width: 20, height: 20, borderColor: "var(--border)", borderTopColor: "#8b5cf6" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Menganalisis kondisi pasar...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* Sentimen */}
                {(() => {
                  const cfg = sentimenConfig[analysis.sentimen] || sentimenConfig.netral;
                  const SIcon = cfg.icon;
                  return (
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: cfg.bg }}>
                      <SIcon size={16} style={{ color: cfg.color }} />
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>
                        Sentimen Pasar: {cfg.label}
                      </span>
                    </div>
                  );
                })()}

                {/* Market Summary */}
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {analysis.ringkasanPasar}
                </p>

                {/* Index Analysis */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity size={13} style={{ color: "#6366f1" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>Analisis Indeks</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {analysis.analisaIndeks}
                  </p>
                </div>

                {/* Reksa Dana Recommendation */}
                <div className="p-3 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Target size={12} style={{ color: "#10b981" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#10b981" }}>
                      Rekomendasi Reksa Dana
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                    {analysis.rekomendasiReksaDana}
                  </p>
                </div>

                {/* Tips */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb size={13} style={{ color: "#f59e0b" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>Tips Investasi</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysis.tipsInvestasi.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "#f59e0b" }}>→</span> {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                Memuat data saham untuk analisis...
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
