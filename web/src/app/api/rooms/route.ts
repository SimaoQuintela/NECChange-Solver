import { NextResponse } from "next/server";
import Rooms from "@/data/roomsAllocations.json";

// return roomsdata
export async function GET() {
    const roomsData = Rooms;
    // console.log("roomsData", roomsData);

    return NextResponse.json(roomsData, { status: 200 });
}
