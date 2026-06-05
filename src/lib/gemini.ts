import type { AIPredictionResponse, Expense } from "@/types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function dapatkanPrediksiAI(
  historisPengeluaran: Expense[]
): Promise<AIPredictionResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum dikonfigurasi");
  }

  const dataRingkas = historisPengeluaran.map((e) => ({
    jumlah: e.amount,
    kategori: e.category,
    tanggal: e.createdAt,
    deskripsi: e.description,
  }));

  const prompt = `
Anda adalah AI Asisten Keuangan Profesional. Tugas Anda adalah menganalisis data riwayat pengeluaran berikut dan memprediksi pengeluaran hari esok dan bulan depan secara akurat.

Data Pengeluaran Historis (${dataRingkas.length} transaksi):
${JSON.stringify(dataRingkas, null, 2)}

Berikan hasil analisis dalam format JSON murni (tanpa markdown code block, tanpa backticks), dengan struktur persis berikut:
{
  "prediksiHarianEsok": { "nominal": 15000, "alasan": "alasan perkiraan harian" },
  "prediksiBulananDepan": { "nominal": 450000, "kategoriPrediksiTinggi": "Transportasi", "alasan": "alasan perkiraan bulanan" },
  "rekomendasiHemat": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"],
  "anomaliPengeluaran": "deskripsi anomali"
}

Pastikan:
- Jika tidak ada anomali, isi "anomaliPengeluaran" dengan null (tanpa tanda kutip, bukan "null")
- nominal dalam tipe data number (Rupiah/IDR)
- rekomendasiHemat berisi tepat 3 tips yang praktis dan spesifik berdasarkan data
- Semua properti JSON HARUS dipisahkan dengan koma secara valid. HANYA output JSON murni, tanpa teks penjelasan tambahan.
`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "FinTrack AI",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-coder:free",
      messages: [
        {
          role: "system",
          content: "Anda adalah AI Asisten Keuangan Profesional. Selalu jawab dalam format JSON murni yang valid secara sintaksis. Jangan sertakan markdown code block.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error("OpenRouter API error:", response.status, errBody);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content || "";

  // Clean response - remove potential markdown formatting
  let cleanedText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Robust JSON Repair: Fix missing commas between properties (e.g. `] "anomaliPengeluaran"` -> `], "anomaliPengeluaran"`)
  // and `} "anomaliPengeluaran"` -> `}, "anomaliPengeluaran"`
  cleanedText = cleanedText
    .replace(/(\]|\}|"|\d|true|false|null)\s*\n?\s*("[\w\d]+"\s*:)/g, "$1, $2")
    // Fix double commas if we accidentally added one
    .replace(/,\s*,/g, ",");

  try {
    const parsed = JSON.parse(cleanedText);
    
    // Normalize anomaliPengeluaran if it's the string "null"
    if (parsed.anomaliPengeluaran === "null") {
      parsed.anomaliPengeluaran = null;
    }
    
    return parsed as AIPredictionResponse;
  } catch (err) {
    console.error("JSON parsing failed. Raw response text was:", JSON.stringify(text));
    console.error("Cleaned response text was:", JSON.stringify(cleanedText));
    throw new Error("Format respon AI tidak valid");
  }
}
