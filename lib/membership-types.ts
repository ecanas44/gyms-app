import { supabaseAdmin } from "./supabase/server";

export type MembershipTypeRecord = {
  id: string;
  name: string;
  price_monthly: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members_count?: number;
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

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function normalizePrice(price: number | null | undefined): number | null {
  if (price == null) return null;
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price must be a non-negative number");
  }
  return Number(price.toFixed(2));
}

function toFriendlyError(error: unknown, fallback: string): Error {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23505") return new Error("A membership type with that name already exists.");
  return new Error(maybe?.message || fallback);
}

async function memberUsageCount(membershipTypeId: string): Promise<number> {
  ensureAdmin();
  const { count, error } = await supabaseAdmin!
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("membership_type_id", membershipTypeId);
  if (error) throw error;
  return count ?? 0;
}

export async function listMembershipTypes(): Promise<MembershipTypeRecord[]> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!.from(table).select("*").order("name", { ascending: true });
  if (error) throw error;

  const types = (data as MembershipTypeRecord[]) ?? [];
  if (types.length === 0) return [];

  const { data: membersData, error: membersError } = await supabaseAdmin!
    .from("members")
    .select("membership_type_id");
  if (membersError) throw membersError;

  const counts = (membersData ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = row.membership_type_id as string | null;
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return types.map((item) => ({ ...item, members_count: counts[item.id] ?? 0 }));
}

export async function createMembershipType(payload: MembershipTypePayload): Promise<MembershipTypeRecord> {
  ensureAdmin();
  const name = normalizeName(payload.name);
  if (!name) throw new Error("Name is required");

  try {
    const { data, error } = await supabaseAdmin!
      .from(table)
      .insert({
        name,
        price_monthly: normalizePrice(payload.price_monthly),
        is_active: payload.is_active ?? true,
      })
      .select("*")
      .single();
    if (error) throw error;
    return { ...(data as MembershipTypeRecord), members_count: 0 };
  } catch (error) {
    throw toFriendlyError(error, "Failed to create membership type");
  }
}

export async function updateMembershipType(
  id: string,
  payload: Partial<MembershipTypePayload>,
): Promise<MembershipTypeRecord> {
  ensureAdmin();
  const updates: { name?: string; price_monthly?: number | null; is_active?: boolean } = {};

  if (payload.name !== undefined) {
    const name = normalizeName(payload.name);
    if (!name) throw new Error("Name is required");
    updates.name = name;
  }
  if (payload.price_monthly !== undefined) updates.price_monthly = normalizePrice(payload.price_monthly);
  if (payload.is_active !== undefined) updates.is_active = payload.is_active;

  try {
    const { data, error } = await supabaseAdmin!
      .from(table)
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    const count = await memberUsageCount(id);
    return { ...(data as MembershipTypeRecord), members_count: count };
  } catch (error) {
    throw toFriendlyError(error, "Failed to update membership type");
  }
}

export async function deleteMembershipType(id: string): Promise<void> {
  ensureAdmin();
  const usageCount = await memberUsageCount(id);
  if (usageCount > 0) {
    throw new Error("This membership type is currently assigned to members and cannot be deleted.");
  }

  const { error } = await supabaseAdmin!.from(table).delete().eq("id", id);
  if (error) throw error;
}
