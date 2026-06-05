import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMERGENCY_FUND_TARGET = 10000000; // Rp 10 juta default target

// GET /api/emergency-fund - Get fund stats + transaction history
export async function GET() {
  try {
    const transactions = await prisma.emergencyFund.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate stats
    const deposits = transactions.filter((t) => t.type === "deposit");
    const withdrawals = transactions.filter((t) => t.type === "withdrawal");

    const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalDeposits - totalWithdrawals;

    // Monthly deposit (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyDeposit = deposits
      .filter((t) => new Date(t.createdAt) >= monthStart)
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transactions,
      stats: {
        totalBalance: Math.max(0, totalBalance),
        totalDeposits,
        totalWithdrawals,
        transactionCount: transactions.length,
        monthlyDeposit,
        targetAmount: EMERGENCY_FUND_TARGET,
        progressPercent: Math.min(
          Math.round((Math.max(0, totalBalance) / EMERGENCY_FUND_TARGET) * 100),
          100
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching emergency fund:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dana darurat" },
      { status: 500 }
    );
  }
}

// POST /api/emergency-fund - Add deposit or withdrawal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, description } = body;

    if (!amount || !type) {
      return NextResponse.json(
        { error: "Jumlah dan tipe transaksi wajib diisi" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah harus berupa angka positif" },
        { status: 400 }
      );
    }

    if (!["deposit", "withdrawal"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe harus 'deposit' atau 'withdrawal'" },
        { status: 400 }
      );
    }

    const transaction = await prisma.emergencyFund.create({
      data: {
        amount: Number(amount),
        type: String(type),
        description: description ? String(description) : null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating emergency fund transaction:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi dana darurat" },
      { status: 500 }
    );
  }
}

// DELETE /api/emergency-fund?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    await prisma.emergencyFund.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting emergency fund transaction:", error);
    return NextResponse.json(
      { error: "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}
