import { NextRequest, NextResponse } from "next/server";
import { deleteMembershipType, updateMembershipType } from "../../../../lib/membership-types";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const data = await updateMembershipType(id, {
      name: body.name,
      price_monthly: body.price_monthly ?? null,
      is_active: body.is_active ?? true,
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update membership type";
    console.error("Failed to update membership type", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteMembershipType(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete membership type";
    console.error("Failed to delete membership type", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
