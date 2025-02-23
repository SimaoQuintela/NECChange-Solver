import { exec } from "child_process";
import { NextResponse } from "next/server";
import path from "path";


/**
 * @brief This function will execute the export_year_schedule.py script
 * This script will generate a PDF file with the year schedule
 */
export async function POST() {
    const scriptPath = path.join(
        process.cwd(),
        "../schedule/schedule/export_year_schedule.py"
    );

    console.log("Script path: ", scriptPath);

    exec(`python3 ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`An error occurred during execution: ${stderr}`);

            return NextResponse.json({
                message: `An error occurred during execution: ${stderr}`,
                status: 500,
            });
        }

        console.log(`stdout: \n${stdout}`);
        return NextResponse.json({ message: "Export Success", status: 200 });
    });

    return NextResponse.json({ message: "export_year_schedule executed successfully", status: 201 });
}