"use client";

import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glowing?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  glowing = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`glass-card p-5 ${glowing ? "card-glow" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
