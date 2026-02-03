import { supabaseAdmin } from "./supabase/server";

export type CheckinSource = "Member" | "WaiverOnly";

export type CheckinRecord = {
  id: string;
  member_id: string | null;
  waiver_id: string;
  source: CheckinSource;
  checked_in_at: string;
  created_at: string;
};

export type CheckinPayload = {
  member_id?: string | null;
  waiver_id: string;
  checked_in_at?: string;
};

const table = "check_ins";

function ensureAdmin() {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
}

export async function listCheckins(): Promise<CheckinRecord[]> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!
    .from(table)
    .select("*")
    .order("checked_in_at", { ascending: false });
  if (error) throw error;
  return data as CheckinRecord[];
}

export async function createCheckin(payload: CheckinPayload): Promise<CheckinRecord> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!
    .from(table)
    .insert({
      waiver_id: payload.waiver_id,
      member_id: payload.member_id ?? null,
      checked_in_at: payload.checked_in_at,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CheckinRecord;
}

export async function deleteCheckin(id: string): Promise<void> {
  ensureAdmin();
  const { error } = await supabaseAdmin!.from(table).delete().eq("id", id);
  if (error) throw error;
}
