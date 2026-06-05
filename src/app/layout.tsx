import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayoutClient from "@/components/dashboard/AppLayoutClient";
import PWARegister from "@/components/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
  themeColor: "#090d16",
};

export const metadata: Metadata = {
  title: "FinTrack AI - Manajemen Keuangan Cerdas",
  description:
    "Sistem pelacak pemasukan & pengeluaran harian dengan prediksi AI untuk membantu Anda mengelola keuangan secara lebih cerdas dan efisien.",
  keywords: ["pengeluaran", "pemasukan", "keuangan", "AI", "prediksi", "fintrack"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinTrack AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full transition-colors duration-300">
        <ThemeProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
        <PWARegister />
      </body>
    </html>
  );
}
