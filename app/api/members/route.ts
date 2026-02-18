import { NextResponse } from "next/server";
import { createMember, listMembers } from "../../../lib/members";

export async function GET() {
  try {
    const data = await listMembers();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch members", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createMember({
      waiver_id: body.waiver_id,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone ?? null,
      membership_type_id: body.membership_type_id,
      start_date: body.start_date,
      punches_remaining: body.punches_remaining ?? null,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create member", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
