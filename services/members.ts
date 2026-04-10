import { MemberRecord } from "../lib/members";

export type MemberInput = {
  waiver_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  membership_type_id: string;
  start_date: string;
  punches_remaining?: number | null;
};

const baseUrl = "/api/members";

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = (await res.json()) as { error?: string };
    return new Error(data.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function fetchMembers(): Promise<MemberRecord[]> {
  const res = await fetch(baseUrl, { cache: "no-store" });
  if (!res.ok) throw await parseError(res, "Failed to load members");
  return res.json();
}

export async function createMember(input: MemberInput): Promise<MemberRecord> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res, "Failed to create member");
  return res.json();
}

export async function updateMember(id: string, input: Partial<MemberInput>): Promise<MemberRecord> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res, "Failed to update member");
  return res.json();
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  if (!res.ok) throw await parseError(res, "Failed to delete member");
}
