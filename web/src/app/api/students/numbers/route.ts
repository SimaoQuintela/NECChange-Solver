import { NextResponse } from "next/server";
import alocation from "@/data/alocation.json";

export async function GET() {
  const students = Object.keys(alocation).map((studentNr) => ({
    studentNr,
  }));
  return NextResponse.json(students);
}
