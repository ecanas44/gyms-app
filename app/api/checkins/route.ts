import { NextResponse } from "next/server";
import { createCheckin, listCheckins } from "../../../lib/checkins";

export async function GET() {
  try {
    const data = await listCheckins();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch check-ins", error);
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createCheckin({
      member_id: body.member_id ?? null,
      waiver_id: body.waiver_id,
      checked_in_at: body.checked_in_at,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create check-in", error);
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 });
  }
}
