"use client";

import { useState } from "react";
import { useIncomes } from "@/hooks/useExpenses";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import IncomeForm from "@/components/dashboard/IncomeForm";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Trash2, Search, Filter, Wallet } from "lucide-react";
import type { Income } from "@/types";

const sourceColors: Record<string, string> = {
  Gaji: "#10b981",
  Freelance: "#6366f1",
  Bisnis: "#f59e0b",
  Investasi: "#3b82f6",
  Hadiah: "#ec4899",
  "Transfer Masuk": "#8b5cf6",
  Lainnya: "#6b7280",
};

export default function PemasukanPage() {
  const { incomes, isLoading, addIncome, deleteIncome } = useIncomes();
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredIncomes = incomes.filter((inc: Income) => {
    const matchSearch =
      !search ||
      inc.description?.toLowerCase().includes(search.toLowerCase()) ||
      inc.source.toLowerCase().includes(search.toLowerCase());
    const matchSource = !filterSource || inc.source === filterSource;
    return matchSearch && matchSource;
  });

  const sources = [...new Set(incomes.map((i: Income) => i.source))];

  const totalFiltered = filteredIncomes.reduce((sum: number, i: Income) => sum + i.amount, 0);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteIncome(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Pemasukan</h1>
        <p className="page-subtitle">Kelola dan pantau semua sumber pemasukan Anda</p>
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
                  placeholder="Cari pemasukan..."
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
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                >
                  <option value="">Semua Sumber</option>
                  {sources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Summary Banner */}
          {filteredIncomes.length > 0 && (
            <Card className="mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ background: "rgba(16, 185, 129, 0.1)" }}
                >
                  <Wallet size={20} style={{ color: "#10b981" }} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Total Pemasukan {filterSource ? `(${filterSource})` : "(Ditampilkan)"}
                  </p>
                  <p className="text-xl font-bold" style={{ color: "#10b981" }}>
                    +{formatRupiah(totalFiltered)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Income Table */}
          <Card>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="btn-spinner mx-auto mb-3" style={{ width: 24, height: 24, borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Memuat data...
                </p>
              </div>
            ) : filteredIncomes.length === 0 ? (
              <div className="empty-state">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {search || filterSource
                    ? "Tidak ada pemasukan yang sesuai filter"
                    : "Belum ada data pemasukan. Tambah pemasukan pertama Anda!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Sumber</th>
                      <th>Deskripsi</th>
                      <th className="text-right">Jumlah</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncomes.map((income: Income) => (
                      <tr key={income.id}>
                        <td>
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {formatTanggal(income.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: sourceColors[income.source] || "#6b7280",
                              }}
                            />
                            <span className="text-sm">{income.source}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {income.description || "—"}
                          </span>
                        </td>
                        <td className="text-right">
                          <span
                            className="text-sm font-semibold tabular-nums"
                            style={{ color: "#10b981" }}
                          >
                            +{formatRupiah(income.amount)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(income.id)}
                            isLoading={deletingId === income.id}
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
            {filteredIncomes.length > 0 && (
              <div className="pt-3 mt-3 text-right" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Menampilkan {filteredIncomes.length} dari {incomes.length} data
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Form */}
        <div className="right-panel">
          <IncomeForm onSubmit={addIncome} />
        </div>
      </div>
    </div>
  );
}
