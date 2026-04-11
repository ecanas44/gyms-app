import { CheckinRecord } from "../lib/checkins";

export type CheckinInput = {
  member_id?: string | null;
  waiver_id: string;
  checked_in_at?: string;
};

const baseUrl = "/api/checkins";

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) return new Error(body.error);
  } catch {
    // Ignore JSON parsing errors and return fallback.
  }
  return new Error(fallback);
}

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
  if (!res.ok) throw await parseError(res, "Failed to create check-in");
  return res.json();
}

export async function deleteCheckin(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete check-in");
}
