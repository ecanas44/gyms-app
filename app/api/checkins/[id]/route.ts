import { NextResponse } from "next/server";
import { deleteCheckin } from "../../../../lib/checkins";

type RouteContext = { params: { id: string } };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await deleteCheckin(context.params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete check-in", error);
    return NextResponse.json({ error: "Failed to delete check-in" }, { status: 500 });
  }
}
