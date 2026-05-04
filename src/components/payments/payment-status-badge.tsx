import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/app/types";

const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pago: {
    label: "Pago",
    className:
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  pendente: {
    label: "Pendente",
    className:
      "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
  },
  atrasado: {
    label: "Atrasado",
    className:
      "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
  },
  cancelado: {
    label: "Cancelado",
    className:
      "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
  negado: {
    label: "Negado",
    className:
      "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20",
  },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
