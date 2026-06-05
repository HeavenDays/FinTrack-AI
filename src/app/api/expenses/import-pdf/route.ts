import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as pdfParseNamespace from "pdf-parse";
const pdf = ((pdfParseNamespace as any).default || pdfParseNamespace) as any;

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan dalam unggahan" },
        { status: 400 }
      );
    }

    // Limit PDF size to 5MB to avoid excessive token usage
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file PDF maksimal adalah 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer and parse text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfData = await pdf(buffer);
    const pdfText = pdfData.text || "";

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: "PDF kosong atau teks tidak dapat diekstraksi" },
        { status: 400 }
      );
    }

    // Send the extracted text to AI to parse into transactions
    const prompt = `
Anda adalah AI Asisten Keuangan. Tugas Anda adalah membaca teks yang diekstrak dari dokumen PDF (bisa berupa mutasi rekening bank, struk belanja, tagihan, atau laporan pengeluaran) dan mengekstrak semua transaksi pengeluaran/debet.

Teks PDF Hasil Ekstraksi:
"""
${pdfText.substring(0, 10000)} // Limit to first 10,000 characters to protect context limit
"""

Instruksi Ekstraksi:
1. Temukan dan ambil semua transaksi pengeluaran (debet / uang keluar / pembelanjaan).
2. Abaikan transaksi pemasukan (kredit / uang masuk / transfer masuk).
3. Klasifikasikan setiap transaksi pengeluaran ke salah satu dari kategori standar berikut:
   - Makanan & Minuman
   - Transportasi
   - Belanja
   - Hiburan
   - Tagihan & Utilitas
   - Kesehatan
   - Lainnya
4. Buat deskripsi yang singkat namun jelas berdasarkan informasi di teks.
5. Konversi semua nominal ke angka numerik positif (number) dalam Rupiah (jika mata uang asing, estimasikan konversinya).

Kembalikan hasil ekstraksi dalam format JSON murni berupa array objek dengan struktur persis seperti berikut (tanpa markdown code blocks, tanpa backticks, tanpa teks tambahan apa pun):
[
  {
    "amount": number,
    "category": "Makanan & Minuman" | "Transportasi" | "Belanja" | "Hiburan" | "Tagihan & Utilitas" | "Kesehatan" | "Lainnya",
    "description": "string"
  }
]

HANYA kembalikan JSON array yang valid. Jika tidak ditemukan transaksi pengeluaran sama sekali, kembalikan array kosong [].
`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "FinTrack AI - PDF Import",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-coder:free",
        messages: [
          {
            role: "system",
            content: "Anda adalah AI ekstraktor data keuangan. Selalu jawab hanya dengan array JSON murni tanpa markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter API error (Import PDF):", response.status, errBody);
      return NextResponse.json(
        { error: "Gagal memproses AI saat mengekstrak PDF" },
        { status: 500 }
      );
    }

    const result = await response.json();
    const aiOutput = result.choices?.[0]?.message?.content || "";

    // Clean output
    let cleanedOutput = aiOutput
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Basic JSON repair just in case
    cleanedOutput = cleanedOutput
      .replace(/(\]|\}|"|\d|true|false|null)\s*\n?\s*("[\w\d]+"\s*:)/g, "$1, $2")
      .replace(/,\s*,/g, ",");

    let transactions: Array<{ amount: number; category: string; description: string }> = [];
    try {
      transactions = JSON.parse(cleanedOutput);
    } catch (parseError) {
      console.error("Failed to parse AI output for PDF:", cleanedOutput, parseError);
      return NextResponse.json(
        { error: "AI tidak menghasilkan format JSON yang valid. Silakan coba lagi." },
        { status: 500 }
      );
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada transaksi pengeluaran yang terdeteksi di dalam PDF ini." },
        { status: 200 }
      );
    }

    // Filter out invalid records and ensure types are correct
    const validTransactions = transactions
      .filter(t => t && typeof t.amount === "number" && t.amount > 0 && t.category)
      .map(t => ({
        amount: t.amount,
        category: t.category,
        description: t.description || "Transaksi PDF",
      }));

    if (validTransactions.length === 0) {
      return NextResponse.json(
        { error: "Data transaksi hasil ekstraksi tidak valid." },
        { status: 400 }
      );
    }

    // Insert transactions into database
    await prisma.expense.createMany({
      data: validTransactions,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${validTransactions.length} transaksi pengeluaran dari PDF.`,
      count: validTransactions.length,
      data: validTransactions,
    });
  } catch (error) {
    console.error("Import PDF error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses PDF" },
      { status: 500 }
    );
  }
}
