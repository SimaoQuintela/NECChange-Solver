import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const config = {
    api: {
        bodyParser: false, // Desativa o bodyParser para permitir `multipart/form-data`
    },
};

const uploadDir = path.join(
    process.cwd(),
    "../schedule/schedule/data/uni_data"
);

export async function POST(req: NextRequest) {
    try {
        const formData: FormData = await req.formData(); // Parse the request body as FormData
        const uploadedFile = formData.getAll('file')[0]; // Get the first file sent in the request

        if (!uploadedFile) {
            return NextResponse.json({ message: "No file uploaded.", status: 400 });
        }

        if (uploadedFile instanceof Blob) {
            const fileName = uploadedFile.name;

            const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

            await fs.writeFile(path.join(uploadDir, fileName), fileBuffer);

            return NextResponse.json({
                message: "File uploaded successfully.", status: 200, filename: fileName
            });
        }


        return NextResponse.json({ message: "File uploaded successfully.", status: 200, filename: "newFilename" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "An error occurred during upload.", status: 500 });
    }

}
