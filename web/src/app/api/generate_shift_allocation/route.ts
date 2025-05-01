import Alocation from "@/data/alocation.json";
import axios, { AxiosResponse } from "axios";
import { writeFile } from "fs";
import { NextResponse } from "next/server";
import path from "path";

/**
 * @author @pedroacamargo
 * @brief This function will generate a JSON file with the rooms allocations
 *  
 * @returns {Promise<void>}
 */
export async function POST() {

    let roomsCapacity: AxiosResponse<Record<string, number>>;

    // Get rooms capacity
    try {
        roomsCapacity = await axios.get<Record<string, number>>("http://localhost:3000/api/generate_rooms_capacity");

        if (roomsCapacity.status !== 200) {
            console.error("Failed to get rooms capacity:", roomsCapacity.data);
            return NextResponse.json({ error: "Failed to get rooms capacity." }, { status: 500 });
        }
    } catch (error) {
        console.error("Failed to get rooms capacity:", error);
        return NextResponse.json({ error: "Failed to get rooms capacity." }, { status: 500 });
    }

    // Create a new object with the rooms allocations
    const res = {} as Record<string, Record<string, {
        rooms: string[];
        capacity: number[];
        allocations: number;
    }>>;

    // Povoate the object with the rooms allocations (Create the JSON structure with its values)
    Object.keys(Alocation).forEach((key) => {
        Alocation[key as keyof typeof Alocation].forEach((value) => {
            if (res[value.uc] === undefined) {
                res[value.uc] = {};
            }


            // If the key does not exist, create it
            // Then povoate the object with the rooms allocations
            // This is important to compute the number of allocations for each room and keep track of the capacity
            if (res[value.uc][value.type_class + value.shift] === undefined) {
                res[value.uc][value.type_class + value.shift] = {
                    rooms: value.slots.map((slot) => slot[5].toString().split("Ed")[1]) as string[],
                    capacity: value.slots.map((info) => {
                        const roomKey = info[5].toString().split("Ed")[1];
                        return roomsCapacity.data[roomKey];
                    }) as number[],
                    allocations: 0,
                };
            }

            res[value.uc][value.type_class + value.shift]["allocations"] += 1;
        });
    });


    try {
        // Convert object to JSON string
        const jsonData = JSON.stringify(res, null, 2);

        // Define file path in /src
        const filePath = path.join(process.cwd(), "src", "data", `roomsAllocations.json`);


        // Write the JSON file
        await writeFile(filePath, jsonData, (error) => {
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