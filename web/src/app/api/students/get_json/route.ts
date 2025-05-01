import { NextResponse } from "next/server";
import Students from "@/data/students.json";

// return roomsdata
export async function GET() {
    const studentsData = Students;
    // console.log("roomsData", studentsData);

    return NextResponse.json(studentsData, { status: 200 });
}
