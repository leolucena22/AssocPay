import { Badge } from "@/components/ui/badge";
import type { MemberStatus } from "@/app/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<MemberStatus, { label: string; className: string }> = {
  ativo: {
    label: "Ativo",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  inativo: {
    label: "Inativo",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
