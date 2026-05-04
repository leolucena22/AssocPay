"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Payment, PaymentStatus } from "@/app/types";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPayments = useCallback(async (status?: PaymentStatus) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("payments")
        .select("*, member:members(id, full_name, email, avatar_url)")
        .order("due_date", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error: err } = await query;
      if (err) throw err;
      setPayments((data as Payment[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = async (payment: Omit<Payment, "id" | "member" | "created_at" | "updated_at">) => {
    const { data, error: err } = await supabase
      .from("payments")
      .insert(payment)
      .select("*, member:members(id, full_name, email, avatar_url)")
      .single();
    if (err) throw err;
    setPayments((prev) => [data as Payment, ...prev]);
    return data as Payment;
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    const { data, error: err } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id)
      .select("*, member:members(id, full_name, email, avatar_url)")
      .single();
    if (err) throw err;
    setPayments((prev) => prev.map((p) => (p.id === id ? (data as Payment) : p)));
    return data as Payment;
  };

  const deletePayment = async (id: string) => {
    const { error: err } = await supabase.from("payments").delete().eq("id", id);
    if (err) throw err;
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, fetchPayments, createPayment, updatePayment, deletePayment };
}
