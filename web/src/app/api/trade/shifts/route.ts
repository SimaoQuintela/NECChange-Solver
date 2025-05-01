import { NextRequest, NextResponse } from "next/server";
import schedule from "@/data/schedule.json"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const type_class = searchParams.get("type_class")
    const uc = searchParams.get("uc")

    const shifts = schedule.filter((e) => (e.uc === uc) && (e.type_class === type_class))
        .map((e) => e.type_class + e.shift)
        .sort();

    return NextResponse.json({ shifts });
}