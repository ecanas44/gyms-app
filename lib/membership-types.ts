import { supabaseAdmin } from "./supabase/server";

export type MembershipTypeRecord = {
  id: string;
  name: string;
  price_monthly: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MembershipTypePayload = {
  name: string;
  price_monthly?: number | null;
  is_active?: boolean;
};

const table = "membership_types";

function ensureAdmin() {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
}

async function ensureUniqueName(name: string, excludeId?: string) {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!
    .from(table)
    .select("id")
    .filter("name", "ilike", name);
  if (error) throw error;
  const collision = data?.find((row) => row.id !== excludeId);
  if (collision) throw new Error("Membership type name must be unique.");
}

export async function listMembershipTypes(): Promise<MembershipTypeRecord[]> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!
    .from(table)
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return data as MembershipTypeRecord[];
}

export async function createMembershipType(
  payload: MembershipTypePayload,
): Promise<MembershipTypeRecord> {
  ensureAdmin();
  const name = payload.name.trim();
  if (!name) throw new Error("Membership type name is required.");
  await ensureUniqueName(name);
  const { data, error } = await supabaseAdmin!
    .from(table)
    .insert({
      name,
      price_monthly: payload.price_monthly ?? null,
      is_active: payload.is_active ?? true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as MembershipTypeRecord;
}

export async function updateMembershipType(
  id: string,
  payload: MembershipTypePayload,
): Promise<MembershipTypeRecord> {
  ensureAdmin();
  const name = payload.name.trim();
  if (!name) throw new Error("Membership type name is required.");
  await ensureUniqueName(name, id);
  const { data, error } = await supabaseAdmin!
    .from(table)
    .update({
      name,
      price_monthly: payload.price_monthly ?? null,
      is_active: payload.is_active ?? true,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as MembershipTypeRecord;
}

export async function deleteMembershipType(id: string): Promise<void> {
  ensureAdmin();
  const { count, error: countError } = await supabaseAdmin!
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("membership_type_id", id);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error("Cannot delete a membership type while members are assigned to it.");
  }
  const { error } = await supabaseAdmin!.from(table).delete().eq("id", id);
  if (error) throw error;
}
