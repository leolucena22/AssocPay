"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingPaymentCardProps {
  memberName: string;
  memberType: "taxa" | "regular";
  monthLabel: string;
  amount: string;
  onConfirm?: () => void;
  onDeny?: () => void;
}

export function PendingPaymentCard({
  memberName,
  memberType,
  monthLabel,
  amount,
  onConfirm,
  onDeny,
}: PendingPaymentCardProps) {
  return (
    <Card className="border-border transition-all hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold">
              {memberName}{" "}
              <span
                className={cn(
                  "text-sm font-medium",
                  memberType === "taxa" ? "text-purple-400" : "text-blue-400"
                )}
              >
                ({memberType})
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
          </div>
          <span className="text-lg font-bold font-heading">{amount}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Download comprovante */}
        <Button variant="outline" className="w-full justify-center gap-2">
          <Download className="h-4 w-4" />
          Baixar comprovante
        </Button>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle className="h-4 w-4" />
            Confirmar
          </Button>
          <Button
            variant="outline"
            onClick={onDeny}
            className="flex-1 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <XCircle className="h-4 w-4" />
            Negar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
