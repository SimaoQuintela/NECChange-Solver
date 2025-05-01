/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import Alocation from '@/data/alocation.json';
import path from 'path';
import fs, { writeFile } from 'fs';
import { parse } from 'csv-parse/sync';

type Slot = [string, string, string, string, string, boolean];

interface OutputData {
    [studentId: string]: {
        name: string;
        number: string;
        alocations: number;
        overlaps: number;
    };
}

// Helper to read and parse the CSV
function readStudentInfoCSV(): Record<string, string> {
    const csvFilePath = path.join(process.cwd(), '..', 'schedule', 'schedule', 'data', 'uni_data', 'inscritos_anon.csv');
    console.log(csvFilePath);

    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    const mapping: Record<string, string> = {};

    records.forEach((record: any) => {
        if (record['Nº Mecanográfico'] && record['Nome']) {
            mapping[record['Nº Mecanográfico'].toUpperCase()] = record['Nome'];
        }
    });

    return mapping;
}


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

export async function POST() {
    const inputData = Alocation;
    const outputData: OutputData = {};

    const studentNameMapping = readStudentInfoCSV();
    //   console.log(studentNameMapping);

    for (const studentId in inputData) {
        if (!inputData.hasOwnProperty(studentId)) {
            continue;
        }

        const studentNumber = studentId as keyof typeof inputData;
        const classes = inputData[studentNumber];


        const allSlots: Slot[] = [];
        classes.forEach((classInfo) => {
            allSlots.push(...classInfo.slots as Slot[]);
        });

        // console.log(allSlots);

        const alocations = classes.length;
        const overlaps = countOverlaps(allSlots);

        outputData[studentId] = {
            name: studentNameMapping[studentId] ? studentNameMapping[studentId] : "Unknown",
            number: studentId.toLowerCase(),
            alocations,
            overlaps,
        };
    }

    try {
            // Convert object to JSON string
            const jsonData = JSON.stringify(outputData, null, 2);
    
            // Define file path in /src
            const filePath = path.join(process.cwd(), "src", "data", `students.json`);
    
    
            // Write the JSON file
            writeFile(filePath, jsonData, (error) => {
                if (error) {
                    console.error("Error writing JSON file:", error);
                    return NextResponse.json({ error: "Failed to write JSON file." }, { status: 500 });
                }
            });
    
    
            return NextResponse.json({ message: "JSON file created successfully!", filePath });
        } catch (error) {
            console.error("Error writing JSON file:", error);
            return NextResponse.json({ error: "Failed to write JSON file." }, { status: 500 });
        }
}


export async function GET() {
    const filePath = path.join(process.cwd(), "src", "data", `students.json`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    console.log(fileContent)


    return NextResponse.json(fileContent);
}