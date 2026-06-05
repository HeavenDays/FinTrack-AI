"use client";

import Card from "@/components/ui/Card";
import type { Expense } from "@/types";
import { formatRupiah, formatRelatif, getCategoryColor } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface RecentListProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function RecentList({
  expenses,
  onDelete,
  showDelete = false,
}: RecentListProps) {
  return (
    <Card>
      <h3
        className="text-base font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Pengeluaran Terbaru
      </h3>
      <div className="space-y-1">
        {expenses.length === 0 && (
          <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
            Belum ada data pengeluaran
          </p>
        )}
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg group"
            style={{ transition: "background 0.15s ease" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: getCategoryColor(expense.category) }}
              />
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {expense.description || expense.category}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {expense.category} • {formatRelatif(expense.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: "var(--danger)" }}
              >
                -{formatRupiah(expense.amount)}
              </span>
              {showDelete && onDelete && (
                <button
                  onClick={() => onDelete(expense.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                  style={{ color: "var(--danger)" }}
                  aria-label="Hapus pengeluaran"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
