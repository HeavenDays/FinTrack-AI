"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Receipt, Shield, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pemasukan", label: "Pemasukan", icon: Wallet },
  { href: "/pengeluaran", label: "Pengeluaran", icon: Receipt },
  { href: "/dana-darurat", label: "Dana Darurat", icon: Shield },
  { href: "/analisis", label: "Analisis AI", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-5 py-6 mb-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all group-hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
            }}
          >
            FT
          </div>
          <div>
            <p
              className="text-sm font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              FinTrack
            </p>
            <p
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "var(--primary)" }}
            >
              AI
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
    </aside>
  );
}
