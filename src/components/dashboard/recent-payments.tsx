import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import type { PaymentStatus } from "@/app/types";

const mockPayments = [
  {
    id: "1",
    member: "Maria Silva",
    email: "maria@email.com",
    amount: 150,
    status: "pago" as PaymentStatus,
    date: "04/05/2026",
  },
  {
    id: "2",
    member: "João Santos",
    email: "joao@email.com",
    amount: 150,
    status: "pendente" as PaymentStatus,
    date: "03/05/2026",
  },
  {
    id: "3",
    member: "Ana Oliveira",
    email: "ana@email.com",
    amount: 150,
    status: "pago" as PaymentStatus,
    date: "02/05/2026",
  },
  {
    id: "4",
    member: "Carlos Pereira",
    email: "carlos@email.com",
    amount: 150,
    status: "atrasado" as PaymentStatus,
    date: "28/04/2026",
  },
  {
    id: "5",
    member: "Fernanda Lima",
    email: "fernanda@email.com",
    amount: 150,
    status: "pago" as PaymentStatus,
    date: "01/05/2026",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function RecentPayments() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-bold">
          Pagamentos Recentes
        </CardTitle>
        <CardDescription>Últimas transações registradas</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {mockPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {getInitials(payment.member)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {payment.member}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {payment.email}
                </p>
              </div>
              <PaymentStatusBadge status={payment.status} />
              <div className="text-right">
                <p className="text-sm font-semibold">
                  R$ {payment.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{payment.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
