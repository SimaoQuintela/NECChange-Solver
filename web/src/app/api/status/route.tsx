import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const alocationPath = path.join(process.cwd(), "public/data/alocation.json");
const schedulePath = path.join(process.cwd(), "public/data/schedule.json");

export async function GET() {
  return NextResponse.json({
    alocation: fs.existsSync(alocationPath),
    schedule: fs.existsSync(schedulePath),
  });
}
