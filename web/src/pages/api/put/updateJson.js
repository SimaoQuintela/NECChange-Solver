import alocation from "public/data/alocation.json"
import schedule from "public/data/schedule.json"

function check_overlap(slot_class, slot) {

    if(slot[0] === slot_class[0] && 
       parseInt(slot_class[1])*60 + parseInt(slot_class[2]) < (parseInt(slot[3])*60 + parseInt(slot[4])) && 
       parseInt(slot_class[3])*60 + parseInt(slot_class[4]) > (parseInt(slot[1])*60 + parseInt(slot[2])))
    {
        return true
    }
    
    return false;
}

function update_overlaps(overlaps, check_class, index){
    let exists = false
    for(let i=0; i<overlaps.length; i++){
        if(overlaps[i][0] == check_class){
            overlaps[i][1].push(index)
            exists = true
            break;
        }
    }

    if(exists == false){
        overlaps.push([check_class, [index]])
    }
}


function evaluate_overlap_classes(slots_to_check, classes){
    let overlaps = []
    slots_to_check.forEach((slot_to_check, _) => {
        classes.forEach((check_class) => {
            check_class.slots.forEach((class_slot, i) => {
                if(check_overlap(class_slot, slot_to_check) == true){
                    update_overlaps(overlaps, check_class, i)
                }
            })
        })
    })

    let is_overlap = false;
    if(overlaps.length >= 2){
        is_overlap = true;
    }

    overlaps.forEach((overlap) => {
        overlap[1].forEach((current_i) =>{
            overlap[0].slots[current_i][6] = is_overlap;
        })
    })
}

// we are assuming that there is no more than 9 shifts per class
export default function handler(req, res) {
    const {studentNr, trades} = req.body.params;
    const fs = require('fs');
    const fileName = './public/data/alocation.json'
    trades.map((trade)=>{
        // evaluate the classes that stay on the same slot
        let shiftNumberBeforeTrade = trade.shiftBeforeTrade.at(trade.shift.length -1);
        let classBeforeTrade = schedule.filter((class_info) => class_info.uc === trade.uc && class_info.type_class === trade.type_class && class_info.shift === shiftNumberBeforeTrade ).at(0);
        let classesToCheck = alocation[studentNr].filter((alocatedClass) => alocatedClass.uc != classBeforeTrade.uc
                                                                         || alocatedClass.type_class != classBeforeTrade.type_class
                                                                         || alocatedClass.shift != classBeforeTrade.shift);
        evaluate_overlap_classes(classBeforeTrade.slots, classesToCheck);
                
        // evaluate the class that changes to a new slot, and the ones of that slot
        let shiftNumberToTrade = trade.shift.at(trade.shift.length -1);
        let scheduleToTrade = schedule.filter((class_info) => class_info.uc === trade.uc
                                                        && class_info.type_class === trade.type_class 
                                                        && class_info.shift === shiftNumberToTrade ).at(0);
        // the object that is going to change in order to trade
        let classToTrade = alocation[studentNr].filter((alocatedClass) => alocatedClass.uc === trade.uc
                                                                    && alocatedClass.type_class === trade.type_class
                                                                    && alocatedClass.shift === shiftNumberBeforeTrade).at(0);
        classToTrade.shift = shiftNumberToTrade;
        classToTrade.slots.forEach((_, i) =>{
            classToTrade.slots[i] = scheduleToTrade.slots[i];
            classToTrade.slots[i].push(false);
        })
        evaluate_overlap_classes(classToTrade.slots, alocation[studentNr])
    })

    fs.writeFile(fileName, JSON.stringify(alocation, null, 3), function writeJSON(err) {
        if (err) return res.status(500).json("error on update");
        res.status(200).json("updated");
    });
}