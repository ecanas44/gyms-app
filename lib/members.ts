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
const memberSelect =
  "*, membership_type:membership_types!members_membership_type_id_fkey(id, name, price_monthly, is_active)";

function ensureAdmin() {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");
}

function normalizeMemberPayload(payload: MemberPayload | Partial<MemberPayload>) {
  const normalized: Partial<MemberPayload> = { ...payload };

  if (payload.full_name !== undefined) normalized.full_name = payload.full_name.trim();
  if (payload.email !== undefined) normalized.email = payload.email.trim().toLowerCase();
  if (payload.phone !== undefined) normalized.phone = payload.phone?.trim() || null;
  if (payload.start_date !== undefined) normalized.start_date = payload.start_date;
  if (payload.punches_remaining !== undefined) {
    normalized.punches_remaining =
      payload.punches_remaining == null ? null : Number(payload.punches_remaining);
  }

  return normalized;
}

function validateMemberPayload(payload: MemberPayload | Partial<MemberPayload>, partial: boolean) {
  const requireWhenCreating = (value: unknown, message: string) => {
    if (!partial && (!value || (typeof value === "string" && value.trim().length === 0))) {
      throw new Error(message);
    }
  };

  requireWhenCreating(payload.waiver_id, "Waiver is required");
  requireWhenCreating(payload.full_name, "Full name is required");
  requireWhenCreating(payload.email, "Email is required");
  requireWhenCreating(payload.membership_type_id, "Membership type is required");
  requireWhenCreating(payload.start_date, "Start date is required");

  if (payload.full_name !== undefined && payload.full_name.trim().length === 0) {
    throw new Error("Full name is required");
  }

  if (payload.email !== undefined) {
    const email = payload.email.trim();
    if (!email) throw new Error("Email is required");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email is invalid");
  }

  if (payload.punches_remaining !== undefined && payload.punches_remaining != null) {
    if (!Number.isFinite(payload.punches_remaining) || payload.punches_remaining < 0) {
      throw new Error("Punches remaining must be a non-negative number");
    }
  }
}

function toFriendlyError(error: unknown, fallback: string): Error {
  const maybe = error as { code?: string; message?: string };

  if (maybe?.code === "23505") return new Error("A member with that email already exists.");
  if (maybe?.code === "23503") return new Error("Waiver or membership type is invalid.");
  if (maybe?.code === "23514") return new Error("Member data failed validation checks.");

  return new Error(maybe?.message || fallback);
}

export async function listMembers(): Promise<MemberRecord[]> {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!
    .from(table)
    .select(memberSelect)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as MemberRecord[];
}

export async function createMember(payload: MemberPayload): Promise<MemberRecord> {
  ensureAdmin();
  validateMemberPayload(payload, false);

  try {
    const normalizedPayload = normalizeMemberPayload(payload) as MemberPayload;
    const { data, error } = await supabaseAdmin!
      .from(table)
      .insert(normalizedPayload)
      .select(memberSelect)
      .single();
    if (error) throw error;
    return data as MemberRecord;
  } catch (error) {
    throw toFriendlyError(error, "Failed to create member");
  }
}

export async function updateMember(id: string, payload: Partial<MemberPayload>): Promise<MemberRecord> {
  ensureAdmin();
  validateMemberPayload(payload, true);

  try {
    const normalizedPayload = normalizeMemberPayload(payload);
    const { data, error } = await supabaseAdmin!
      .from(table)
      .update(normalizedPayload)
      .eq("id", id)
      .select(memberSelect)
      .single();
    if (error) throw error;
    return data as MemberRecord;
  } catch (error) {
    throw toFriendlyError(error, "Failed to update member");
  }
}

export async function deleteMember(id: string): Promise<void> {
  ensureAdmin();
  const { error } = await supabaseAdmin!.from(table).delete().eq("id", id);
  if (error) throw error;
}
