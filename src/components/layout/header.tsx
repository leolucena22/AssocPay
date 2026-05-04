"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { cn } from "@/lib/utils";

const mockNotifications = [
  {
    id: "1",
    message: "Pessoa 1 enviou comprovante de pagamento (abril 2026)",
    time: "Há 5 min",
    read: false,
  },
  {
    id: "2",
    message: "Pessoa 4 enviou comprovante de pagamento (maio 2026)",
    time: "Há 15 min",
    read: false,
  },
  {
    id: "3",
    message: "Pessoa 2 enviou comprovante de pagamento (abril 2026)",
    time: "Há 1 hora",
    read: false,
  },
  {
    id: "4",
    message: "Novo mês de cobrança (maio 2026) foi criado",
    time: "Há 2 horas",
    read: true,
  },
  {
    id: "5",
    message: "Pessoa 7 enviou comprovante de pagamento (abril 2026)",
    time: "Há 3 horas",
    read: true,
  },
];

export function Header() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-14 items-center justify-end border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 gap-1.5">
      {/* Notifications */}
      <Popover>
        <PopoverTrigger className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-heading text-sm font-bold">Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary font-medium">
                {unreadCount} novas
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {mockNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "px-4 py-3 transition-colors hover:bg-muted/30 cursor-pointer",
                  !notif.read && "bg-primary/[0.03]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className={cn(!notif.read ? "" : "pl-[18px]")}>
                    <p className="text-sm leading-snug">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-2.5">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
              Marcar todas como lidas
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Settings */}
      <Link href="/dashboard/settings">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-[18px] w-[18px]" />
        </Button>
      </Link>
    </header>
  );
}
