# Panduan Proyek: FinTrack AI (Sistem Manajemen Pengeluaran Harian & Prediksi AI)

Dokumen ini berisi panduan arsitektur, struktur folder, skema warna, konfigurasi Docker, dan alur integrasi AI untuk membangun aplikasi pelacak pengeluaran harian dengan sistem prediksi cerdas menggunakan **Next.js (App Router)** dan **Docker**.

---

## 🎨 1. Sistem Warna (Color Hunt Palette & Global CSS)

Untuk menciptakan tampilan **modern, profesional, dan premium** (tidak terkesan murah atau "buatan AI template"), kita menggunakan palet warna gelap (Dark Mode) dengan aksen Indigo dan Teal yang terinspirasi dari Color Hunt yang merepresentasikan ketenangan finansial (*financial clarity*) dan teknologi modern.

### Global CSS (`src/styles/globals.css`)
Salin konfigurasi CSS variabel berikut untuk digunakan bersama Tailwind CSS atau Vanilla CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Color Hunt Palette: Navy Obsidian & Emerald Indigo */
  --background: #090d16;       /* Deep Obsidian Blue (Sangat Gelap & Premium) */
  --surface: #111827;          /* Slate Dark (Untuk Card & Form) */
  --surface-hover: #1f2937;    /* Slate Dark Hover State */
  
  --primary: #6366f1;          /* Indigo 500 (Aksen AI & Navigasi Utama) */
  --primary-glow: rgba(99, 102, 241, 0.15);
  
  --success: #10b981;          /* Emerald 500 (Pemasukan / Aman) */
  --warning: #f59e0b;          /* Amber 500 (Mendekati Limit) */
  --danger: #ef4444;           /* Red 500 (Pengeluaran / Overbudget) */
  
  --text-primary: #f9fafb;     /* White/Slate 50 */
  --text-secondary: #9ca3af;   /* Gray 400 (Informasi tambahan) */
  --text-muted: #6b7280;       /* Gray 500 (Placeholder / Tanggal) */
  
  --border: #1f2937;           /* Slate 800 (Garis batas halus) */
  --border-focus: #374151;
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

body {
  background-color: var(--background);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* Custom Premium Micro-Interactions */
.glass-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px var(--primary-glow);
}

.btn-primary {
  background: var(--primary);
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}
```

---

## 📂 2. Struktur File & Folder (Maintainable Architecture)

Struktur folder dirancang dengan memisahkan komponen UI reusable (*Atomic Design* sederhana), logika AI, dan interaksi database agar mudah di-maintenance jangka panjang.

```
fintrack-ai/
├── src/
│   ├── app/                    # Next.js App Router (Routing & Pages)
│   │   ├── layout.tsx          # Shell navigasi dan provider global
│   │   ├── page.tsx            # Dashboard utama (Ringkasan & Form Cepat)
│   │   ├── pengeluaran/        # Halaman CRUD & riwayat pengeluaran
│   │   │   └── page.tsx
│   │   ├── analisis/           # Halaman AI Prediksi & Rekomendasi
│   │   │   └── page.tsx
│   │   └── api/                # API Backend routes
│   │       ├── expenses/       # Endpoint kelola data pengeluaran
│   │       │   └── route.ts
│   │       └── predict/        # Endpoint integrasi AI Gemini
│   │           └── route.ts
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Komponen dasar (Button, Input, Card, Select)
│   │   ├── dashboard/          # Komponen spesifik dashboard (Chart, Stats)
│   │   └── ai/                 # Widget visualisasi AI & Forecast
│   ├── hooks/                  # Custom React Hooks (SWR/React Query helpers)
│   │   └── useExpenses.ts
│   ├── lib/                    # Library & Utility functions
│   │   ├── db.ts               # Inisialisasi Prisma / DB Client
│   │   ├── gemini.ts           # Helper integrasi Gemini AI
│   │   └── utils.ts            # Formatter mata uang & manipulasi tanggal
│   ├── styles/
│   │   └── globals.css
│   └── types/                  # TypeScript Interfaces
│       └── index.ts
├── prisma/                     # Database Schema (ORM)
│   └── schema.prisma
├── Dockerfile                  # Multi-stage production Docker build
├── docker-compose.yml          # Container orchestration (Next.js + PostgreSQL)
└── package.json
```

---

## 🐳 3. Konfigurasi Docker & Lingkungan Development

Dengan menggunakan Docker, database PostgreSQL dan server Next.js akan terisolasi dengan rapi.

### `Dockerfile`
Gunakan multi-stage build untuk mengoptimalkan ukuran image Next.js di production:

```dockerfile
# Stage 1: Build dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
# Generate prisma client sebelum build
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

### `docker-compose.yml`
Menyediakan Next.js beserta PostgreSQL database secara instan:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: fintrack-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: fintrack_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fintrack-web
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:mysecretpassword@db:5432/fintrack_db?schema=public
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 🤖 4. Arsitektur Prediksi AI (Daily & Monthly)

Sistem AI tidak hanya memprediksi angka acak, melainkan menganalisis pola historis pengguna (misal: pengeluaran hari Jumat-Sabtu selalu naik karena akhir pekan). Kita akan menggunakan **Gemini API** (`@google/generative-ai`) dengan output terstruktur dalam format JSON.

### Prompt Strategi untuk Gemini (Structured JSON)
Saat memanggil API Gemini, instruksikan model untuk merespons dengan JSON schema agar Next.js dapat memproses datanya ke dalam chart (Line Chart/Area Chart).

#### Contoh Model Interface Response AI:
```typescript
interface AIPredictionResponse {
  prediksiHarianEsok: {
    nominal: number;
    alasan: string;
  };
  prediksiBulananDepan: {
    nominal: number;
    kategoriPrediksiTinggi: string; // Kategori yang diprediksi paling boros
    alasan: string;
  };
  rekomendasiHemat: string[]; // Maksimal 3 tips praktis non-templat
  anomaliPengeluaran: string | null; // Deteksi jika ada pengeluaran tidak wajar
}
```

#### Helper Fungsi AI (`src/lib/gemini.ts`):
```typescript
import { GoogleGenAI } from '@google/generative-ai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function dapatkanPrediksiAI(historisPengeluaran: any[]) {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Anda adalah AI Asisten Keuangan Profesional. Tugas Anda adalah menganalisis data riwayat pengeluaran berikut dan memprediksi pengeluaran hari esok dan bulan depan secara akurat.
    
    Data Pengeluaran Historis:
    ${JSON.stringify(historisPengeluaran)}

    Berikan hasil analisis dalam format JSON murni tanpa markdown code block, dengan struktur berikut:
    {
      "prediksiHarianEsok": { "nominal": number, "alasan": string },
      "prediksiBulananDepan": { "nominal": number, "kategoriPrediksiTinggi": string, "alasan": string },
      "rekomendasiHemat": [string, string, string],
      "anomaliPengeluaran": string | null
    }
  `;

  const response = await model.generateContent(prompt);
  return JSON.parse(response.response.text());
}
```

---

## 💎 5. Panduan Desain UI/UX (Clean & Professional Dashboard)

Untuk menghindari tampilan yang terlihat seperti "Template AI murahan", ikuti aturan UI/UX berikut:

1. **Gunakan Layout Grid Bersih**:
   - Bagian kiri atas: Ringkasan saldo, pengeluaran hari ini, pengeluaran bulan ini (dengan angka besar yang tegas, gunakan font *Outfit* atau *Inter*).
   - Bagian kanan atas: Form cepat tambah pengeluaran (kategori, jumlah, catatan ringkas).
   - Bagian bawah/tengah: Grafik tren pengeluaran aktual vs garis putus-putus prediksi AI (Gunakan **Recharts** untuk visualisasi modern).
2. **Hindari Ilustrasi / Icon Chatbot yang Mengganggu**:
   - Jangan gunakan ikon robot 3D generik atau chatbot mengambang.
   - Representasikan AI dengan efek glow ungu/indigo halus (`var(--primary-glow)`) pada tulisan/card rekomendasi.
   - Gunakan ikon SVG fungsional yang tajam dan minimalis (seperti **Lucide React**).
3. **Typography Hierarchy**:
   - Teks penting: SemiBold / Bold, warna putih (`var(--text-primary)`).
   - Teks deskripsi / Label: Regular, warna abu-abu (`var(--text-secondary)`).
   - Nilai mata uang: Format tebal `Rp XX.XXX.XXX`.

---

## 🚀 6. Cara Memulai Langkah Pengembangan

1. **Inisialisasi Project Next.js & Prisma**:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --src-dir --app --import-alias "@/*"
   npm install @prisma/client @google/generative-ai lucide-react recharts swr
   npm install --save-dev prisma
   npx prisma init
   ```

2. **Setup Skema Database (`prisma/schema.prisma`)**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model Expense {
     id          String   @id @default(uuid())
     amount      Float
     category    String
     description String?
     createdAt   DateTime @default(now())
   }
   ```

3. **Jalankan Aplikasi dengan Docker**:
   Buat file `.env` di root directory dan isi `GEMINI_API_KEY` Anda:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeminiKeyHere
   ```
   Lalu jalankan Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
   Lakukan sinkronisasi database:
   ```bash
   npx prisma db push
   ```

---

*Selamat membangun! Dokumentasi ini dirancang agar siap digunakan sebagai panduan langsung dalam penulisan kode.*
