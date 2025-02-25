import { useState } from "react";
import Modal from "react-modal";

import UcEntry from "./UcEntry";
import axios from "axios";
import { EventCalendarI, StudentsNumberType } from "@/types/Types";
import Button from '@mui/material/Button';

export default function Trades({
  studentNr,
  events,
  getSchedule,
}: {
  studentNr: StudentsNumberType;
  events: EventCalendarI[];
  getSchedule: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shiftTrade, setShiftTrade] = useState<{
      uc: string;
      type_class: string;
      shift: string;
      shiftBeforeTrade: string;
    }[]
  >([]);

  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    content: {
      height: 700,
      width: 450,
      top: "50%",
      left: "50%",
      right: "50%",
      bottom: "50%",
      marginLeft: 128,
      transform: "translate(-50%, -50%)",
      borderWidth: 2,
      borderStyle: "solid",
      borderRadius: 15,
      borderColor: "rgba(0,0,0,0.7)",
    },
  };

  console.log(shiftTrade, "shiftTrade");

  const updateJson = async () => {
    const res = await axios.put("api/trade/updateJson", { studentNr: studentNr, trades: shiftTrade })

    console.log(res.data, "res");
    if (res.data.status === 200) getSchedule();

    setShiftTrade([]);
  }

  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(!isOpen)} className="bg-[#1775B9]">Trades</Button>
      <Modal
        style={customStyles}
        isOpen={isOpen}
        onRequestClose={() => {
          setIsOpen(false);
          setShiftTrade([]);
        }}
        ariaHideApp={false}
      >
        <h1 className="text-2xl font-bold text-center mb-4">Trades</h1>
        {events.map((e, index) => {
          if (e.type_class !== "T") {
            return (
              <UcEntry
                key={index}
                shift={e.shift}
                uc={e.uc}
                type_class={e.type_class}
                setShiftTrade={setShiftTrade}
              />
            );
          }
        })}
        <div className="w-full h-auto mt-1 flex justify-center">
          <button
            className="z-10 flex w-1/3 h-auto mt-3 pt-2 text-white font-bold pb-2 justify-center bg-blue-500 hover:bg-blue-600 hover:duration-300 rounded-3xl"
            onClick={() => {
              updateJson();
            }}
          >
            Submit
          </button>
        </div>
      </Modal>
    </>
  );
}
