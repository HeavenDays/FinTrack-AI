import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    const notes = await prisma.learningNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    if (notes.length === 0) {
      return NextResponse.json({
        ringkasan: "Belum ada catatan belajar. Mulai catat pembelajaran pertama Anda!",
        pencapaian: [],
        saranBelajar: [
          "Mulai dengan mencatat apa yang Anda pelajari hari ini",
          "Tetapkan topik utama yang ingin Anda kuasai",
          "Buat jadwal belajar harian minimal 30 menit",
        ],
        targetMingguIni: "Buat 3 catatan belajar pertama Anda minggu ini",
        motivasi: "Perjalanan seribu langkah dimulai dari satu langkah kecil. Ayo mulai! 🚀",
      });
    }

    if (!apiKey) {
      // Simulation mode
      const completedCount = notes.filter((n) => n.status === "completed").length;
      const topicsLearned = [...new Set(notes.map((n) => n.topic))];
      return NextResponse.json({
        ringkasan: `Anda telah mencatat ${notes.length} pembelajaran dengan ${completedCount} selesai. Topik yang dipelajari: ${topicsLearned.join(", ")}.`,
        pencapaian: [
          `${completedCount} materi telah diselesaikan`,
          `${topicsLearned.length} topik berbeda telah dijelajahi`,
          `${notes.length} catatan belajar tercatat`,
        ],
        saranBelajar: [
          "Lanjutkan topik yang masih berstatus 'in-progress'",
          "Review kembali materi yang sudah selesai untuk penguatan",
          "Coba eksplorasi topik baru yang berkaitan",
        ],
        targetMingguIni: "Selesaikan minimal 2 catatan yang masih in-progress",
        motivasi: "Konsistensi mengalahkan intensitas. Terus belajar! 💪",
        isSimulated: true,
      });
    }

    // AI-powered suggestions
    const notesData = notes.map((n) => ({
      judul: n.title,
      topik: n.topic,
      status: n.status,
      tanggal: n.createdAt,
      konten: n.content.substring(0, 200),
    }));

    const prompt = `
Anda adalah AI Mentor Belajar Profesional. Analisis catatan belajar berikut dan berikan saran yang personal dan actionable.

Data Catatan Belajar (${notesData.length} catatan):
${JSON.stringify(notesData, null, 2)}

Berikan hasil analisis dalam format JSON murni (tanpa markdown code block), dengan struktur persis berikut:
{
  "ringkasan": "ringkasan singkat progress belajar user (2-3 kalimat)",
  "pencapaian": ["pencapaian 1", "pencapaian 2", "pencapaian 3"],
  "saranBelajar": ["saran spesifik 1", "saran spesifik 2", "saran spesifik 3"],
  "targetMingguIni": "target belajar minggu ini yang realistis dan spesifik",
  "motivasi": "kalimat motivasi yang personal berdasarkan progress user"
}

Pastikan:
- Ringkasan mencerminkan data yang ada (topik apa yang dipelajari, berapa yang selesai)
- Saran belajar berkaitan langsung dengan topik yang sedang dipelajari user
- Target minggu ini realistis dan terukur
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
          {
            role: "system",
            content: "Anda adalah AI Mentor Belajar. Jawab dalam JSON murni yang valid.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";

    let cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/(\]|\}|"|true|false|null)\s*\n?\s*("[\w\d]+"\s*:)/g, "$1, $2")
      .replace(/,\s*,/g, ",")
      .trim();

    const parsed = JSON.parse(cleanedText);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating learning suggestions:", error);
    return NextResponse.json(
      {
        ringkasan: "Gagal memuat saran AI saat ini.",
        pencapaian: [],
        saranBelajar: ["Coba lagi dalam beberapa saat"],
        targetMingguIni: "Tetap konsisten belajar setiap hari",
        motivasi: "Setiap usaha kecil membawa perubahan besar! 🌟",
        isSimulated: true,
      },
      { status: 200 }
    );
  }
}
