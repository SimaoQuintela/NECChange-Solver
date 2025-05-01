"use client";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment-timezone";
import moment from "moment";
import "@/styles/Home.module.css";
import { EventCalendarI, SlotType, UcSchedule } from "@/types/Types";
import axios from "axios";
import { useEffect, useState } from "react";
import { getDates } from "@/app/schedule/page";
import roomsAllocations from "@/data/roomsAllocations.json";
import PopUp from "@/components/PopUp";

moment.tz.setDefault("Europe/Lisbon");

const localizer = momentLocalizer(moment);

type RoomAllocationsUc = keyof typeof roomsAllocations;
type RoomAllocationsType =
  keyof (typeof roomsAllocations)[keyof typeof roomsAllocations];

const CustomEvent = ({ event }: { event: EventCalendarI }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div>{event.title}</div>
      <div
        style={{
          marginTop: "auto",
          fontSize: "0.8em",
          textAlign: "right",
        }}
      >
        Capacity - {event.capacity}
      </div>
    </div>
  );
};

export default function Schedule({
  eventsProps,
  studentNr,
  getSchedule,
  setIsLoading,
  showCapacity = false,
  isClickable = true,
  isTrade = true,
}: {
  eventsProps: EventCalendarI[];
  studentNr?: string;
  getSchedule: () => Promise<void>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showCapacity?: boolean;
  isClickable?: boolean;
  isTrade?: boolean;
}) {
  const [viewType, setViewType] = useState<"student" | "ucShifts">("student");
  const [eventSelected, setEventSelected] = useState<EventCalendarI | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [roomsData, setRoomsData] = useState<{
    [key in RoomAllocationsUc]: {
      [key in RoomAllocationsType]: {
        rooms: string[];
        capacity: number[];
        allocations: number;
      };
    };
    } | null>(null);

  const [ucSelected, setUcSelected] = useState<{
    uc: string;
    type: "TP" | "T" | "PL";
    currentShift: string;
  }>();

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

  useEffect(() => {
    const getRoomData = async () => {
      const response = await axios.get<
        {
          [key in RoomAllocationsUc]: {
            [key in RoomAllocationsType]: {
              rooms: string[];
              capacity: number[];
              allocations: number;
            };
          };
        }
      >("/api/rooms");
      setRoomsData(response.data);
    };

    getRoomData();
  }, []);

  // console.log(roomsData, "roomData");

  const getUcShifts = async (
    uc: string,
    type: "TP" | "T" | "PL",
    currentShift: string
  ) => {
    if (!roomsData) return;


    // console.log(uc);
    const response = await axios.get<UcSchedule>(`/api/ucs/${uc}`);

    const ucShifts = response.data
      .filter((shift) => shift.type_class === type)
      .map((shift) =>
        shift.slots.map((slot) => {
          const dates = getDates(slot as SlotType);

          const roomData = roomsData[
            shift.uc as unknown as RoomAllocationsUc
          ][
            (shift.type_class + shift.shift) as unknown as RoomAllocationsType
          ] as {
            rooms: string[];
            capacity: number[];
            allocations: number;
          };

          const roomIndex = roomData.rooms.indexOf(
            slot[5].toString().split("Ed")[1]
          );

          return {
            title:
              shift.type_class +
              shift.shift +
              " - " +
              roomData.allocations +
              "/" +
              roomData.capacity[roomIndex],
            year: shift.year,
            semester: shift.semester,
            uc: shift.uc,
            type_class: shift.type_class as "TP" | "T" | "PL",
            shift: shift.shift,
            allDay: false,
            overlap: slot[6] as unknown as boolean,
            start: dates.start,
            end: dates.end,
            room: roomData.rooms[roomIndex],
            capacity: roomData.capacity[roomIndex],
            allocations: roomData.allocations,
          };
        })
      )
      .flat() as EventCalendarI[];

    // TODO: Notify user that there are no shifts available
    // Toast notification Camargo
    if (ucShifts.length === 0) return;

    setUcSelected({
      uc,
      type,
      currentShift,
    });
    setViewType("ucShifts");
    setEvents({ ...events, ucShifts: [...events.student, ...ucShifts] });

    // console.log(ucShifts);
    return response.data;
  };

  // console.log(events.student, "eventssssss");

  const updateJson = async (uc: string, type_class: string, shift: string) => {
    // If user clicks in a shift that is not the selected one, do nothing
    // This is to prevent the user from clicking in a shift that is not the selected one
    if (ucSelected?.uc !== uc) return;
    if (ucSelected.currentShift == shift && ucSelected.type == type_class) return;

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
      await axios.post("api/students/update_overlaps", {
        studentNumber: studentNr?.toUpperCase(),
      });
      getSchedule();
    }

    setIsLoading(false);
  };

  return (
    <div className="mr-6">
      <Calendar
        toolbar={false}
        localizer={localizer}
        style={{
          height: "85vh",
          marginTop: "10px",
          borderRadius: "8px",
          background: "#fff",
        }}
        defaultDate={new Date()}
        defaultView={"work_week"}
        views={["day", "work_week"]}
        dayLayoutAlgorithm={"no-overlap"}
        min={minDate}
        onSelectEvent={
          !isClickable
            ? undefined
            : isTrade
            ? (event,e) => {
                e.preventDefault();
                e.stopPropagation();

                if (viewType === "student") {
                  getUcShifts(event.uc, event.type_class, event.shift);
                } else {
                  updateJson(event.uc, event.type_class, event.shift);
                  setViewType("student");
                  setEvents({ ...events, ucShifts: [] });
                }
              }
            : (event) => {
                setEventSelected(event);
                setOpen(true);
              }
        }
        selectable
        max={maxDate}
        components={
          showCapacity
            ? {
                event: CustomEvent,
              }
            : {}
        }
        events={viewType === "student" ? events.student : events.ucShifts}
        eventPropGetter={(event) => {
          // console.log(event)
          let color = "";
          const isSwap =
            event.title ==
            event.type_class +
              event.shift +
              " - " +
              event.allocations +
              "/" +
              event.capacity;

          // If the event is overlapping with another event the color is gray
          if (event.overlap === true && viewType == "student") {
            color = "#A0A0A0";
          } else {
            // If the event is the sleected item in the calendar
            if (isSwap && event.allocations && event.capacity) {
              if (event.allocations === event.capacity) {
                color = "#000";
              } else if (event.allocations < event.capacity) {
                color = "#0e5f0e";
              } else {
                color = "#ff0000";
              }
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
      {open && (
        <PopUp
          event={eventSelected as EventCalendarI}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
}
