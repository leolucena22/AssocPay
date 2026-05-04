// ═══════════════════════════════
// AssocPay — Domain Types
// ═══════════════════════════════

export type MemberType = "regular" | "taxa";
export type MemberStatus = "ativo" | "inativo";
export type PaymentStatus = "pago" | "pendente" | "atrasado" | "negado" | "cancelado";

export interface Member {
  id: string;
  full_name: string;
  institution: string;
  type: MemberType;
  status: MemberStatus;
  created_at: string;
}

export interface BillingMonth {
  id: string;
  month: number;
  year: number;
  label: string; // "maio 2026"
  valor_regular: number;
  valor_taxa: number;
  taxa_atraso: number;
  total_esperado: number;
  total_arrecadado: number;
  created_at: string;
}

export interface Payment {
  id: string;
  billing_month_id: string;
  member_id: string;
  member?: Member;
  billing_month?: BillingMonth;
  amount_due: number;
  amount_paid?: number;
  status: PaymentStatus;
  comprovante_url?: string;
  observacao?: string;
  paid_at?: string;
  reviewed_at?: string;
  is_late: boolean;
}

export interface PaymentWithDetails extends Payment {
  member: Member;
  billing_month: BillingMonth;
}
