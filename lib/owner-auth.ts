import { NextRequest, NextResponse } from "next/server";

const OWNER_SETTINGS_KEY = process.env.OWNER_SETTINGS_KEY;

export function requireOwner(request: NextRequest): NextResponse | null {
  if (!OWNER_SETTINGS_KEY) return null;
  const provided = request.headers.get("x-owner-key");
  if (provided && provided === OWNER_SETTINGS_KEY) return null;
  return NextResponse.json({ error: "Owner authorization required" }, { status: 403 });
}
