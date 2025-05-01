import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/dynamicAlocation.json");

const loadData = () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dynamicAlocation = loadData();

    Object.entries(body).forEach(([key, value]) => {
      dynamicAlocation[key] = value;
    });

    fs.writeFileSync(filePath, JSON.stringify(dynamicAlocation, null, 2));

    return NextResponse.json(
      { message: "dynamicAlocation updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating dynamicAlocation", error },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));

    return NextResponse.json(
      { message: "All entries deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting entries", error },
      { status: 500 }
    );
  }
}
