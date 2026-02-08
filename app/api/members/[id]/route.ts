import { NextRequest, NextResponse } from "next/server";
import { deleteMember, updateMember } from "../../../../lib/members";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const data = await updateMember(id, {
      waiver_id: body.waiver_id,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone ?? null,
      membership_type_id: body.membership_type_id,
      start_date: body.start_date,
      punches_remaining: body.punches_remaining ?? null,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update member", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteMember(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete member", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
