"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Copy, ExternalLink, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const publicUrl = "https://assocpay.app/pagamentos/abc123";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da associação e do sistema"
      />

      <Tabs defaultValue="association" className="space-y-6">
        <TabsList>
          <TabsTrigger value="association">Associação</TabsTrigger>
          <TabsTrigger value="billing">Cobrança</TabsTrigger>
          <TabsTrigger value="link">Link Público</TabsTrigger>
          <TabsTrigger value="account">Minha Conta</TabsTrigger>
        </TabsList>

        {/* ── Associação ── */}
        <TabsContent value="association" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold">
                Informações da Associação
              </CardTitle>
              <CardDescription>
                Dados que aparecem para os associados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assoc-name">Nome da Associação</Label>
                <Input
                  id="assoc-name"
                  defaultValue="Associação Exemplo"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assoc-desc">Descrição</Label>
                <Textarea
                  id="assoc-desc"
                  defaultValue="Associação de moradores do bairro..."
                  rows={3}
                />
              </div>
              <Separator />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cobrança ── */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold">
                Valores Padrão
              </CardTitle>
              <CardDescription>
                Valores pré-preenchidos ao criar um novo mês de cobrança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="default-regular">
                    Valor regular padrão (R$)
                  </Label>
                  <Input
                    id="default-regular"
                    type="number"
                    step="0.01"
                    defaultValue="20.00"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-taxa">Valor taxa padrão (R$)</Label>
                  <Input
                    id="default-taxa"
                    type="number"
                    step="0.01"
                    defaultValue="10.00"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-late">
                    Taxa de atraso padrão (R$)
                  </Label>
                  <Input
                    id="default-late"
                    type="number"
                    step="0.01"
                    defaultValue="5.00"
                    className="h-10"
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="due-day">
                  Dia limite para considerar atraso
                </Label>
                <Input
                  id="due-day"
                  type="number"
                  min="1"
                  max="28"
                  defaultValue="10"
                  className="h-10 max-w-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Pagamentos após este dia do mês terão a taxa de atraso aplicada
                </p>
              </div>
              <Separator />
              <Card className="bg-muted/30 border-border">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Criar meses automaticamente
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Todo mês um novo período de cobrança é criado
                        automaticamente
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </CardContent>
              </Card>
              <Separator />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Link Público ── */}
        <TabsContent value="link" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold">
                Link Público de Pagamentos
              </CardTitle>
              <CardDescription>
                Compartilhe este link com os associados para que possam enviar
                comprovantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="h-10 bg-muted/30 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => navigator.clipboard.writeText(publicUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <a
                  href="/pagamentos"
                  target="_blank"
                  className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Os associados podem acessar este link sem precisar fazer login
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Minha Conta ── */}
        <TabsContent value="account" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold">
                Dados do Coordenador
              </CardTitle>
              <CardDescription>
                Gerencie suas credenciais de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Nome</Label>
                  <Input
                    id="admin-name"
                    defaultValue="Coordenador"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">E-mail</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    defaultValue="admin@assocpay.com"
                    className="h-10"
                  />
                </div>
              </div>
              <Separator />
              <h4 className="text-sm font-semibold">Alterar Senha</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="h-10"
                  />
                </div>
              </div>
              <Separator />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Conta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-bold text-red-400">
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Resetar todos os dados</p>
                  <p className="text-xs text-muted-foreground">
                    Apaga todos os pagamentos, meses e associados. Irreversível.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  Resetar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
