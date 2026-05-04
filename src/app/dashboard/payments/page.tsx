"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PendingPaymentCard } from "@/components/payments/pending-payment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const mockPendingPayments = [
  { id: "1", memberName: "Pessoa 1", memberType: "taxa" as const, monthLabel: "abril 2026", amount: "R$ 28,00" },
  { id: "2", memberName: "Pessoa 2", memberType: "regular" as const, monthLabel: "abril 2026", amount: "R$ 28,00" },
  { id: "3", memberName: "Pessoa 3", memberType: "regular" as const, monthLabel: "maio 2026", amount: "R$ 20,00" },
  { id: "4", memberName: "Pessoa 4", memberType: "taxa" as const, monthLabel: "maio 2026", amount: "R$ 10,00" },
  { id: "5", memberName: "Pessoa 5", memberType: "regular" as const, monthLabel: "abril 2026", amount: "R$ 28,00" },
  { id: "6", memberName: "Pessoa 6", memberType: "regular" as const, monthLabel: "maio 2026", amount: "R$ 20,00" },
  { id: "7", memberName: "Pessoa 7", memberType: "regular" as const, monthLabel: "maio 2026", amount: "R$ 20,00" },
  { id: "8", memberName: "Pessoa 8", memberType: "taxa" as const, monthLabel: "abril 2026", amount: "R$ 10,00" },
  { id: "9", memberName: "Pessoa 9", memberType: "regular" as const, monthLabel: "maio 2026", amount: "R$ 20,00" },
  { id: "10", memberName: "Pessoa 10", memberType: "regular" as const, monthLabel: "abril 2026", amount: "R$ 28,00" },
  { id: "11", memberName: "Pessoa 11", memberType: "regular" as const, monthLabel: "maio 2026", amount: "R$ 20,00" },
  { id: "12", memberName: "Pessoa 12", memberType: "taxa" as const, monthLabel: "abril 2026", amount: "R$ 10,00" },
];

const ITEMS_PER_PAGE = 6;

export default function PaymentsPage() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(mockPendingPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = mockPendingPayments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagamentos pendentes"
        description={`${mockPendingPayments.length} pagamentos aguardando confirmação`}
      />

      {mockPendingPayments.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Tudo em dia!"
          description="Não há pagamentos pendentes para confirmar"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {paginatedPayments.map((p) => (
              <PendingPaymentCard
                key={p.id}
                memberName={p.memberName}
                memberType={p.memberType}
                monthLabel={p.monthLabel}
                amount={p.amount}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
