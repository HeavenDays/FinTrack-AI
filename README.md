# 💰 FinTrack AI

**Sistem Manajemen Keuangan Pribadi dengan Prediksi AI**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)

FinTrack AI adalah aplikasi manajemen keuangan pribadi full-stack yang ditenagai oleh kecerdasan buatan. Dibangun dengan **Next.js 16 App Router**, aplikasi ini membantu pengguna melacak pemasukan & pengeluaran, memprediksi pola keuangan, serta memberikan rekomendasi hemat secara cerdas.

---

## 📸 Preview

![FinTrack AI Dashboard](docs/dashboard-preview.png)

---

## ✨ Fitur Utama

- 📊 **Dashboard Interaktif** — Ringkasan saldo, pengeluaran harian/bulanan, rata-rata harian, dan grafik tren 7 hari
- 💸 **Manajemen Pengeluaran** — CRUD pengeluaran dengan kategori, deskripsi, dan filter tanggal
- 💰 **Manajemen Pemasukan** — Pencatatan pemasukan dari berbagai sumber dengan riwayat lengkap
- 🛡️ **Dana Darurat** — Pengelolaan dana darurat dengan sistem deposit & penarikan
- 🤖 **Prediksi AI** — Analisis pola pengeluaran dan prediksi harian/bulanan menggunakan AI
- 📈 **Analisis & Laporan** — Visualisasi data dengan chart interaktif dan ekspor laporan PDF
- 📄 **Import PDF** — Impor data pengeluaran dari file PDF secara otomatis
- 🌗 **Dark / Light Mode** — Tema gelap & terang dengan transisi halus
- 📱 **PWA Ready** — Dapat diinstal sebagai aplikasi di perangkat mobile
- 🎨 **Money Matrix Background** — Efek visual premium dengan animasi simbol mata uang

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16.2.6** — Framework React full-stack dengan App Router
- **React 19.2.4** — Library UI komponen deklaratif
- **TypeScript 5** — Static typing untuk JavaScript
- **Tailwind CSS 4** — Utility-first CSS framework
- **Recharts 3.8.1** — Library chart untuk visualisasi data keuangan
- **Lucide React 1.17.0** — Icon library modern dan minimalis
- **SWR 2.4.1** — Data fetching & caching

### Backend

- **Next.js API Routes** — REST API endpoint (App Router `route.ts`)
- **Prisma ORM 7.8.0** — Database ORM dengan type-safe queries
- **PostgreSQL 15** — Relational database untuk penyimpanan data
- **OpenRouter API** — AI provider untuk prediksi keuangan (Qwen model)
- **pdf-parse 2.4.5** — Parser PDF untuk fitur import pengeluaran
- **jsPDF 4.2.1** — Generator laporan PDF

### DevOps

- **Docker** — Containerization dengan multi-stage build
- **Docker Compose** — Orchestrasi Next.js + PostgreSQL
- **ESLint** — Linting & code quality

---

## 🏗️ Arsitektur Aplikasi

```mermaid
graph TB
    subgraph Client ["Frontend - React 19 + Next.js 16"]
        A[Dashboard]
        B[Pengeluaran]
        C[Pemasukan]
        D[Dana Darurat]
        E[Analisis AI]
    end

    subgraph API ["API Routes - Next.js App Router"]
        G["/api/expenses"]
        H["/api/incomes"]
        I["/api/emergency-fund"]
        J["/api/predict"]
        K["/api/expenses/stats"]
        L["/api/expenses/import-pdf"]
    end

    subgraph Services ["Services"]
        N["Prisma ORM"]
        O["OpenRouter AI"]
        P["PDF Parser"]
        Q["PDF Generator"]
    end

    subgraph DB ["Database"]
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

    N --> R
```

### Alur Data

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Route
    participant DB as PostgreSQL
    participant AI as OpenRouter AI

    Note over U, AI: Pencatatan Pengeluaran
    U->>FE: Input pengeluaran
    FE->>API: POST /api/expenses
    API->>DB: Prisma create
    DB-->>API: Created
    API-->>FE: Response JSON
    FE-->>U: Dashboard diperbarui

    Note over U, AI: Prediksi AI
    U->>FE: Buka Analisis AI
    FE->>API: GET /api/predict
    API->>DB: Fetch 90 hari data
    DB-->>API: Expense history
    API->>AI: Prompt + data historis
    AI-->>API: JSON prediksi
    API-->>FE: Prediksi + rekomendasi
    FE-->>U: Tampilkan hasil analisis
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
│   │   ├── catatan/page.tsx         # Halaman catatan
│   │   ├── saham/page.tsx           # Halaman analisis saham
│   │   └── api/                     # REST API endpoints
│   │       ├── expenses/route.ts
│   │       ├── expenses/stats/route.ts
│   │       ├── expenses/import-pdf/route.ts
│   │       ├── incomes/route.ts
│   │       ├── emergency-fund/route.ts
│   │       ├── predict/route.ts
│   │       ├── notes/route.ts
│   │       └── stocks/route.ts
│   ├── components/
│   │   ├── ui/                      # Button, Card, Input, Select
│   │   ├── dashboard/               # StatCard, Chart, Sidebar, dll
│   │   └── ai/                      # PredictionCard
│   ├── hooks/useExpenses.ts         # Custom hooks (SWR)
│   ├── lib/
│   │   ├── db.ts                    # Prisma client
│   │   ├── gemini.ts                # OpenRouter AI integration
│   │   ├── pdfExport.ts             # PDF report generator
│   │   └── utils.ts                 # Formatter & helpers
│   ├── context/ThemeContext.tsx      # Dark/Light mode
│   └── types/index.ts               # TypeScript interfaces
├── prisma/schema.prisma             # Database schema
├── public/
│   ├── manifest.json                # PWA manifest
│   └── sw.js                        # Service worker
├── Dockerfile                       # Multi-stage build
├── docker-compose.yml               # Next.js + PostgreSQL
└── package.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js >= 18
- PostgreSQL >= 15 (atau Docker)
- API Key dari [OpenRouter](https://openrouter.ai/)

### 1. Clone & Install

```bash
git clone https://github.com/HeavenDays/FinTrack-AI.git
cd FinTrack-AI
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root:

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/fintrack_db?schema=public"
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000

---

### 🐳 Docker

```bash
# Buat .env dengan OPENROUTER_API_KEY
docker-compose up --build -d
npx prisma db push
```

---

## 📊 Database Schema

Aplikasi menggunakan 4 model utama:

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
- **Rekomendasi Hemat** — 3 tips praktis berdasarkan data nyata
- **Deteksi Anomali** — Peringatan jika ada pengeluaran tidak wajar

