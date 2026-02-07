import { NextRequest, NextResponse } from "next/server";
import { deleteWaiver, updateWaiver } from "../../../../lib/waivers";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateWaiver(id, {
      code: body.code,
      member_name: body.member_name,
      member_email: body.member_email,
      signed_at: body.signed_at,
      status: body.status,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update waiver", error);
    return NextResponse.json({ error: "Failed to update waiver" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteWaiver(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete waiver", error);
    return NextResponse.json({ error: "Failed to delete waiver" }, { status: 500 });
  }
}
