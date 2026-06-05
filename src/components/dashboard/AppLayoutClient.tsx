"use client";

import { useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/dashboard/Sidebar";
import MoneyMatrixBackground from "@/components/ui/MoneyMatrixBackground";
import { Sun, Moon } from "lucide-react";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-layout">
      {/* Matrix falling money background */}
      <MoneyMatrixBackground theme={theme} />
      
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Theme Toggle Button - Floating Top Right */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
          cursor: "pointer",
        }}
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-amber-400 animate-pulse" />
        ) : (
          <Moon size={20} className="text-indigo-600" />
        )}
      </button>
      
      {/* Page Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
