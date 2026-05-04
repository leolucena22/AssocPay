"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Member, MemberStatus } from "@/app/types";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMembers = useCallback(async (status?: MemberStatus) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("members").select("*").order("full_name");
      if (status) query = query.eq("status", status);
      const { data, error: err } = await query;
      if (err) throw err;
      setMembers((data as Member[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = async (member: Omit<Member, "id" | "created_at" | "updated_at">) => {
    const { data, error: err } = await supabase
      .from("members")
      .insert(member)
      .select()
      .single();
    if (err) throw err;
    setMembers((prev) => [...prev, data as Member]);
    return data as Member;
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const { data, error: err } = await supabase
      .from("members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (err) throw err;
    setMembers((prev) => prev.map((m) => (m.id === id ? (data as Member) : m)));
    return data as Member;
  };

  const deleteMember = async (id: string) => {
    const { error: err } = await supabase.from("members").delete().eq("id", id);
    if (err) throw err;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, error, fetchMembers, createMember, updateMember, deleteMember };
}
