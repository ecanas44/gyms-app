import { supabaseAdmin } from "./supabase/server";

export type MemberMembershipType = {
  id: string;
  name: string;
  price_monthly: number | null;
  is_active: boolean;
};

export type MemberRecord = {
  id: string;
  waiver_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  membership_type_id: string;
  membership_type: MemberMembershipType | null;
  start_date: string;
  punches_remaining: number | null;
  created_at: string;
  updated_at: string;
};

export type MemberPayload = {
  waiver_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  membership_type_id: string;
  start_date: string;
  punches_remaining?: number | null;
};

const table = "members";

function ensureAdmin() {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
}

export async function listMembers(): Promise<MemberRecord[]> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!
    .from(table)
    .select(
      "*, membership_type:membership_types!members_membership_type_id_fkey(id, name, price_monthly, is_active)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as MemberRecord[];
}

export async function createMember(payload: MemberPayload): Promise<MemberRecord> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!.from(table).insert(payload).select().single();
  if (error) throw error;
  return data as MemberRecord;
}

export async function updateMember(id: string, payload: Partial<MemberPayload>): Promise<MemberRecord> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!.from(table).update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as MemberRecord;
}

export async function deleteMember(id: string): Promise<void> {
  ensureAdmin();
  const { error } = await supabaseAdmin!.from(table).delete().eq("id", id);
  if (error) throw error;
}
