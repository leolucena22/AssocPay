import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table-row" | "text" | "avatar" | "stat-card";
  count?: number;
  className?: string;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted",
        className
      )}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-8 w-32" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
        <SkeletonPulse className="h-11 w-11 rounded-lg" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      <SkeletonPulse className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <SkeletonPulse className="h-4 w-40" />
        <SkeletonPulse className="h-3 w-28" />
      </div>
      <SkeletonPulse className="h-6 w-20 rounded-full" />
      <SkeletonPulse className="h-4 w-24" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      </div>
      <SkeletonPulse className="h-20 w-full rounded-lg" />
    </div>
  );
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((i) => {
        switch (variant) {
          case "stat-card":
            return <StatCardSkeleton key={i} />;
          case "table-row":
            return <TableRowSkeleton key={i} />;
          case "card":
            return <CardSkeleton key={i} />;
          case "avatar":
            return <SkeletonPulse key={i} className="h-10 w-10 rounded-full" />;
          case "text":
            return <SkeletonPulse key={i} className="h-4 w-full" />;
          default:
            return <CardSkeleton key={i} />;
        }
      })}
    </div>
  );
}
