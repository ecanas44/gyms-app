import { CheckinRecord } from "../lib/checkins";

export type CheckinInput = {
  member_id?: string | null;
  waiver_id: string;
  checked_in_at?: string;
};

const baseUrl = "/api/checkins";

export async function fetchCheckins(): Promise<CheckinRecord[]> {
  const res = await fetch(baseUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load check-ins");
  return res.json();
}

export async function createCheckin(input: CheckinInput): Promise<CheckinRecord> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create check-in");
  return res.json();
}

export async function deleteCheckin(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete check-in");
}
