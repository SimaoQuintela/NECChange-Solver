import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const alocationPath = path.join(process.cwd(), "src/data/alocation.json");

export async function GET() {
  if (!fs.existsSync(alocationPath)) {
    return NextResponse.json({ alocation: false });
  }

  try {
    const fileData = fs.readFileSync(alocationPath, "utf-8");
    const jsonData = JSON.parse(fileData);
    return NextResponse.json({ alocation: true, data: jsonData });
  } catch (error) {
    return NextResponse.json({ alocation: false });
  }
}