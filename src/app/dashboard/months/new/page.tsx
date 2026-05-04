"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Calculator } from "lucide-react";
import Link from "next/link";

export default function NewMonthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [valorRegular, setValorRegular] = useState(20);
  const [valorTaxa, setValorTaxa] = useState(10);
  const [taxaAtraso, setTaxaAtraso] = useState(5);

  // Mock active members count
  const totalAtivos = 36;
  const regulares = 22;
  const taxa = 8;

  const totalRegular = regulares * valorRegular;
  const totalTaxa = taxa * valorTaxa;
  const totalEsperado = totalRegular + totalTaxa;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard/months");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/months">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Adicionar novo mês de pagamento"
          description="Configure o período de cobrança"
        />
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-base font-bold">
                Associados ativos {totalAtivos}
              </CardTitle>
              <CardDescription>
                Associados regulares {regulares} · Associados taxa {taxa}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mês/Ano */}
            <div className="space-y-2">
              <Label htmlFor="month-ref">Mês e ano referente</Label>
              <Input id="month-ref" type="month" required className="h-10 max-w-xs" />
            </div>

            <Separator />

            {/* Valor Regular */}
            <div className="space-y-2">
              <Label htmlFor="valor-regular">Valor regular</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="valor-regular"
                  type="number"
                  step="0.01"
                  value={valorRegular}
                  onChange={(e) => setValorRegular(Number(e.target.value))}
                  required
                  className="h-10 max-w-[200px]"
                />
                <span className="text-sm text-muted-foreground">
                  total{" "}
                  <span className="font-semibold text-foreground">
                    {totalRegular}
                  </span>
                </span>
              </div>
            </div>

            {/* Valor Taxa */}
            <div className="space-y-2">
              <Label htmlFor="valor-taxa">Valor de taxa</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="valor-taxa"
                  type="number"
                  step="0.01"
                  value={valorTaxa}
                  onChange={(e) => setValorTaxa(Number(e.target.value))}
                  required
                  className="h-10 max-w-[200px]"
                />
                <span className="text-sm text-muted-foreground">
                  total{" "}
                  <span className="font-semibold text-foreground">
                    {totalTaxa}
                  </span>
                </span>
              </div>
            </div>

            {/* Taxa de atraso */}
            <div className="space-y-2">
              <Label htmlFor="taxa-atraso">Valor da taxa de atraso</Label>
              <Input
                id="taxa-atraso"
                type="number"
                step="0.01"
                value={taxaAtraso}
                onChange={(e) => setTaxaAtraso(Number(e.target.value))}
                required
                className="h-10 max-w-[200px]"
              />
            </div>

            <Separator />

            {/* Total Esperado */}
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">Total esperado</p>
              <p className="text-2xl font-heading font-bold text-primary">
                R$ {totalEsperado.toFixed(2)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adicionando...</>
                ) : (
                  "Adicionar"
                )}
              </Button>
              <Link href="/dashboard/months">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
