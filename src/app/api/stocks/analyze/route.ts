import { NextResponse } from "next/server";
import type { StockQuote } from "@/types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const { stocks } = (await request.json()) as { stocks: StockQuote[] };

    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ error: "Data saham diperlukan" }, { status: 400 });
    }

    const stockSummary = stocks.map((s) => ({
      simbol: s.symbol,
      nama: s.name,
      harga: s.price,
      perubahan: `${s.change >= 0 ? "+" : ""}${s.change.toFixed(0)} (${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(2)}%)`,
      volume: s.volume,
    }));

    if (!apiKey) {
      // Simulated response when no API key
      const ihsg = stocks.find((s) => s.symbol === "JKSE" || s.symbol === "^JKSE");
      const avgChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
      const sentiment = avgChange > 0.5 ? "bullish" : avgChange < -0.5 ? "bearish" : "netral";

      return NextResponse.json({
        ringkasanPasar: `IHSG berada di level ${ihsg?.price?.toLocaleString("id-ID") ?? "N/A"}. Rata-rata pergerakan saham blue-chip hari ini ${avgChange >= 0 ? "naik" : "turun"} ${Math.abs(avgChange).toFixed(2)}%.`,
        sentimen: sentiment,
        rekomendasiReksaDana: "Untuk investasi reksa dana jangka panjang, tetap konsisten dengan strategi dollar-cost averaging (DCA) tanpa terpengaruh fluktuasi harian.",
        analisaIndeks: `Pergerakan IHSG hari ini menunjukkan sentimen ${sentiment}. Saham-saham perbankan yang dominan di portofolio reksa dana menunjukkan pergerakan yang ${avgChange >= 0 ? "positif" : "koreksi ringan"}.`,
        tipsInvestasi: [
          "Tetap konsisten melakukan investasi rutin (DCA) setiap bulan",
          "Jangan panik menjual saat pasar turun, reksa dana adalah investasi jangka panjang",
          "Diversifikasi antara reksa dana saham, campuran, dan pasar uang",
        ],
        isSimulated: true,
      });
    }

    const prompt = `
Anda adalah analis pasar saham Indonesia profesional. Analisis data saham berikut dan berikan insight yang relevan untuk investor reksa dana pemula.

Data Saham Hari Ini:
${JSON.stringify(stockSummary, null, 2)}

Berikan analisis dalam format JSON murni (tanpa markdown code block), dengan struktur:
{
  "ringkasanPasar": "ringkasan kondisi pasar hari ini dalam 2-3 kalimat",
  "sentimen": "bullish" | "bearish" | "netral",
  "rekomendasiReksaDana": "rekomendasi spesifik untuk investor reksa dana",
  "analisaIndeks": "analisa pergerakan IHSG dan saham blue-chip",
  "tipsInvestasi": ["tip 1", "tip 2", "tip 3"]
}

Pastikan:
- Fokus pada perspektif investor reksa dana, bukan trader harian
- Gunakan bahasa Indonesia yang mudah dipahami
- Tips harus praktis dan actionable
- HANYA output JSON murni
`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "FinTrack AI",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-coder:free",
        messages: [
          { role: "system", content: "Anda adalah analis pasar saham Indonesia. Jawab dalam JSON murni." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";
    let cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/(\]|\}|"|true|false|null)\s*\n?\s*("[\w\d]+"\s*:)/g, "$1, $2")
      .replace(/,\s*,/g, ",")
      .trim();

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Stock analysis error:", error);
    return NextResponse.json({
      ringkasanPasar: "Tidak dapat menganalisis pasar saat ini.",
      sentimen: "netral",
      rekomendasiReksaDana: "Tetap konsisten dengan strategi investasi jangka panjang Anda.",
      analisaIndeks: "Data analisis tidak tersedia saat ini.",
      tipsInvestasi: ["Investasi secara rutin setiap bulan", "Jangan panik saat pasar volatil"],
      isSimulated: true,
    });
  }
}
