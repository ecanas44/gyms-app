import { NextRequest, NextResponse } from "next/server";
import { createMembershipType, listMembershipTypes } from "../../../lib/membership-types";
import { requireOwner } from "../../../lib/owner-auth";

export async function GET() {
  try {
    const data = await listMembershipTypes();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch membership types", error);
    return NextResponse.json({ error: "Failed to fetch membership types" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = requireOwner(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const data = await createMembershipType({
      name: body.name,
      price_monthly: body.price_monthly ?? null,
      plan_type: body.plan_type ?? "custom",
      description: body.description ?? null,
      duration_days: body.duration_days ?? null,
      included_punches: body.included_punches ?? null,
      is_active: body.is_active ?? true,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create membership type", error);
    const message = error instanceof Error ? error.message : "Failed to create membership type";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
