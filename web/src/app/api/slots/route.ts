import { NextRequest, NextResponse } from "next/server";
import schedule from "@/data/schedule.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const slots = schedule.filter((e) => e.year === year);
  return NextResponse.json({ slots });
}
