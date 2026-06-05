import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/incomes - List all incomes (ordered by newest)
export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pemasukan" },
      { status: 500 }
    );
  }
}

// POST /api/incomes - Create a new income
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, source, description, createdAt } = body;

    if (!amount || !source) {
      return NextResponse.json(
        { error: "Jumlah dan sumber pemasukan wajib diisi" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah harus berupa angka positif" },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        amount: Number(amount),
        source: String(source),
        description: description ? String(description) : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pemasukan" },
      { status: 500 }
    );
  }
}

// DELETE /api/incomes?id=xxx - Delete an income
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID pemasukan wajib diisi" },
        { status: 400 }
      );
    }

    await prisma.income.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pemasukan" },
      { status: 500 }
    );
  }
}
