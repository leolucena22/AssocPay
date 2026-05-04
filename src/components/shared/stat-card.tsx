"use client";

import { ReactNode } from "react";
import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
  children?: ReactNode;
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/10 text-primary",
    trendUp: "text-emerald-500",
    trendDown: "text-red-400",
  },
  success: {
    iconBg: "bg-emerald-500/10 text-emerald-500",
    trendUp: "text-emerald-500",
    trendDown: "text-red-400",
  },
  warning: {
    iconBg: "bg-amber-500/10 text-amber-500",
    trendUp: "text-emerald-500",
    trendDown: "text-red-400",
  },
  danger: {
    iconBg: "bg-red-500/10 text-red-400",
    trendUp: "text-emerald-500",
    trendDown: "text-red-400",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const TrendIcon =
    trend && trend.value > 0
      ? TrendingUp
      : trend && trend.value < 0
        ? TrendingDown
        : Minus;

  const trendColor =
    trend && trend.value > 0
      ? styles.trendUp
      : trend && trend.value < 0
        ? styles.trendDown
        : "text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl font-bold tracking-tight animate-count-up">
            {value}
          </p>
          {trend && (
            <div className={cn("flex items-center gap-1.5 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            styles.iconBg
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
