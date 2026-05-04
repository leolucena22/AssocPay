"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberFormDialog({ open, onOpenChange }: MemberFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onOpenChange(false); }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold">
            Adicionar associado
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo associado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="member-name">Nome</Label>
            <Input id="member-name" placeholder="Nome completo" required className="h-10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-institution">Instituição</Label>
            <Input id="member-institution" placeholder="Ex: UFPE, UNICAP..." className="h-10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-type">Tipo</Label>
            <Select defaultValue="regular">
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="taxa">Taxa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
