/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import Alocation from '@/data/alocation.json';
import Students from '@/data/students.json';
import path from 'path';
import { writeFile } from 'fs';

type Slot = [string, string, string, string, string, boolean];

function slotToTimestamp(day: string, hour: string, minute: string): number {
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayIndex = daysOfWeek.indexOf(day);
    return dayIndex * 24 * 60 + parseInt(hour) * 60 + parseInt(minute);
}

function countOverlaps(slots: Slot[]): number {
    const times: { start: number; end: number }[] = slots.map(([day, startH, startM, endH, endM]) => ({
        start: slotToTimestamp(day, startH, startM),
        end: slotToTimestamp(day, endH, endM),
    }));

    let overlapCount = 0;

    for (let i = 0; i < times.length; i++) {
        for (let j = i + 1; j < times.length; j++) {
            if (times[i].end > times[j].start && times[i].start < times[j].end) {
                overlapCount++;
            }
        }
    }

    return overlapCount;
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { studentNumber } = body as { studentNumber: keyof typeof Alocation };

    const inputData = Alocation;

    const filePath = path.join(process.cwd(), "src", "data", "students.json");

    const overlaps = countOverlaps(inputData[studentNumber].flatMap((student) => student.slots as unknown as Slot) as unknown as Slot[]);

    try {
        const studentsData = Students;

        // Update just the overlaps field
        studentsData[studentNumber].overlaps = overlaps;

        // Write the updated JSON back to the file
        const updatedJson = JSON.stringify(studentsData, null, 2);
        writeFile(filePath, updatedJson, (error) => {
            if (error) {
                console.error("Error writing JSON file:", error);
                return;
            }
        });

        return NextResponse.json({ message: "Student overlaps updated successfully!", overlaps });
    } catch (error) {
        console.error("Error handling POST request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}