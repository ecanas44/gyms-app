import { supabaseAdmin } from "./supabase/server";

export type WaiverRecord = {
  id: string;
  code: string;
  member_name: string;
  member_email: string;
  signed_at: string;
  status: "Signed" | "Pending" | "Expired";
  created_at: string;
  updated_at: string;
};

export type WaiverPayload = {
  code?: string;
  member_name: string;
  member_email: string;
  signed_at: string;
  status: WaiverRecord["status"];
};

const table = "waivers";

export async function listWaivers(): Promise<WaiverRecord[]> {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
  const { data, error } = await supabaseAdmin.from(table).select("*").order("signed_at", { ascending: false });
  if (error) throw error;
  return data as WaiverRecord[];
}

export async function createWaiver(payload: WaiverPayload): Promise<WaiverRecord> {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
  const code = payload.code ?? `W-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const { data, error } = await supabaseAdmin
    .from(table)
    .insert({ ...payload, code })
    .select()
    .single();
  if (error) throw error;
  return data as WaiverRecord;
}

export async function updateWaiver(id: string, payload: WaiverPayload): Promise<WaiverRecord> {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
  const { data, error } = await supabaseAdmin
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as WaiverRecord;
}

export async function deleteWaiver(id: string): Promise<void> {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw error;
}
