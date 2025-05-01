import { NextResponse } from "next/server";
import schedule from "@/data/schedule.json";


export async function GET(request: Request, props: { params: Promise<{ uc: string }> }) {
    const params = await props.params;

    const ucShifts = schedule.filter((shift) => shift.uc === params.uc);

    return NextResponse.json(ucShifts);
}