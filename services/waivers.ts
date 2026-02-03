export type WaiverStatus = "Signed" | "Pending" | "Expired";

export type Waiver = {
  id: string;
  code: string;
  member_name: string;
  member_email: string;
  signed_at: string;
  status: WaiverStatus;
  created_at: string;
  updated_at: string;
};

export type WaiverInput = {
  code?: string;
  member_name: string;
  member_email: string;
  signed_at: string;
  status: WaiverStatus;
};

const baseUrl = "/api/waivers";

export async function fetchWaivers(): Promise<Waiver[]> {
  const res = await fetch(baseUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load waivers");
  return res.json();
}

export async function createWaiver(input: WaiverInput): Promise<Waiver> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create waiver");
  return res.json();
}

export async function updateWaiver(id: string, input: WaiverInput): Promise<Waiver> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update waiver");
  return res.json();
}

export async function deleteWaiver(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete waiver");
}
