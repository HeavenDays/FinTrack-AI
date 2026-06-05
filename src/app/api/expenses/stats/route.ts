import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { DashboardStats, CategoryBreakdown, WeeklyTrendItem } from "@/types";

// GET /api/expenses/stats - Dashboard statistics (expenses + income + balance)
export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ========= EXPENSES =========

    // Today's expense total
    const todayAgg = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: todayStart } },
    });

    // This month's expense total
    const monthAgg = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart } },
    });

    // Total expense count
    const totalExpenses = await prisma.expense.count();

    // Days in current month so far
    const dayOfMonth = now.getDate();
    const monthTotal = monthAgg._sum.amount || 0;
    const avgDaily = dayOfMonth > 0 ? monthTotal / dayOfMonth : 0;

    // Category breakdown (this month)
    const categoryData = await prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart } },
      orderBy: { _sum: { amount: "desc" } },
    });

    const categoryBreakdown: CategoryBreakdown[] = categoryData.map((c) => ({
      category: c.category,
      total: c._sum.amount || 0,
      percentage: monthTotal > 0 ? Math.round(((c._sum.amount || 0) / monthTotal) * 100) : 0,
    }));

    // Recent expenses (latest 10)
    const recentExpenses = await prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Weekly trend (last 7 days)
    const weeklyExpenses = await prisma.expense.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: "asc" },
    });

    const weeklyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      weeklyMap.set(key, 0);
    }

    weeklyExpenses.forEach((exp) => {
      const key = new Date(exp.createdAt).toISOString().split("T")[0];
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + exp.amount);
    });

    const weeklyTrend: WeeklyTrendItem[] = Array.from(weeklyMap.entries()).map(
      ([date, total]) => ({ date, total })
    );

    // ========= INCOME =========

    // Today's income total
    const todayIncomeAgg = await prisma.income.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: todayStart } },
    });

    // This month's income total
    const monthIncomeAgg = await prisma.income.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart } },
    });

    // Total income count
    const totalIncomes = await prisma.income.count();

    const monthIncome = monthIncomeAgg._sum.amount || 0;
    const todayIncome = todayIncomeAgg._sum.amount || 0;

    // ========= EMERGENCY FUND =========

    // All emergency fund transactions
    const allFundTx = await prisma.emergencyFund.findMany();
    const fundDeposits = allFundTx.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
    const fundWithdrawals = allFundTx.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
    const emergencyFundBalance = Math.max(0, fundDeposits - fundWithdrawals);

    // This month's fund deposits
    const monthFundDeposits = allFundTx
      .filter((t) => t.type === "deposit" && new Date(t.createdAt) >= monthStart)
      .reduce((s, t) => s + t.amount, 0);

    // ========= SALDO (BALANCE) =========
    // Saldo = Pemasukan - Pengeluaran - Dana Darurat bulan ini
    const balance = monthIncome - monthTotal - monthFundDeposits;
    const balanceStatus: "surplus" | "defisit" | "impas" =
      balance > 0 ? "surplus" : balance < 0 ? "defisit" : "impas";

    const stats: DashboardStats = {
      todayTotal: todayAgg._sum.amount || 0,
      monthTotal,
      avgDaily: Math.round(avgDaily),
      totalExpenses,
      categoryBreakdown,
      recentExpenses: recentExpenses.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      weeklyTrend,
      // Income & Balance
      monthIncome,
      todayIncome,
      totalIncomes,
      balance,
      balanceStatus,
      // Emergency Fund
      emergencyFundBalance,
      emergencyFundMonthDeposit: monthFundDeposits,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}

