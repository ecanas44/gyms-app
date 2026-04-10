import { NextRequest, NextResponse } from "next/server";
import { deleteMembershipType, updateMembershipType } from "../../../../lib/membership-types";
import { requireOwner } from "../../../../lib/owner-auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id } = await context.params;
    const data = await updateMembershipType(id, {
      name: body.name,
      price_monthly: body.price_monthly,
      plan_type: body.plan_type,
      is_active: body.is_active,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update membership type", error);
    const message = error instanceof Error ? error.message : "Failed to update membership type";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    await deleteMembershipType(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete membership type", error);
    const message = error instanceof Error ? error.message : "Failed to delete membership type";
    const status = message.includes("cannot be deleted") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
