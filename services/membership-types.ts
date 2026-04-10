import type { MembershipTypeRecord, PlanType } from "../lib/membership-types";

export type MembershipTypeInput = {
  name: string;
  price_monthly?: number | null;
  plan_type?: PlanType;
  is_active?: boolean;
};

const baseUrl = "/api/membership-types";

function buildHeaders(ownerKey?: string): HeadersInit {
  return ownerKey ? { "Content-Type": "application/json", "x-owner-key": ownerKey } : { "Content-Type": "application/json" };
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = (await res.json()) as { error?: string };
    return new Error(data.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function fetchMembershipTypes(): Promise<MembershipTypeRecord[]> {
  const res = await fetch(baseUrl, { cache: "no-store" });
  if (!res.ok) throw await parseError(res, "Failed to load membership types");
  return res.json();
}

export async function createMembershipType(
  input: MembershipTypeInput,
  ownerKey?: string,
): Promise<MembershipTypeRecord> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: buildHeaders(ownerKey),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res, "Failed to create membership type");
  return res.json();
}

export async function updateMembershipType(
  id: string,
  input: Partial<MembershipTypeInput>,
  ownerKey?: string,
): Promise<MembershipTypeRecord> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: buildHeaders(ownerKey),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res, "Failed to update membership type");
  return res.json();
}

export async function deleteMembershipType(id: string, ownerKey?: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
    headers: ownerKey ? { "x-owner-key": ownerKey } : undefined,
  });
  if (!res.ok) throw await parseError(res, "Failed to delete membership type");
}
