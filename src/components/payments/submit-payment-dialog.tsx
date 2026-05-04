"use client";

import { useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberType: "regular" | "taxa";
  monthLabel: string;
  amount: number;
  isLate: boolean;
  lateFee: number;
}

export function SubmitPaymentDialog({
  open,
  onOpenChange,
  memberName,
  memberType,
  monthLabel,
  amount,
  isLate,
  lateFee,
}: SubmitPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalDue = amount + (isLate ? lateFee : 0);
  const typeLabel = memberType === "taxa" ? "Taxa" : "Regular";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFile(null);
      onOpenChange(false);
    }, 1500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const title = isLate
    ? `Confirmar pagamento (${typeLabel}) Atrasado R$ ${amount} + ${lateFee}`
    : `Confirmar pagamento (${typeLabel}) R$${amount}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">
            {title}
          </DialogTitle>
          <DialogDescription>{monthLabel}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Comprovante Upload */}
          <div className="space-y-2">
            <Label>Envie o comprovante de pagamento</Label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-muted/30",
                file && "border-emerald-500/30 bg-emerald-500/5"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Arraste ou clique para enviar
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Imagens ou PDF
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Valor a pagar (read-only) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Valor a pagar</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-lg font-heading font-bold">
                R$ {totalDue.toFixed(2)}
              </p>
              {isLate && (
                <p className="text-xs text-red-400 mt-0.5">
                  R$ {amount.toFixed(2)} + R$ {lateFee.toFixed(2)} (taxa de atraso)
                </p>
              )}
            </div>
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label htmlFor="obs">Observação</Label>
            <Input id="obs" placeholder="Observação opcional..." className="h-10" />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
