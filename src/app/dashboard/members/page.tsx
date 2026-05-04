"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberStatusBadge } from "@/components/members/member-status-badge";
import { MemberTypeBadge } from "@/components/members/member-type-badge";
import { MemberFormDialog } from "@/components/members/member-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Filter } from "lucide-react";
import type { Member } from "@/app/types";

const mockMembers: Member[] = [
  { id: "1", full_name: "Pessoa Muito Legal da Silva", institution: "UFPE", type: "regular", status: "ativo", created_at: "2025-01-15" },
  { id: "2", full_name: "João Santos Pereira", institution: "UNICAP", type: "regular", status: "ativo", created_at: "2025-02-20" },
  { id: "3", full_name: "Ana Carolina Oliveira", institution: "UFPE", type: "taxa", status: "ativo", created_at: "2025-03-10" },
  { id: "4", full_name: "Carlos Eduardo Pereira", institution: "UPE", type: "regular", status: "inativo", created_at: "2024-06-05" },
  { id: "5", full_name: "Fernanda Lima Costa", institution: "UFPE", type: "taxa", status: "ativo", created_at: "2025-04-01" },
  { id: "6", full_name: "Pedro Henrique Costa", institution: "UNICAP", type: "regular", status: "ativo", created_at: "2026-05-01" },
  { id: "7", full_name: "Juliana Souza Martins", institution: "UPE", type: "regular", status: "ativo", created_at: "2025-07-12" },
  { id: "8", full_name: "Roberto Carlos Alves", institution: "UFPE", type: "taxa", status: "inativo", created_at: "2024-09-20" },
];

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = mockMembers.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Lista de Associados" description="Gerencie os associados da sua associação">
        <Button onClick={() => setDialogOpen(true)} size="sm" className="sm:size-default">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Adicionar associado</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 max-w-sm"
        />
      </div>

      {/* Mobile: Card list */}
      <div className="space-y-3 sm:hidden">
        {filtered.map((member) => (
          <Card key={member.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{member.institution}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MemberTypeBadge type={member.type} />
                    <MemberStatusBadge status={member.status} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table */}
      <Card className="border-border hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Instituição</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <TableRow key={member.id} className="group transition-colors">
                    <TableCell className="text-sm font-medium">
                      {member.full_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.institution}
                    </TableCell>
                    <TableCell>
                      <MemberTypeBadge type={member.type} />
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge status={member.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Filter className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum associado encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center sm:hidden">
          <Filter className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum associado encontrado</p>
        </div>
      )}

      <MemberFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
