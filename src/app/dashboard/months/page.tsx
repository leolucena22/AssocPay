"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthMember {
  name: string;
  type: "regular" | "taxa";
  amount: number;
  status: "pago" | "pendente" | "atrasado";
}

interface MockMonth {
  id: string;
  label: string;
  total: number;
  esperado: number;
  members: MonthMember[];
}

const mockMonths: MockMonth[] = [
  {
    id: "1",
    label: "Pagamentos maio 2026",
    total: 1800,
    esperado: 1800,
    members: [
      { name: "Pessoa 1", type: "taxa", amount: 10, status: "pago" },
      { name: "Pessoa 2", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 3", type: "taxa", amount: 10, status: "pago" },
      { name: "Pessoa 4", type: "regular", amount: 25, status: "atrasado" },
      { name: "Pessoa 5", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 6", type: "regular", amount: 25, status: "atrasado" },
      { name: "Pessoa 7", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 8", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 9", type: "regular", amount: 20, status: "pago" },
    ],
  },
  {
    id: "2",
    label: "Pagamentos abril 2026",
    total: 1400,
    esperado: 1800,
    members: [
      { name: "Pessoa 1", type: "taxa", amount: 10, status: "pago" },
      { name: "Pessoa 2", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 3", type: "taxa", amount: 10, status: "pendente" },
      { name: "Pessoa 4", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 5", type: "regular", amount: 20, status: "pendente" },
      { name: "Pessoa 6", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 7", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 8", type: "regular", amount: 20, status: "pago" },
      { name: "Pessoa 9", type: "regular", amount: 20, status: "pago" },
    ],
  },
];

const statusColors = {
  pago: "text-emerald-500",
  pendente: "text-blue-400",
  atrasado: "text-red-400",
};

const statusLabels = {
  pago: "Pago",
  pendente: "Realizar Pagamento",
  atrasado: "Marcar como pago",
};

export default function MonthsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Meses"
        description="Controle os períodos de cobrança da associação"
      >
        <Link href="/dashboard/months/new">
          <Button size="sm" className="sm:size-default">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Adicionar novo mês</span>
            <span className="sm:hidden">Novo mês</span>
          </Button>
        </Link>
      </PageHeader>

      <div className="space-y-6">
        {mockMonths.map((month) => (
          <Card key={month.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-heading text-base sm:text-lg font-bold">
                  {month.label}
                </CardTitle>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {month.total >= month.esperado ? (
                    <span className="font-semibold text-emerald-500">Meta atingida — R$ {month.total.toFixed(2)}</span>
                  ) : (
                    <>
                      Faltam{" "}
                      <span className="font-semibold text-amber-500">R$ {(month.esperado - month.total).toFixed(2)}</span>
                      {" "}para{" "}
                      <span className="font-semibold text-foreground">R$ {month.esperado.toFixed(2)}</span>
                    </>
                  )}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {month.members.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 py-2.5 px-1"
                  >
                    <span className="text-sm">
                      {member.name}{" "}
                      <span
                        className={cn(
                          "text-xs",
                          member.type === "taxa"
                            ? "text-purple-400"
                            : "text-muted-foreground"
                        )}
                      >
                        ({member.type === "taxa" ? "Taxa" : "Regular"})
                      </span>
                      {member.status === "atrasado" && (
                        <span className="text-xs text-red-400 ml-1">
                          (Atrasado)
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium tabular-nums">
                        R$ {member.amount.toFixed(2)}
                      </span>
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium cursor-pointer transition-colors hover:underline",
                          statusColors[member.status]
                        )}
                      >
                        {statusLabels[member.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
