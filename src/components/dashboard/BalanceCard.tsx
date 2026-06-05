"use client";

import Card from "@/components/ui/Card";
import { formatRupiah } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Shield } from "lucide-react";

interface BalanceCardProps {
  monthIncome: number;
  monthExpense: number;
  balance: number;
  balanceStatus: "surplus" | "defisit" | "impas";
  emergencyFundBalance?: number;
  emergencyFundMonthDeposit?: number;
}

export default function BalanceCard({
  monthIncome,
  monthExpense,
  balance,
  balanceStatus,
  emergencyFundBalance = 0,
  emergencyFundMonthDeposit = 0,
}: BalanceCardProps) {
  const statusConfig = {
    surplus: {
      label: "Surplus",
      sublabel: "Anda hemat bulan ini! 🎉",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      icon: TrendingUp,
    },
    defisit: {
      label: "Defisit",
      sublabel: "Pengeluaran melebihi pemasukan ⚠️",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.08)",
      borderColor: "rgba(239, 68, 68, 0.2)",
      icon: TrendingDown,
    },
    impas: {
      label: "Impas",
      sublabel: "Pemasukan = Pengeluaran",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.08)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      icon: Minus,
    },
  };

  const config = statusConfig[balanceStatus];
  const StatusIcon = config.icon;

  // Total outflow = expenses + emergency fund deposits
  const totalOutflow = monthExpense + emergencyFundMonthDeposit;

  return (
    <Card>
      {/* Balance Header */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: config.color }}
          >
            Saldo Bulan Ini
          </span>
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: config.borderColor, color: config.color }}
          >
            <StatusIcon size={12} />
            {config.label}
          </div>
        </div>
        <p className="text-2xl font-bold" style={{ color: config.color }}>
          {balance >= 0 ? "+" : ""}
          {formatRupiah(Math.abs(balance))}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {config.sublabel}
        </p>
      </div>

      {/* Income vs Expense Breakdown */}
      <div className="space-y-3">
        {/* Income Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <ArrowDownRight size={16} style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Pemasukan
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Total bulan ini
              </p>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums" style={{ color: "#10b981" }}>
            +{formatRupiah(monthIncome)}
          </p>
        </div>

        {/* Expense Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.1)" }}
            >
              <ArrowUpRight size={16} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Pengeluaran
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Total bulan ini
              </p>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums" style={{ color: "#ef4444" }}>
            -{formatRupiah(monthExpense)}
          </p>
        </div>

        {/* Emergency Fund Row */}
        {emergencyFundMonthDeposit > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99, 102, 241, 0.1)" }}
              >
                <Shield size={16} style={{ color: "#6366f1" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Dana Darurat
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Tersimpan: {formatRupiah(emergencyFundBalance)}
                </p>
              </div>
            </div>
            <p className="text-sm font-bold tabular-nums" style={{ color: "#6366f1" }}>
              -{formatRupiah(emergencyFundMonthDeposit)}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "var(--text-muted)" }}>
            <span>Pengeluaran vs Pemasukan</span>
            <span>
              {monthIncome > 0
                ? `${Math.min(Math.round((totalOutflow / monthIncome) * 100), 999)}%`
                : "—"}
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${monthIncome > 0 ? Math.min((totalOutflow / monthIncome) * 100, 100) : 0}%`,
                background:
                  monthIncome > 0 && totalOutflow / monthIncome > 0.8
                    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                    : "linear-gradient(90deg, #10b981, #6366f1)",
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
