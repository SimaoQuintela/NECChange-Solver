import { SlotType, StudentAlocation, StudentAlocationUniqueType, StudentNumberTypeNotNull } from "@/types/Types";
import alocation from "@/data/alocation.json"
import schedule from "@/data/schedule.json"
import fs from 'fs';

interface Body {
    studentNr: StudentNumberTypeNotNull;
    trades: {
        uc: string;
        type_class: string;
        shift: string;
        shiftBeforeTrade: string;
    }[];
}

function check_overlap(slot_class: SlotType, slot: SlotType) {

    if (slot[0] === slot_class[0] &&
        parseInt(slot_class[1]) * 60 + parseInt(slot_class[2]) < (parseInt(slot[3]) * 60 + parseInt(slot[4])) &&
        parseInt(slot_class[3]) * 60 + parseInt(slot_class[4]) > (parseInt(slot[1]) * 60 + parseInt(slot[2]))) {
        return true
    }

    return false;
}

function update_overlaps(overlaps: [{ slots: SlotType[] }, number[]][], check_class: StudentAlocation, index: number) {
    let exists = false
    for (let i = 0; i < overlaps.length; i++) {
        if (overlaps[i][0] == check_class) {
            overlaps[i][1].push(index)
            exists = true
            break;
        }
    }

    if (exists == false) {
        overlaps.push([check_class, [index]])
    }
}


function evaluate_overlap_classes(slots_to_check: SlotType[], classes: StudentAlocationUniqueType) {
    const overlaps: [{ slots: SlotType[] }, number[]][] = []
    slots_to_check.forEach((slot_to_check) => {
        if (!classes) return;

        classes.forEach((check_class) => {
            check_class.slots.forEach((class_slot, i) => {
                if (check_overlap(class_slot as SlotType, slot_to_check) == true) {
                    update_overlaps(overlaps, check_class as StudentAlocation, i)
                }
            })
        })
    })

    let is_overlap = false;
    if (overlaps.length >= 2) {
        is_overlap = true;
    }

    overlaps.forEach((overlap) => {
        overlap[1].forEach((current_i) => {
            overlap[0].slots[current_i][6] = is_overlap;
        })
    })
}

export async function PUT(request: Request) {
    const { studentNr, trades } = await request.json() as Body;

    const fileName = './src/data/alocation.json'
    trades.map((trade) => {
        // evaluate the classes that stay on the same slot
        const shiftNumberBeforeTrade = trade.shiftBeforeTrade.at(trade.shift.length - 1);
        const classBeforeTrade = schedule.filter((class_info) => class_info.uc === trade.uc && class_info.type_class === trade.type_class && class_info.shift === shiftNumberBeforeTrade).at(0);

        if (classBeforeTrade === undefined)
            return Response.json({ message: "Trade not found", status: 404 });


        const classesToCheck = alocation[studentNr].filter((alocatedClass) => alocatedClass.uc != classBeforeTrade.uc
            || alocatedClass.type_class != classBeforeTrade.type_class
            || alocatedClass.shift != classBeforeTrade.shift) ?? [];

        evaluate_overlap_classes(classBeforeTrade.slots as SlotType[], classesToCheck);

        // evaluate the class that changes to a new slot, and the ones of that slot
        const shiftNumberToTrade = trade.shift.at(trade.shift.length - 1);
        const scheduleToTrade = schedule.filter((class_info) => class_info.uc === trade.uc
            && class_info.type_class === trade.type_class
            && class_info.shift === shiftNumberToTrade).at(0);
        // the object that is going to change in order to trade
        const classToTrade = alocation[studentNr].filter((alocatedClass) => alocatedClass.uc === trade.uc
            && alocatedClass.type_class === trade.type_class
            && alocatedClass.shift === shiftNumberBeforeTrade).at(0);

        if (scheduleToTrade === undefined || classToTrade === undefined)
            return Response.json({ message: "Trade not found", status: 404 });


        classToTrade.shift = shiftNumberToTrade ?? "";
        classToTrade.slots.forEach((_, i) => {
            classToTrade.slots[i] = scheduleToTrade.slots[i];
            classToTrade.slots[i].push(false);
        })
        evaluate_overlap_classes(classToTrade.slots as SlotType[], alocation[studentNr])
    })

    fs.writeFile(fileName, JSON.stringify(alocation, null, 3), function writeJSON(err) {
        if (err) return Response.json({ message: "Error writing file", status: 500 });
        return Response.json({ message: "Trade updated successfully", status: 200 });
    });


    return Response.json({ message: "Trade updated successfully", status: 200 });
}