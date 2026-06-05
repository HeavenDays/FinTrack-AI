"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import ImportPDF from "@/components/dashboard/ImportPDF";
import { formatRupiah, formatTanggal, getCategoryColor } from "@/lib/utils";
import { Trash2, Search, Filter } from "lucide-react";
import type { Expense } from "@/types";

export default function PengeluaranPage() {
  const { expenses, isLoading, addExpense, deleteExpense, refresh } = useExpenses();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((exp: Expense) => {
    const matchSearch =
      !search ||
      exp.description?.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || exp.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(expenses.map((e: Expense) => e.category))];

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExpense(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Pengeluaran</h1>
        <p className="page-subtitle">Kelola dan pantau semua pengeluaran Anda</p>
      </div>

      <div className="dashboard-two-col">
        {/* Left: Table */}
        <div>
          {/* Search & Filter Bar */}
          <Card className="mb-5">
            <div className="search-filter-bar">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Cari pengeluaran..."
                  className="input-field pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <select
                  className="input-field pl-9"
                  style={{ minWidth: "180px" }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Expense Table */}
          <Card>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="btn-spinner mx-auto mb-3" style={{ width: 24, height: 24, borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Memuat data...
                </p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {search || filterCategory
                    ? "Tidak ada pengeluaran yang sesuai filter"
                    : "Belum ada data pengeluaran. Tambah pengeluaran pertama Anda!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Kategori</th>
                      <th>Deskripsi</th>
                      <th className="text-right">Jumlah</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense: Expense) => (
                      <tr key={expense.id}>
                        <td>
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {formatTanggal(expense.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: getCategoryColor(expense.category),
                              }}
                            />
                            <span className="text-sm">{expense.category}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {expense.description || "—"}
                          </span>
                        </td>
                        <td className="text-right">
                          <span
                            className="text-sm font-semibold tabular-nums"
                            style={{ color: "var(--danger)" }}
                          >
                            -{formatRupiah(expense.amount)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            isLoading={deletingId === expense.id}
                            aria-label="Hapus"
                          >
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filteredExpenses.length > 0 && (
              <div className="pt-3 mt-3 text-right" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Menampilkan {filteredExpenses.length} dari {expenses.length} data
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Form */}
        <div className="right-panel">
          <ExpenseForm onSubmit={addExpense} />
          <div className="mt-5">
            <ImportPDF onImportSuccess={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}
