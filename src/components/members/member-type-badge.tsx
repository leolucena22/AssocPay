import { Badge } from "@/components/ui/badge";
import type { MemberType } from "@/app/types";
import { cn } from "@/lib/utils";

const typeConfig: Record<MemberType, { label: string; className: string }> = {
  regular: {
    label: "Regular",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  taxa: {
    label: "Taxa",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
};

export function MemberTypeBadge({ type }: { type: MemberType }) {
  const config = typeConfig[type];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
