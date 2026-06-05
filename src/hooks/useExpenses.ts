import useSWR, { mutate as globalMutate } from "swr";
import type {
  Expense, ExpenseFormData,
  Income, IncomeFormData,
  DashboardStats, AIPredictionResponse,
  EmergencyFund, EmergencyFundFormData, EmergencyFundStats,
  LearningNote, LearningNoteFormData, AILearningSuggestion,
  StockQuote, StockAnalysis,
} from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Hook untuk mengambil dan mengelola data pengeluaran
 */
export function useExpenses() {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    "/api/expenses",
    fetcher
  );

  const addExpense = async (formData: ExpenseFormData) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Gagal menambah pengeluaran");

    const newExpense = await res.json();
    mutate();
    globalMutate("/api/expenses/stats");
    return newExpense;
  };

  const deleteExpense = async (id: string) => {
    const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus pengeluaran");
    mutate();
    globalMutate("/api/expenses/stats");
  };

  return {
    expenses: data || [],
    isLoading,
    isError: error,
    addExpense,
    deleteExpense,
    refresh: mutate,
  };
}

/**
 * Hook untuk mengambil dan mengelola data pemasukan
 */
export function useIncomes() {
  const { data, error, isLoading, mutate } = useSWR<Income[]>(
    "/api/incomes",
    fetcher
  );

  const addIncome = async (formData: IncomeFormData) => {
    const res = await fetch("/api/incomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Gagal menambah pemasukan");
    const newIncome = await res.json();
    mutate();
    globalMutate("/api/expenses/stats");
    return newIncome;
  };

  const deleteIncome = async (id: string) => {
    const res = await fetch(`/api/incomes?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus pemasukan");
    mutate();
    globalMutate("/api/expenses/stats");
  };

  return {
    incomes: data || [],
    isLoading,
    isError: error,
    addIncome,
    deleteIncome,
    refresh: mutate,
  };
}

/**
 * Hook untuk statistik dashboard
 */
export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    "/api/expenses/stats",
    fetcher,
    { refreshInterval: 30000 }
  );
  return { stats: data, isLoading, isError: error };
}

/**
 * Hook untuk prediksi AI keuangan
 */
export function useAIPrediction() {
  const { data, error, isLoading, mutate } = useSWR<AIPredictionResponse>(
    "/api/predict",
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { prediction: data, isLoading, isError: error, refreshPrediction: () => mutate() };
}

/**
 * Hook untuk dana darurat
 */
export function useEmergencyFund() {
  const { data, error, isLoading, mutate } = useSWR<{
    transactions: EmergencyFund[];
    stats: EmergencyFundStats;
  }>("/api/emergency-fund", fetcher);

  const addTransaction = async (formData: EmergencyFundFormData) => {
    const res = await fetch("/api/emergency-fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Gagal menyimpan transaksi");
    mutate();
    globalMutate("/api/expenses/stats");
    return res.json();
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(`/api/emergency-fund?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus transaksi");
    mutate();
    globalMutate("/api/expenses/stats");
  };

  return {
    transactions: data?.transactions || [],
    stats: data?.stats,
    isLoading,
    isError: error,
    addTransaction,
    deleteTransaction,
    refresh: mutate,
  };
}

/**
 * Hook untuk catatan belajar
 */
export function useLearningNotes() {
  const { data, error, isLoading, mutate } = useSWR<LearningNote[]>(
    "/api/notes",
    fetcher
  );

  const addNote = async (formData: LearningNoteFormData) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Gagal menyimpan catatan");
    mutate();
    globalMutate("/api/notes/suggest");
    return res.json();
  };

  const updateNote = async (id: string, updates: Partial<LearningNoteFormData>) => {
    const res = await fetch(`/api/notes?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Gagal memperbarui catatan");
    mutate();
    globalMutate("/api/notes/suggest");
    return res.json();
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus catatan");
    mutate();
    globalMutate("/api/notes/suggest");
  };

  return {
    notes: data || [],
    isLoading,
    isError: error,
    addNote,
    updateNote,
    deleteNote,
    refresh: mutate,
  };
}

/**
 * Hook untuk saran AI belajar
 */
export function useLearningSuggestions() {
  const { data, error, isLoading, mutate } = useSWR<AILearningSuggestion>(
    "/api/notes/suggest",
    fetcher,
    { revalidateOnFocus: false }
  );
  return { suggestions: data, isLoading, isError: error, refresh: mutate };
}

/**
 * Hook untuk data saham Indonesia
 */
export function useStocks() {
  const { data, error, isLoading, mutate } = useSWR<{
    stocks: StockQuote[];
    isSimulated: boolean;
    lastUpdated: string;
  }>("/api/stocks", fetcher, { refreshInterval: 300000 }); // refresh every 5 min
  return {
    stocks: data?.stocks || [],
    isSimulated: data?.isSimulated ?? false,
    lastUpdated: data?.lastUpdated,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook untuk analisis AI saham
 */
export function useStockAnalysis(stocks: StockQuote[]) {
  const shouldFetch = stocks.length > 0;
  const { data, error, isLoading, mutate } = useSWR<StockAnalysis>(
    shouldFetch ? "/api/stocks/analyze" : null,
    async (url: string) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      return res.json();
    },
    { revalidateOnFocus: false }
  );
  return { analysis: data, isLoading, isError: error, refresh: mutate };
}
