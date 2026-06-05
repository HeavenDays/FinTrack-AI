import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/expenses - List all expenses (ordered by newest)
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengeluaran" },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, category, description, createdAt } = body;

    if (!amount || !category) {
      return NextResponse.json(
        { error: "Jumlah dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah harus berupa angka positif" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        amount: Number(amount),
        category: String(category),
        description: description ? String(description) : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengeluaran" },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses?id=xxx - Delete an expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID pengeluaran wajib diisi" },
        { status: 400 }
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pengeluaran" },
      { status: 500 }
    );
  }
}
