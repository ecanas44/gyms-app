import { NextResponse } from "next/server";
import { createWaiver, listWaivers } from "../../../lib/waivers";

export async function GET() {
  try {
    const data = await listWaivers();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch waivers", error);
    return NextResponse.json({ error: "Failed to fetch waivers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createWaiver({
      code: body.code,
      member_name: body.member_name,
      member_email: body.member_email,
      signed_at: body.signed_at,
      status: body.status,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create waiver", error);
    return NextResponse.json({ error: "Failed to create waiver" }, { status: 500 });
  }
}
