<![CDATA[<div align="center">

# 💰 FinTrack AI

### Sistem Manajemen Keuangan Pribadi dengan Prediksi AI

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**FinTrack AI** adalah aplikasi manajemen keuangan pribadi full-stack yang ditenagai oleh kecerdasan buatan. Dibangun dengan arsitektur modern menggunakan **Next.js 16 App Router**, aplikasi ini membantu pengguna melacak pemasukan & pengeluaran, memprediksi pola keuangan, serta memberikan rekomendasi hemat secara cerdas.

</div>

---

## 📸 Preview

<div align="center">

![FinTrack AI Dashboard](docs/dashboard-preview.png)

</div>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📊 **Dashboard Interaktif** | Ringkasan saldo, pengeluaran harian/bulanan, rata-rata harian, dan grafik tren 7 hari terakhir |
| 💸 **Manajemen Pengeluaran** | CRUD pengeluaran lengkap dengan kategori, deskripsi, dan filter tanggal |
| 💰 **Manajemen Pemasukan** | Pencatatan pemasukan dari berbagai sumber dengan riwayat lengkap |
| 🛡️ **Dana Darurat** | Fitur pengelolaan dana darurat dengan sistem deposit & penarikan |
| 🤖 **Prediksi AI** | Analisis pola pengeluaran dan prediksi harian/bulanan menggunakan AI (OpenRouter API) |
| 📈 **Analisis & Laporan** | Visualisasi data keuangan dengan chart interaktif (Recharts) dan ekspor laporan PDF |
| 📄 **Import PDF** | Impor data pengeluaran dari file PDF secara otomatis |
| 🌗 **Dark / Light Mode** | Tema gelap & terang dengan transisi halus |
| 📱 **PWA Ready** | Dapat diinstal sebagai aplikasi di perangkat mobile |
| 🎨 **Money Matrix Background** | Efek visual premium dengan animasi simbol mata uang |

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| **Next.js** | 16.2.6 | Framework React full-stack dengan App Router |
| **React** | 19.2.4 | Library UI komponen deklaratif |
| **TypeScript** | 5.x | Static typing untuk JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Recharts** | 3.8.1 | Library chart untuk visualisasi data keuangan |
| **Lucide React** | 1.17.0 | Icon library modern dan minimalis |
| **SWR** | 2.4.1 | Data fetching & caching |

### Backend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| **Next.js API Routes** | 16.2.6 | REST API endpoint (App Router `route.ts`) |
| **Prisma ORM** | 7.8.0 | Database ORM dengan type-safe queries |
| **PostgreSQL** | 15 | Relational database untuk penyimpanan data |
| **OpenRouter API** | — | AI provider untuk prediksi keuangan (Qwen model) |
| **pdf-parse** | 2.4.5 | Parser PDF untuk fitur import pengeluaran |
| **jsPDF** | 4.2.1 | Generator laporan PDF |

### DevOps & Tooling
| Teknologi | Kegunaan |
|---|---|
| **Docker** | Containerization dengan multi-stage build |
| **Docker Compose** | Orchestrasi Next.js + PostgreSQL |
| **ESLint** | Linting & code quality |
| **PostCSS** | CSS processing pipeline |

---

## 🏗️ Arsitektur & Alur Aplikasi

```mermaid
graph TB
    subgraph Client ["🖥️ Frontend (React 19 + Next.js 16)"]
        A["Dashboard Page"]
        B["Pengeluaran Page"]
        C["Pemasukan Page"]
        D["Dana Darurat Page"]
        E["Analisis AI Page"]
        F["Sidebar Navigation"]
    end

    subgraph API ["⚡ API Routes (Next.js App Router)"]
        G["/api/expenses"]
        H["/api/incomes"]
        I["/api/emergency-fund"]
        J["/api/predict"]
        K["/api/expenses/stats"]
        L["/api/expenses/import-pdf"]
        M["/api/stocks"]
    end

    subgraph Services ["🧠 Services"]
        N["Prisma ORM Client"]
        O["OpenRouter AI (Qwen Model)"]
        P["PDF Parser"]
        Q["PDF Generator (jsPDF)"]
    end

    subgraph DB ["🗄️ Database"]
        R[("PostgreSQL 15")]
    end

    A --> G & K & J
    B --> G & L
    C --> H
    D --> I
    E --> J & K & Q

    G --> N
    H --> N
    I --> N
    K --> N
    L --> P --> N
    J --> O
    M --> O

    N --> R
```

### Alur Data

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant API as ⚡ API Route
    participant DB as 🗄️ PostgreSQL
    participant AI as 🤖 OpenRouter AI

    Note over U, AI: Alur Pencatatan Pengeluaran
    U->>FE: Input pengeluaran (jumlah, kategori, deskripsi)
    FE->>API: POST /api/expenses
    API->>DB: Prisma create expense
    DB-->>API: Expense created
    API-->>FE: Response JSON
    FE->>FE: SWR mutate (refresh cache)
    FE-->>U: Dashboard diperbarui

    Note over U, AI: Alur Prediksi AI
    U->>FE: Buka Dashboard / Analisis AI
    FE->>API: GET /api/predict
    API->>DB: Fetch 90 hari data pengeluaran
    DB-->>API: Expense history
    API->>AI: Kirim prompt + data historis
    AI-->>API: JSON prediksi (harian, bulanan, rekomendasi)
    API-->>FE: AIPredictionResponse
    FE-->>U: Tampilkan prediksi & rekomendasi hemat
```

---

## 📂 Struktur Proyek

```
FinTrack-AI/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout + providers
│   │   ├── page.tsx                 # Dashboard utama
│   │   ├── pengeluaran/page.tsx     # Halaman pengeluaran
│   │   ├── pemasukan/page.tsx       # Halaman pemasukan
│   │   ├── dana-darurat/page.tsx    # Halaman dana darurat
│   │   ├── analisis/page.tsx        # Halaman analisis AI
│   │   ├── catatan/page.tsx         # Halaman catatan belajar
│   │   ├── saham/page.tsx           # Halaman analisis saham
│   │   └── api/                     # REST API endpoints
│   │       ├── expenses/
│   │       │   ├── route.ts         # GET, POST, DELETE pengeluaran
│   │       │   ├── stats/route.ts   # Statistik dashboard
│   │       │   └── import-pdf/route.ts
│   │       ├── incomes/route.ts     # CRUD pemasukan
│   │       ├── emergency-fund/route.ts
│   │       ├── predict/route.ts     # Endpoint prediksi AI
│   │       ├── notes/               # CRUD catatan
│   │       └── stocks/              # Analisis saham
│   ├── components/
│   │   ├── ui/                      # Komponen UI dasar
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── MoneyMatrixBackground.tsx
│   │   ├── dashboard/               # Komponen dashboard
│   │   │   ├── StatCard.tsx
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── ExpenseChart.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── RecentList.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   └── ai/
│   │       └── PredictionCard.tsx    # Widget prediksi AI
│   ├── hooks/
│   │   └── useExpenses.ts           # Custom hooks (SWR)
│   ├── lib/
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── gemini.ts                # OpenRouter AI integration
│   │   ├── pdfExport.ts             # PDF report generator
│   │   └── utils.ts                 # Formatter & helpers
│   ├── context/
│   │   └── ThemeContext.tsx          # Dark/Light mode provider
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── prisma/
│   └── schema.prisma                # Database schema (4 models)
├── public/
│   ├── manifest.json                # PWA manifest
│   └── sw.js                        # Service worker
├── Dockerfile                       # Multi-stage production build
├── docker-compose.yml               # Next.js + PostgreSQL
├── package.json
└── tsconfig.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** >= 18.x
- **PostgreSQL** >= 15 (atau gunakan Docker)
- **API Key** dari [OpenRouter](https://openrouter.ai/) untuk fitur AI

### 1. Clone Repository

```bash
git clone https://github.com/HeavenDays/FinTrack-AI.git
cd FinTrack-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/fintrack_db?schema=public"

# AI Provider
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

### 🐳 Menjalankan dengan Docker

```bash
# Buat file .env dengan OPENROUTER_API_KEY
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" > .env

# Jalankan dengan Docker Compose
docker-compose up --build -d

# Push schema ke database container
npx prisma db push
```

Aplikasi berjalan di `http://localhost:3000` dengan PostgreSQL di port `5432`.

---

## 📊 Database Schema

Aplikasi menggunakan **4 model** utama di PostgreSQL melalui Prisma ORM:

```mermaid
erDiagram
    Expense {
        String id PK
        Float amount
        String category
        String description
        DateTime createdAt
        DateTime updatedAt
    }

    Income {
        String id PK
        Float amount
        String source
        String description
        DateTime createdAt
        DateTime updatedAt
    }

    EmergencyFund {
        String id PK
        Float amount
        String type
        String description
        DateTime createdAt
    }

    LearningNote {
        String id PK
        String title
        String content
        String topic
        String status
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## 🤖 Integrasi AI

FinTrack AI menggunakan **OpenRouter API** dengan model **Qwen** untuk:

- **Prediksi Harian** — Estimasi pengeluaran hari esok berdasarkan pola historis
- **Prediksi Bulanan** — Proyeksi pengeluaran bulan depan
- **Deteksi Kategori Boros** — Identifikasi kategori pengeluaran tertinggi
- **Rekomendasi Hemat** — 3 tips praktis berdasarkan data nyata pengguna
- **Deteksi Anomali** — Peringatan jika ada pengeluaran tidak wajar

```typescript
// Contoh response AI
interface AIPredictionResponse {
  prediksiHarianEsok: {
    nominal: number;
    alasan: string;
  };
  prediksiBulananDepan: {
    nominal: number;
    kategoriPrediksiTinggi: string;
    alasan: string;
  };
  rekomendasiHemat: string[];
  anomaliPengeluaran: string | null;
}
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan edukasi dan pengembangan pribadi.

---

<div align="center">

Dibuat dengan ❤️ menggunakan **Next.js 16**, **React 19**, **Prisma 7**, dan **AI**

</div>
]]>
