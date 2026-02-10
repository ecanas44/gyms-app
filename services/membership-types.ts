import { MembershipTypeRecord } from "../lib/membership-types";

export type MembershipTypeInput = {
  name: string;
  price_monthly?: number | null;
  is_active?: boolean;
};

const baseUrl = "/api/membership-types";

export async function fetchMembershipTypes(): Promise<MembershipTypeRecord[]> {
  const res = await fetch(baseUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load membership types");
  return res.json();
}

export async function createMembershipType(
  input: MembershipTypeInput,
): Promise<MembershipTypeRecord> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create membership type");
  return data;
}

export async function updateMembershipType(
  id: string,
  input: MembershipTypeInput,
): Promise<MembershipTypeRecord> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to update membership type");
  return data;
}

export async function deleteMembershipType(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to delete membership type");
}
