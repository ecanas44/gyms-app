import { NextResponse } from "next/server";
import { deleteMember, updateMember } from "../../../../lib/members";

type RouteContext = { params: { id: string } };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const body = await request.json();
    const data = await updateMember(context.params.id, {
      waiver_id: body.waiver_id,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone ?? null,
      membership: body.membership,
      start_date: body.start_date,
      punches_remaining: body.punches_remaining ?? null,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update member", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await deleteMember(context.params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete member", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
