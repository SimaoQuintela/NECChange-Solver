import { exec } from "child_process";
import { NextResponse } from "next/server";
import path from "path";


/**
 * @brief This is the main function that will execute the main.py script
 * This will generate the JSON file that will be used to generate the schedule
 */
export async function POST() {
    const scriptPath = path.join(process.cwd(), "../schedule/schedule/main.py");

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

    return NextResponse.json({ message: "main.py executed successfully", status: 201 });
}