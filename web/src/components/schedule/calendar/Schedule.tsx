import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment-timezone";
import moment from "moment";
import "@/styles/Home.module.css";
import { EventCalendarI, SlotType, UcSchedule } from "@/types/Types";
import axios from "axios";
import { useEffect, useState } from "react";
import { getDates } from "@/app/schedule/page";

moment.tz.setDefault("Europe/Lisbon");

const localizer = momentLocalizer(moment);

export default function Schedule({
  eventsProps,
  studentNr,
  getSchedule,
  setIsLoading,
}: {
  eventsProps: EventCalendarI[];
  studentNr: string;
  getSchedule: () => Promise<void>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [viewType, setViewType] = useState<"student" | "ucShifts">("student");

  const [events, setEvents] = useState<{
    student: EventCalendarI[];
    ucShifts: EventCalendarI[];
  }>({
    student: eventsProps,
    ucShifts: [],
  });

  useEffect(() => {
    setEvents({ ...events, student: eventsProps });
  }, [eventsProps]);

  const minDate = new Date();
  minDate.setHours(8, 0, 0);

  const maxDate = new Date();
  maxDate.setHours(20, 0, 0);

  const getUcShifts = async (uc: string, type: "TP" | "T" | "PL", currentShift: string) => {
    // console.log(uc);
    const response = await axios.get<UcSchedule>(`/api/ucs/${uc}`);

    const ucShifts = response.data
      .filter((shift) => shift.type_class === type && shift.shift !== currentShift)
      .map((shift) =>
        shift.slots.map((slot) => {
          const dates = getDates(slot as SlotType);
          return {
            title: shift.type_class + shift.shift,
            year: shift.year,
            semester: shift.semester,
            uc: shift.uc,
            type_class: shift.type_class as "TP" | "T" | "PL",
            shift: shift.shift,
            allDay: false,
            overlap: slot[6] as unknown as boolean,
            start: dates.start,
            end: dates.end,
          };
        })
      )
      .flat() as EventCalendarI[];

    // TODO: Notify user that there are no shifts available
    if (ucShifts.length === 0) return;

    setViewType("ucShifts");
    setEvents({ ...events, ucShifts: [...events.student, ...ucShifts] });

    // console.log(ucShifts);
    return response.data;
  };

  const updateJson = async (uc: string, type_class: string, shift: string) => {
    setIsLoading(true);
    const shiftTrade = {
      uc,
      type_class,
      shift,
      shiftBeforeTrade:
        events.student.find(
          (event) => event.uc === uc && event.type_class === type_class
        )?.shift ?? "",
    };

    const res = await axios.put("api/trade/updateJson", {
      studentNr: studentNr,
      trades: [shiftTrade],
    });

    console.log(res.data, "res");

    if (res.data.status === 200) {
      getSchedule();
      return;
    }

    setIsLoading(false);
  };

  return (
    <div>
      <Calendar
        toolbar={false}
        localizer={localizer}
        style={{
          height: "80vh",
          marginTop: "10px",
          borderRadius: "8px",
          background: "#fff",
        }}
        defaultDate={new Date()}
        defaultView={"work_week"}
        views={["day", "work_week"]}
        min={minDate}
        onSelectEvent={(event) => {
          if (viewType === "student") {
            getUcShifts(event.uc, event.type_class, event.shift);
          } else {
            updateJson(event.uc, event.type_class, event.shift);
            setViewType("student");
            setEvents({ ...events, ucShifts: [] });
          }
        }}
        selectable
        max={maxDate}
        events={viewType === "student" ? events.student : events.ucShifts}
        eventPropGetter={(event) => {
          // console.log(event)
          let color = "";
          const isSwap = event.title == event.type_class + event.shift;

          // If the event is overlapping with another event the color is gray
          if (event.overlap === true && viewType == "student") {
            color = "#A0A0A0";
          } else {
            // If the event is the sleected item in the calendar
            if (isSwap) {
              color = "#000";
            } else if (event.year === "1") {
              // If the class is a theoretical class the color is blue, otherwise it is light blue
              if (event.type_class === "T") color = "#0066CC";
              else color = "#3f6bcc";
            } else if (event.year === "2") {
              // If the class is a theoretical class the color is red, otherwise it is orange
              if (event.type_class === "T") color = "#ff291d";
              else color = "#ff540e";
            } else if (event.year === "3") {
              // If the class is a theoretical class the color is green, otherwise it is light green
              if (event.type_class === "T") color = "#4C9900";
              else color = "#00990e";
            }
          }

          // If the view is the ucShifts view the color with opacity
          if (viewType === "ucShifts" && !isSwap) color += "80";

          const newStyle = {
            border: "solid",
            borderColor: "white",
            borderWidth: "2px",
            backgroundColor: color,
            fontWeight: "",
            borderRadius: "6px",
            margin: "0px",
          };
          return { style: newStyle };
        }}
        className="bg-white font-sans"
      />
    </div>
  );
}
