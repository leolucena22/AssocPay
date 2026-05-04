"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CheckCircle, Users, CalendarRange, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const cards = [
  {
    title: "Confirmar pagamentos",
    subtitle: "(7 em aguardo)",
    icon: CheckCircle,
    href: "/dashboard/payments",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Lista de associados",
    subtitle: "",
    icon: Users,
    href: "/dashboard/members",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Gerenciar meses",
    subtitle: "",
    icon: CalendarRange,
    href: "/dashboard/months",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel do Coordenador"
        description="Gerencie pagamentos, associados e meses de cobrança"
      />

      {/* Main Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex flex-col items-center text-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                  card.bgColor
                )}
              >
                <card.icon className={cn("h-8 w-8", card.color)} />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">{card.title}</h2>
                {card.subtitle && (
                  <p className="text-sm text-amber-500 font-medium mt-1">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Add Month Card */}
      <Link
        href="/dashboard/months/new"
        className="group flex items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card/50 p-10 transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.02]"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
          <Plus className="h-7 w-7" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
            Adicionar novo mês
          </h3>
          <p className="text-sm text-muted-foreground">
            Criar um novo período de cobrança
          </p>
        </div>
      </Link>
    </div>
  );
}
