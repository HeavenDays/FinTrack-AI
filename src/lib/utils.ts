/**
 * Format number to Indonesian Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale (e.g. "28 Mei 2026")
 */
export function formatTanggal(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Format date to short format (e.g. "28 Mei")
 */
export function formatTanggalPendek(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

/**
 * Format relative time (e.g. "2 jam lalu", "Kemarin")
 */
export function formatRelatif(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatTanggal(dateStr);
}

/**
 * Get category icon name (Lucide icon names)
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Makanan & Minuman": "UtensilsCrossed",
    Transportasi: "Car",
    Belanja: "ShoppingBag",
    Hiburan: "Clapperboard",
    Kesehatan: "HeartPulse",
    Pendidikan: "GraduationCap",
    "Tagihan & Utilitas": "Zap",
    Lainnya: "MoreHorizontal",
  };
  return icons[category] || "Circle";
}

/**
 * Get category color class
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Makanan & Minuman": "#f97316",
    Transportasi: "#3b82f6",
    Belanja: "#ec4899",
    Hiburan: "#a855f7",
    Kesehatan: "#10b981",
    Pendidikan: "#6366f1",
    "Tagihan & Utilitas": "#f59e0b",
    Lainnya: "#6b7280",
  };
  return colors[category] || "#6b7280";
}

/**
 * Calculate percentage change between two values
 */
export function hitungPerubahan(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
