import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

/**
 * @author @pedroacamargo
 * @brief This function will read the rooms CSV file and extract the max capacity of each room
 * 
 * @returns {Promise<void>}
 */
export async function GET() {
    try {
        // Define CSV file path inside /src
        const filePath = path.join(
            process.cwd(),
            "../schedule/schedule/data/uni_data",
            "salas.csv"
        );

        // Ensure the file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "CSV file not found." }, { status: 404 });
        }

        // Read CSV file
        const fileContent = fs.readFileSync(filePath, "utf8");

        // Parse CSV content
        const { data } = Papa.parse(fileContent, { header: true, delimiter: ";" }) as Papa.ParseResult<Record<string, string>>;

        // Transform data to extract max capacity
        const rooms: Record<string, number> = {};
        data.forEach((row) => {
            if (!row["Edificio"] || !row["Espaço"] || !row["Capacidade Aula"] || !row["Capacidade Exame"]) {
                return;
            }

            const roomKey = `${row["Edificio"]}-${row["Espaço"]}`;
            const maxCapacity = Math.max(parseInt(row["Capacidade Aula"], 10), parseInt(row["Capacidade Exame"], 10));

            rooms[roomKey] = maxCapacity;
        });

        return NextResponse.json(rooms, { status: 200 });
    } catch (error) {
        console.error("Error processing CSV:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
