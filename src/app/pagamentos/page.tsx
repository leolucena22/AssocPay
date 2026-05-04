"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitPaymentDialog } from "@/components/payments/submit-payment-dialog";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMember {
  id: string;
  name: string;
  type: "regular" | "taxa";
  status: "pago" | "pendente";
  amount: number;
  isLate: boolean;
  lateFee: number;
}

interface MonthData {
  id: string;
  label: string;
  total: number;
  esperado: number;
  members: PaymentMember[];
}

const mockData: MonthData[] = [
  {
    id: "2",
    label: "Pagamentos maio 2026",
    total: 1800,
    esperado: 1800,
    members: [
      { id: "1", name: "Pessoa 1", type: "taxa", status: "pago", amount: 10, isLate: false, lateFee: 0 },
      { id: "2", name: "Pessoa 2", type: "regular", status: "pago", amount: 20, isLate: false, lateFee: 0 },
      { id: "3", name: "Pessoa 3", type: "taxa", status: "pago", amount: 10, isLate: false, lateFee: 0 },
      { id: "4", name: "Pessoa 4", type: "regular", status: "pendente", amount: 20, isLate: true, lateFee: 5 },
      { id: "5", name: "Pessoa 5", type: "regular", status: "pago", amount: 20, isLate: false, lateFee: 0 },
      { id: "6", name: "Pessoa 6", type: "regular", status: "pendente", amount: 20, isLate: true, lateFee: 5 },
      { id: "7", name: "Pessoa 7", type: "regular", status: "pago", amount: 20, isLate: false, lateFee: 0 },
      { id: "8", name: "Pessoa 8", type: "regular", status: "pago", amount: 20, isLate: false, lateFee: 0 },
      { id: "9", name: "Pessoa 9", type: "regular", status: "pago", amount: 20, isLate: false, lateFee: 0 },
    ],
  },
  {
    id: "1",
    label: "Pagamentos abril 2026",
    total: 1400,
    esperado: 1800,
    members: [
      { id: "1", name: "Pessoa 1", type: "taxa", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "2", name: "Pessoa 2", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "3", name: "Pessoa 3", type: "taxa", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "4", name: "Pessoa 4", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "5", name: "Pessoa 5", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "6", name: "Pessoa 6", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "7", name: "Pessoa 7", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "8", name: "Pessoa 8", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
      { id: "9", name: "Pessoa 9", type: "regular", status: "pendente", amount: 28, isLate: false, lateFee: 0 },
    ],
  },
];

const MEMBERS_PER_PAGE = 5;

function MonthCard({
  month,
  filteredMembers,
  onSelectPayment,
}: {
  month: MonthData;
  filteredMembers: PaymentMember[];
  onSelectPayment: (member: PaymentMember, monthLabel: string) => void;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE);
  const paginated = filteredMembers.slice(
    (page - 1) * MEMBERS_PER_PAGE,
    page * MEMBERS_PER_PAGE
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-base sm:text-lg font-bold">
          {month.label}
        </CardTitle>

        {/* Progress block */}
        <div className="mt-3 rounded-lg bg-muted/40 border border-border p-4">
          {month.total >= month.esperado ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-500">Meta atingida!</p>
                <p className="text-xs text-muted-foreground">Total arrecadado: R$ {month.total.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">Faltam</p>
                  <p className="text-xl sm:text-2xl font-heading font-extrabold text-amber-500 tabular-nums">
                    R$ {(month.esperado - month.total).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Meta</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    R$ {month.esperado.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min((month.total / month.esperado) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                {Math.round((month.total / month.esperado) * 100)}% arrecadado
              </p>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {paginated.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-2 py-2.5 px-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm truncate">
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
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium tabular-nums">
                  R$ {member.isLate ? (member.amount + member.lateFee).toFixed(2) : member.amount.toFixed(2)}
                  {member.isLate && (
                    <span className="text-xs text-red-400 ml-1">(+taxa)</span>
                  )}
                </span>
                {member.status === "pago" ? (
                  <span className="text-xs sm:text-sm font-medium text-emerald-500">
                    Pago
                  </span>
                ) : (
                  <Button
                    variant="link"
                    className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 p-0 h-auto shrink-0"
                    onClick={() => onSelectPayment(member, month.label)}
                  >
                    <span className="hidden sm:inline">Realizar Pagamento</span>
                    <span className="sm:hidden">Pagar</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground">
              {page} de {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PagamentosPage() {
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<{
    member: PaymentMember;
    monthLabel: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 text-base"
        />
      </div>

      {/* Month cards */}
      <div className="space-y-6">
        {mockData.map((month) => {
          const filteredMembers = month.members.filter((m) =>
            m.name.toLowerCase().includes(search.toLowerCase())
          );
          if (search && filteredMembers.length === 0) return null;
          return (
            <MonthCard
              key={month.id}
              month={month}
              filteredMembers={filteredMembers}
              onSelectPayment={(member, monthLabel) =>
                setSelectedPayment({ member, monthLabel })
              }
            />
          );
        })}
      </div>

      {/* Submit Payment Dialog */}
      <SubmitPaymentDialog
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
        memberName={selectedPayment?.member.name ?? ""}
        memberType={selectedPayment?.member.type ?? "regular"}
        monthLabel={selectedPayment?.monthLabel ?? ""}
        amount={selectedPayment?.member.amount ?? 0}
        isLate={selectedPayment?.member.isLate ?? false}
        lateFee={selectedPayment?.member.lateFee ?? 0}
      />
    </div>
  );
}
