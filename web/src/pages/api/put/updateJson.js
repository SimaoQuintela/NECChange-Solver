import alocation from "public/data/alocation.json"
import schedule from "public/data/schedule.json"


function setSlots(slot, classroom, is_overlap){
    let new_slot = []
    slot.map((s) => {
        if(s.length === 1){
            let entry = '0'+s;
            new_slot.push(entry);
        } else {
            new_slot.push(s);
        }
    })
    new_slot.push(classroom);
    new_slot.push(is_overlap);
    return new_slot;
}

function check_overlap(slots_class, slot, ){
    return slots_class.filter((slot_check) =>
        // exemplo de slot_check: ["Terça", "16", "00", "18", "00", true]
        slot[0] === slot_check[0]
        && (parseInt(slot[1]) <= parseInt(slot_check[1]) && parseInt(slot[3]) >= parseInt(slot_check[1]))
        && (parseInt(slot[1]) >= parseInt(slot_check[1]) && parseInt(slot[3]) >= parseInt(slot_check[3]))
    )
}



function trade_uc(trade, studentNr, ucToTrade, shiftNumberToTrade){


    //    let slots_data_to = schedule.filter((uc) => uc.uc === ucToTrade.uc && uc.type_class === ucToTrade.type_class && uc.shift === shiftNumberToTrade);
    let diff_classes = alocation[studentNr].filter((student_classes) => student_classes.uc !== trade.uc && student_classes.type_class !== trade.type_class)


}

export default function handler(req, res) {
    const {studentNr, trades} = req.body.params;
    const fs = require('fs');
    const fileName = './public/data/alocation.json'

    trades.map((trade) =>{
        let shiftNumberToTrade = trade.shift.at(trade.shift.length -1);
        let ucToTrade = alocation[studentNr].filter((alocatedClass) => alocatedClass.uc === trade.uc && alocatedClass.type_class === trade.type_class).at(0);

        trade_uc(trade, studentNr, ucToTrade, shiftNumberToTrade);


    })



    /*
    trades.map((trade)=>{
        // we are assuming that there is no more than 9 shifts per class
        let shiftNumberToTrade = trade.shift.at(trade.shift.length -1);
        let shiftToTrade = schedule.filter((class_info) => class_info.uc === trade.uc && class_info.type_class === trade.type_class && class_info.shift === shiftNumberToTrade ).at(0);
        alocation[studentNr].filter((alocatedClass) => alocatedClass.uc === trade.uc && alocatedClass.type_class === trade.type_class)
          .map( (class_to_change) => {
              class_to_change.shift = shiftToTrade.shift;
              class_to_change.slots = []
              // classes where I want to check overlap
              let diff_classes = alocation[studentNr].filter((student_classes) => student_classes.uc !== trade.uc && student_classes.type_class !== trade.type_class)
              shiftToTrade.slots.map((slot) => {
                  let classroom = slot[5];
                  let is_overlap = false;
                  // slot example: ["Quinta", "9", "0", "11", "0"]
                  let classes_to_change = [];
                  diff_classes.map((class_to_check) => {
                      class_to_check.slots.map((slots_class) =>{
                            let overlaps = check_overlap(slots_class, slot);
                            if (overlaps.length >= 1) {
                                is_overlap = true;
                                classes_to_change.push(class_to_check);
                            }
                      })
                  })
                  let new_slot = setSlots(slot, classroom, is_overlap);
                  class_to_change.slots.push(new_slot);
              })
          })
    })
     */

    fs.writeFile(fileName, JSON.stringify(alocation, null, 3), function writeJSON(err) {
        if (err) return res.status(500).json("error on update");
        res.status(200).json("updated");
    });
}