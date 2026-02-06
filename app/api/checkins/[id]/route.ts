import { NextRequest, NextResponse } from "next/server";
import { deleteCheckin } from "../../../../lib/checkins";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteCheckin(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete check-in", error);
    return NextResponse.json({ error: "Failed to delete check-in" }, { status: 500 });
  }
}
