"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar className="h-screen" />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="lg:hidden fixed top-3 left-3 z-50">
          <SheetTrigger className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border bg-background/90 backdrop-blur-md shadow-lg text-foreground hover:bg-muted transition-colors">
              <Menu className="h-5 w-5" />
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
          <span className="sr-only">Menu de navegação</span>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
