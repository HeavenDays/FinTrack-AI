import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dapatkanPrediksiAI } from "@/lib/gemini";

// GET /api/predict - Get AI prediction based on expense history
export async function GET() {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY belum dikonfigurasi" },
        { status: 500 }
      );
    }

    // Get last 90 days of expenses for analysis
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    if (expenses.length < 3) {
      return NextResponse.json(
        {
          error: "Minimal 3 data pengeluaran diperlukan untuk prediksi AI",
        },
        { status: 400 }
      );
    }

    try {
      const prediction = await dapatkanPrediksiAI(
        expenses.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        }))
      );
      return NextResponse.json(prediction);
    } catch (aiError: any) {
      console.warn("OpenRouter API failed, falling back to local heuristic simulation:", aiError.message);
      
      // Calculate local statistics for mock/offline prediction
      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Count unique days with transactions
      const uniqueDays = new Set(
        expenses.map((e) => e.createdAt.toISOString().slice(0, 10))
      );
      const daysCount = Math.max(uniqueDays.size, 1);
      const dailyAverage = totalAmount / daysCount;

      // Group by category to find top categories
      const categoryTotals: Record<string, number> = {};
      expenses.forEach((e) => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

      let topCategory = "Lainnya";
      let maxCategoryAmount = 0;
      Object.entries(categoryTotals).forEach(([cat, amt]) => {
        if (amt > maxCategoryAmount) {
          maxCategoryAmount = amt;
          topCategory = cat;
        }
      });

      // Find largest single transaction as potential anomaly
      let largestExpense = expenses[0];
      expenses.forEach((e) => {
        if (e.amount > largestExpense.amount) {
          largestExpense = e;
        }
      });

      const hasAnomaly = largestExpense && largestExpense.amount > dailyAverage * 2.2;
      const formatRupiahLocal = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      };

      // Construct offline prediction response
      const simulatedPrediction = {
        prediksiHarianEsok: {
          nominal: Math.round(dailyAverage * 1.05),
          alasan: `Dihitung berdasarkan rata-rata pengeluaran harian Anda sebesar ${formatRupiahLocal(dailyAverage)} dari data lokal.`,
        },
        prediksiBulananDepan: {
          nominal: Math.round(dailyAverage * 30),
          kategoriPrediksiTinggi: topCategory,
          alasan: `Estimasi bulanan dihitung dari rata-rata harian dengan alokasi terbesar terdeteksi pada kategori ${topCategory}.`,
        },
        rekomendasiHemat: [
          `Porsi pengeluaran terbesar Anda ada pada kategori "${topCategory}". Coba buat batasan khusus untuk kategori ini.`,
          "Gunakan fitur 'Import via PDF' di menu Pengeluaran untuk mencatat transaksi bank Anda secara otomatis guna melacak kebocoran dana kecil.",
          `Sisihkan tabungan minimal 10% sebelum membelanjakan rata-rata ${formatRupiahLocal(dailyAverage)} per hari agar keuangan tetap seimbang.`,
        ],
        anomaliPengeluaran: hasAnomaly
          ? `Terdeteksi pengeluaran cukup besar pada transaksi "${largestExpense.description || largestExpense.category}" sebesar ${formatRupiahLocal(largestExpense.amount)}, melebihi rata-rata harian Anda.`
          : null,
        isSimulated: true,
        simulationReason: "Batas kuota OpenRouter API terlampaui. Menampilkan analisis berbasis pola transaksi lokal Anda (Offline Heuristics).",
      };

      return NextResponse.json(simulatedPrediction);
    }
  } catch (error) {
    console.error("Critical error in predict endpoint:", error);
    return NextResponse.json(
      { error: "Gagal mendapatkan prediksi AI" },
      { status: 500 }
    );
  }
}
