import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const alocationPath = path.join(process.cwd(), "src/data/alocation.json");
const schedulePath = path.join(process.cwd(), "src/data/schedule.json");

export async function GET() {
  return NextResponse.json({
    alocation: fs.existsSync(alocationPath),
    schedule: fs.existsSync(schedulePath),
  });
}
