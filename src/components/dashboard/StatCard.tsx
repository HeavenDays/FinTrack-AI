"use client";

import Card from "@/components/ui/Card";
import { formatRupiah } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CalendarDays,
  Activity,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  icon: "today" | "month" | "average";
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: StatCardProps) {
  const iconMap = {
    today: Calendar,
    month: CalendarDays,
    average: Activity,
  };

  const Icon = iconMap[icon];

  const getTrendColor = () => {
    if (!trend || trend === 0) return "var(--text-muted)";
    // For expenses, negative trend (spending less) is good
    return trend < 0 ? "var(--success)" : "var(--danger)";
  };

  const TrendIcon = !trend || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "var(--primary-glow)" }}
        >
          <Icon size={20} style={{ color: "var(--primary)" }} />
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{
              color: getTrendColor(),
              background:
                trend === 0
                  ? "rgba(107, 114, 128, 0.1)"
                  : trend < 0
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
            }}
          >
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p
        className="text-xs font-medium mb-1 uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>
      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {formatRupiah(value)}
      </p>
      {subtitle && (
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}
