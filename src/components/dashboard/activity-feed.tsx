import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  UserPlus,
  UserMinus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: "1",
    type: "payment" as const,
    description: "Maria Silva efetuou pagamento de R$ 150,00",
    time: "Há 2 min",
  },
  {
    id: "2",
    type: "member_join" as const,
    description: "Pedro Costa se cadastrou como novo membro",
    time: "Há 15 min",
  },
  {
    id: "3",
    type: "payment_overdue" as const,
    description: "Pagamento de Carlos Pereira está atrasado",
    time: "Há 1 hora",
  },
  {
    id: "4",
    type: "payment" as const,
    description: "Ana Oliveira efetuou pagamento de R$ 150,00",
    time: "Há 2 horas",
  },
  {
    id: "5",
    type: "member_leave" as const,
    description: "Roberto Alves foi desativado",
    time: "Há 3 horas",
  },
  {
    id: "6",
    type: "payment" as const,
    description: "Fernanda Lima efetuou pagamento de R$ 150,00",
    time: "Há 5 horas",
  },
];

const typeConfig = {
  payment: {
    icon: CreditCard,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  member_join: {
    icon: UserPlus,
    color: "text-blue-500 bg-blue-500/10",
  },
  member_leave: {
    icon: UserMinus,
    color: "text-muted-foreground bg-muted",
  },
  payment_overdue: {
    icon: AlertCircle,
    color: "text-red-400 bg-red-500/10",
  },
};

export function ActivityFeed() {
  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-bold">
          Atividade Recente
        </CardTitle>
        <CardDescription>Eventos da sua associação</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
