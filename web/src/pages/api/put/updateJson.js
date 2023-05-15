import alocation from "public/data/alocation.json"
import schedule from "public/data/schedule.json"

export default function handler(req, res) {
    const data = req.body.params;
    const student = data.studentNr;
    const trades = data.trades;

    //res.status(200).json({algo: student})
    const fs = require('fs');
    // TODO: Resolver o problema do path do ficheiro alocation.json
    const fileName = "/home/simao/Desktop/Projeto/web/public/data/alocation.json"

    trades?.map((trade)=>{
        // we are assuming that there is no more than 9 shifts per class
        let shiftNumberToTrade = trade.shift.at(trade.shift.length -1);
        let shiftToTrade = schedule.filter((class_info) => class_info.uc === trade.uc && class_info.type_class === trade.type_class && class_info.shift === shiftNumberToTrade ).at(0);

        alocation[student].filter((alocatedClass) => alocatedClass.uc === trade.uc && alocatedClass.type_class === trade.type_class)
                          .map( (class_to_change) => {
                              class_to_change.shift = shiftToTrade.shift;
                              class_to_change.slots = []

                              // classes where I want to check overlap
                              let diff_classes = alocation[student].filter((student_classes) => student_classes.uc !== trade.uc && student_classes.type_class !== trade.type_class)

                              shiftToTrade.slots.map((slot) => {
                                  let overlap = false;
                                  // slot example: ["Quinta", "9", "0", "11", "0"]
                                  diff_classes.map((class_to_check) => {
                                      class_to_check.slots.map((slots_class) =>{
                                            let overlaps = slots_class.filter((slot_check) =>
                                                // exemplo de slot_check: ["Terça", "16", "00", "18", "00", true]
                                                slot[0] === slot_check[0]
                                                && (parseInt(slot[1]) <= parseInt(slot_check[1]) && parseInt(slot[3]) >= parseInt(slot_check[1]))
                                                && (parseInt(slot[1])>= parseInt(slot_check[1]) && parseInt(slot[3]) >= parseInt(slot_check[3]))
                                          )
                                          if (overlaps.length >= 1) overlap = true;
                                      })
                                  })
                                  var new_slot = []
                                  slot.map((s) => {
                                      if(s.length === 1){
                                          let entry = '0'+s;
                                          new_slot.push(entry);
                                      } else {
                                          new_slot.push(s);
                                      }
                                  })
                                  new_slot.push(overlap);

                                  class_to_change.slots.push(new_slot);
                              })
                          })



    })

    fs.writeFile(fileName, JSON.stringify(alocation, null, 3), function writeJSON(err) {
        if (err) return res.status(500).json("error on update");
        res.status(200).json("updated");
    });



}