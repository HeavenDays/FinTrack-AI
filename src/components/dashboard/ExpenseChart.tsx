"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import type { WeeklyTrendItem } from "@/types";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";

interface ExpenseChartProps {
  data: WeeklyTrendItem[];
  title?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="px-4 py-3 rounded-xl text-sm"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </p>
      <p className="font-bold" style={{ color: "var(--primary)" }}>
        {formatRupiah(payload[0].value)}
      </p>
    </div>
  );
}

export default function ExpenseChart({
  data,
  title = "Tren Pengeluaran 7 Hari Terakhir",
}: ExpenseChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        label: formatTanggalPendek(item.date),
      })),
    [data]
  );

  return (
    <Card className="col-span-full">
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span
            className="w-3 h-0.5 rounded"
            style={{ background: "var(--primary)" }}
          />
          Pengeluaran Aktual
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(31, 41, 55, 0.5)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "rgba(31, 41, 55, 0.5)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}jt`
                  : v >= 1000
                    ? `${(v / 1000).toFixed(0)}rb`
                    : `${v}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#colorTotal)"
              dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
              activeDot={{
                fill: "#6366f1",
                stroke: "rgba(99, 102, 241, 0.3)",
                strokeWidth: 6,
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
