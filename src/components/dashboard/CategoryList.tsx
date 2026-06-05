"use client";

import Card from "@/components/ui/Card";
import type { CategoryBreakdown } from "@/types";
import { formatRupiah, getCategoryColor } from "@/lib/utils";

interface CategoryListProps {
  data: CategoryBreakdown[];
}

export default function CategoryList({ data }: CategoryListProps) {
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <Card>
      <h3
        className="text-base font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Pengeluaran per Kategori
      </h3>
      <div className="space-y-3">
        {sortedData.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            Belum ada data pengeluaran
          </p>
        )}
        {sortedData.map((item) => (
          <div key={item.category} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: getCategoryColor(item.category) }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.category}
                </span>
              </div>
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {formatRupiah(item.total)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 rounded-full flex-1 overflow-hidden"
                style={{ background: "var(--surface-hover)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    background: getCategoryColor(item.category),
                  }}
                />
              </div>
              <span
                className="text-xs tabular-nums w-10 text-right"
                style={{ color: "var(--text-muted)" }}
              >
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
