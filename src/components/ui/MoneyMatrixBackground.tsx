"use client";

import { useEffect, useRef } from "react";

interface MoneyMatrixBackgroundProps {
  theme: "dark" | "light";
}

export default function MoneyMatrixBackground({ theme }: MoneyMatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 18; // Slower = more readable symbols
    const interval = 1000 / fps;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix configuration
    const moneySymbols = [
      "Rp", "$", "€", "¥", "£", "₿", "¢", "₩", "₹", "₱", "฿", "Ξ",
      "100", "500", "1K", "10K", "50K", "1M", "IDR", "USD",
      "0", "1", "💰", "🪙", "📈"
    ];
    const fontSize = 18;
    let columns = Math.floor(canvas.width / (fontSize + 2));
    let drops: number[] = [];

    // Initialize drops at random positions for instant coverage
    const initDrops = () => {
      columns = Math.floor(canvas.width / (fontSize + 2));
      drops = Array(columns)
        .fill(0)
        .map(() => Math.floor(Math.random() * (canvas.height / fontSize)));
    };
    initDrops();

    const handleResize = () => {
      resizeCanvas();
      initDrops();
    };
    window.addEventListener("resize", handleResize);

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      // Throttle to target FPS for smoother, more readable rain
      const delta = timestamp - lastTime;
      if (delta < interval) return;
      lastTime = timestamp - (delta % interval);

      // Fade trail — lower alpha = longer tails
      ctx.fillStyle =
        theme === "dark"
          ? "rgba(9, 13, 22, 0.06)"
          : "rgba(248, 250, 252, 0.07)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = "center";

      for (let i = 0; i < drops.length; i++) {
        const symbol =
          moneySymbols[Math.floor(Math.random() * moneySymbols.length)];
        const x = i * (fontSize + 2) + fontSize / 2;
        const y = drops[i] * fontSize;

        if (theme === "dark") {
          // Leading character: bright white/green flash
          const rand = Math.random();
          if (rand > 0.92) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 12;
          } else if (rand > 0.45) {
            ctx.fillStyle = "#10b981"; // Emerald green (classic matrix)
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = "#6366f1"; // Indigo accent
            ctx.shadowColor = "#6366f1";
            ctx.shadowBlur = 6;
          }
        } else {
          // Light mode: use indigo tones
          const rand = Math.random();
          if (rand > 0.9) {
            ctx.fillStyle = "#4f46e5";
            ctx.shadowColor = "#4f46e5";
            ctx.shadowBlur = 8;
          } else if (rand > 0.4) {
            ctx.fillStyle = "#6366f1";
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = "#a5b4fc";
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        }

        ctx.fillText(symbol, x, y);

        // Reset shadow after drawing
        ctx.shadowBlur = 0;

        // Reset drop when it passes the bottom
        if (y > canvas.height && Math.random() > 0.96) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: theme === "dark" ? 0.35 : 0.25,
      }}
    />
  );
}
