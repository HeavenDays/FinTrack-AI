// FinTrack AI - TypeScript Type Definitions

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  amount: number;
  category: string;
  description?: string;
  createdAt?: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeFormData {
  amount: number;
  source: string;
  description?: string;
  createdAt?: string;
}

// ===== Emergency Fund =====
export interface EmergencyFund {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal";
  description: string | null;
  createdAt: string;
}

export interface EmergencyFundFormData {
  amount: number;
  type: "deposit" | "withdrawal";
  description?: string;
}

export interface EmergencyFundStats {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  monthlyDeposit: number;
  targetAmount: number;
  progressPercent: number;
}

// ===== Learning Notes =====
export interface LearningNote {
  id: string;
  title: string;
  content: string;
  topic: string;
  status: "in-progress" | "completed" | "review";
  createdAt: string;
  updatedAt: string;
}

export interface LearningNoteFormData {
  title: string;
  content: string;
  topic: string;
  status?: string;
}

export interface AILearningSuggestion {
  ringkasan: string;
  pencapaian: string[];
  saranBelajar: string[];
  targetMingguIni: string;
  motivasi: string;
}

// ===== AI Prediction =====
export interface AIPredictionResponse {
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
  isSimulated?: boolean;
  simulationReason?: string;
}

export interface DashboardStats {
  todayTotal: number;
  monthTotal: number;
  avgDaily: number;
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdown[];
  recentExpenses: Expense[];
  weeklyTrend: WeeklyTrendItem[];
  // Income & Balance
  monthIncome: number;
  todayIncome: number;
  totalIncomes: number;
  balance: number;
  balanceStatus: "surplus" | "defisit" | "impas";
  // Emergency Fund
  emergencyFundBalance: number;
  emergencyFundMonthDeposit: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export interface WeeklyTrendItem {
  date: string;
  total: number;
}

export const EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Kesehatan",
  "Pendidikan",
  "Tagihan & Utilitas",
  "Lainnya",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const INCOME_SOURCES = [
  "Gaji",
  "Freelance",
  "Bisnis",
  "Investasi",
  "Hadiah",
  "Transfer Masuk",
  "Lainnya",
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];

export const LEARNING_TOPICS = [
  "Programming",
  "Data Engineering",
  "Machine Learning",
  "DevOps & Cloud",
  "Database",
  "Frontend",
  "Backend",
  "Networking",
  "Cybersecurity",
  "Soft Skills",
  "Bahasa",
  "Lainnya",
] as const;

export type LearningTopic = (typeof LEARNING_TOPICS)[number];

// ===== Stock Market =====
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap?: number;
  currency: string;
}

export interface StockAnalysis {
  ringkasanPasar: string;
  sentimen: "bullish" | "bearish" | "netral";
  rekomendasiReksaDana: string;
  analisaIndeks: string;
  tipsInvestasi: string[];
}
