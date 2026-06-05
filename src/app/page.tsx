"use client";

import { useExpenses, useDashboardStats, useAIPrediction } from "@/hooks/useExpenses";
import StatCard from "@/components/dashboard/StatCard";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import CategoryList from "@/components/dashboard/CategoryList";
import RecentList from "@/components/dashboard/RecentList";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import PredictionCard from "@/components/ai/PredictionCard";

export default function DashboardPage() {
  const { addExpense, deleteExpense } = useExpenses();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { prediction, isLoading: aiLoading, isError: aiError, refreshPrediction } = useAIPrediction();

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Ringkasan keuangan dan prediksi AI Anda
        </p>
      </div>

      {/* Stats Cards - 4 columns */}
      <div className="stats-grid mb-6 stagger-children">
        <StatCard
          title="Pengeluaran Hari Ini"
          value={stats?.todayTotal ?? 0}
          subtitle="Total belanja hari ini"
          icon="today"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={stats?.monthTotal ?? 0}
          subtitle={`${stats?.totalExpenses ?? 0} transaksi`}
          icon="month"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={stats?.monthIncome ?? 0}
          subtitle={`${stats?.totalIncomes ?? 0} pemasukan`}
          icon="average"
        />
        <StatCard
          title="Rata-rata Harian"
          value={stats?.avgDaily ?? 0}
          subtitle="Rata-rata pengeluaran"
          icon="average"
        />
      </div>

      {/* Main Content: Chart + Right Panel */}
      <div className="dashboard-two-col">
        <div className="flex flex-col gap-5">
          {/* Balance Card */}
          {!statsLoading && stats && (
            <BalanceCard
              monthIncome={stats.monthIncome}
              monthExpense={stats.monthTotal}
              balance={stats.balance}
              balanceStatus={stats.balanceStatus}
              emergencyFundBalance={stats.emergencyFundBalance}
              emergencyFundMonthDeposit={stats.emergencyFundMonthDeposit}
            />
          )}

          {/* Chart */}
          {!statsLoading && stats?.weeklyTrend && (
            <ExpenseChart data={stats.weeklyTrend} />
          )}

          {/* Category Breakdown */}
          {!statsLoading && stats?.categoryBreakdown && (
            <CategoryList data={stats.categoryBreakdown} />
          )}
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Expense Form */}
          <ExpenseForm onSubmit={addExpense} />

          {/* AI Prediction */}
          <PredictionCard
            prediction={prediction}
            isLoading={aiLoading}
            error={aiError}
            onRefresh={refreshPrediction}
          />

          {/* Recent Expenses */}
          {stats?.recentExpenses && (
            <RecentList
              expenses={stats.recentExpenses}
              onDelete={deleteExpense}
              showDelete
            />
          )}
        </div>
      </div>
    </div>
  );
}
