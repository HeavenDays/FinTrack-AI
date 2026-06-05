import { NextResponse } from "next/server";
import type { StockQuote } from "@/types";

// Indonesian blue-chip stocks commonly found in reksa dana portfolios
const TRACKED_STOCKS = [
  { symbol: "^JKSE", name: "IHSG (Indeks Harga Saham Gabungan)" },
  { symbol: "BBCA.JK", name: "Bank Central Asia" },
  { symbol: "BBRI.JK", name: "Bank Rakyat Indonesia" },
  { symbol: "BMRI.JK", name: "Bank Mandiri" },
  { symbol: "TLKM.JK", name: "Telkom Indonesia" },
  { symbol: "ASII.JK", name: "Astra International" },
  { symbol: "UNVR.JK", name: "Unilever Indonesia" },
  { symbol: "GOTO.JK", name: "GoTo Gojek Tokopedia" },
];

async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) return null;

    const stockInfo = TRACKED_STOCKS.find((s) => s.symbol === symbol);
    const price = meta.regularMarketPrice ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: symbol.replace(".JK", ""),
      name: stockInfo?.name || meta.shortName || symbol,
      price,
      change,
      changePercent,
      previousClose,
      open: meta.regularMarketOpen ?? 0,
      dayHigh: meta.regularMarketDayHigh ?? meta.dayHigh ?? 0,
      dayLow: meta.regularMarketDayLow ?? meta.dayLow ?? 0,
      volume: meta.regularMarketVolume ?? 0,
      marketCap: undefined,
      currency: meta.currency || "IDR",
    };
  } catch (err) {
    console.error(`Error fetching ${symbol}:`, err);
    return null;
  }
}

// GET /api/stocks - Fetch all tracked stock quotes
export async function GET() {
  try {
    const results = await Promise.allSettled(
      TRACKED_STOCKS.map((s) => fetchYahooQuote(s.symbol))
    );

    const stocks: StockQuote[] = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((q): q is StockQuote => q !== null);

    if (stocks.length === 0) {
      // Return simulated data if Yahoo API is unreachable
      return NextResponse.json({
        stocks: TRACKED_STOCKS.map((s) => ({
          symbol: s.symbol.replace(".JK", "").replace("^", ""),
          name: s.name,
          price: 0,
          change: 0,
          changePercent: 0,
          previousClose: 0,
          open: 0,
          dayHigh: 0,
          dayLow: 0,
          volume: 0,
          currency: "IDR",
        })),
        isSimulated: true,
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      stocks,
      isSimulated: false,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data saham" },
      { status: 500 }
    );
  }
}
