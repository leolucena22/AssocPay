"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentFormDialog({ open, onOpenChange }: PaymentFormDialogProps) {
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
          <DialogTitle className="font-heading text-xl font-bold">Nova Cobrança</DialogTitle>
          <DialogDescription>Registre uma nova cobrança para um membro</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pay-member">Membro</Label>
            <Select><SelectTrigger className="h-10"><SelectValue placeholder="Selecione o membro" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Maria Silva</SelectItem>
                <SelectItem value="2">João Santos</SelectItem>
                <SelectItem value="3">Ana Oliveira</SelectItem>
                <SelectItem value="4">Carlos Pereira</SelectItem>
                <SelectItem value="5">Fernanda Lima</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-desc">Descrição</Label>
            <Input id="pay-desc" placeholder="Ex: Mensalidade Maio/2026" required className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Valor (R$)</Label>
              <Input id="pay-amount" type="number" step="0.01" placeholder="0,00" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-due">Vencimento</Label>
              <Input id="pay-due" type="date" required className="h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-method">Método de Pagamento</Label>
            <Select><SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-notes">Observações</Label>
            <Textarea id="pay-notes" placeholder="Observações opcionais..." rows={3} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Registrar Cobrança"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
