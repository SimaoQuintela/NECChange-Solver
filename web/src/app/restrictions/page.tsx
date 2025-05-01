"use client";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import Head from "next/head";
import RowRadioButtonsGroup from "@/components/RowRadioButtonsGroup";

import { useState, useEffect } from "react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import Schedule from "@/components/schedule/calendar/Schedule";
import axios from "axios";
import {
  EventCalendarI,
  SlotType,
  StudentAlocationType,
  StudentNumberTypeNotNull,
} from "@/types/Types";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@mui/material";
import dynamicAllocationData from "@/data/dynamicAlocation.json";

export function getDates(slot: SlotType) {
  const date = new Date();
  date.toLocaleString("pt", { timeZone: "Europe/Lisbon" });

  const year = date.getFullYear();
  let month = (date.getMonth() + 1).toString();

  if (Number(month) < 10) {
    month = "0" + month;
  }

  console.log(month);

  const week = {
    Segunda: 1,
    Terça: 2,
    Quarta: 3,
    Quinta: 4,
    Sexta: 5,
    Sábado: 6,
    Domingo: 7,
  };

  let days_in_month = new Date(year, Number(month), 0).getDate();
  let day = (date.getDate() + week[slot[0]] - date.getDay()).toString();

  if (Number(day) > days_in_month) {
    day = (Number(day) % days_in_month).toString();
    month = (Number(month) + 1).toString();
    if (Number(month) < 10) {
      month = "0" + month;
    }
  }

  if (Number(day) <= 0) {
    month = (Number(month) - 1).toString();
    days_in_month = new Date(year, Number(month), 0).getDate();
    day = ((Number(day) % days_in_month) + days_in_month).toString();
    if (Number(month) < 10) {
      month = "0" + month;
    }
  }

  if (Number(day) < 10) {
    day = "0" + day;
  }

  const start = new Date(
    year + "-" + month + "-" + day + "T" + slot[1] + ":" + slot[2]
  );
  const end = new Date(
    year + "-" + month + "-" + day + "T" + slot[3] + ":" + slot[4]
  );

  return { start: start, end: end };
}

function handleEvents(data: StudentAlocationType<StudentNumberTypeNotNull>) {
  if (data === null) return [];

  const events: EventCalendarI[] = [];

  Object.values(data).map((lesson) => {
    lesson.slots.map((slot) => {
      const dates = getDates(slot as SlotType);
      const event = {
        title: lesson.type_class + lesson.shift + " - " + lesson.uc,
        year: lesson.year,
        semester: lesson.semester,
        uc: lesson.uc,
        type_class: lesson.type_class as "TP" | "T" | "PL",
        shift: lesson.shift,
        allDay: false,
        overlap: slot[6] as boolean,
        start: dates.start,
        end: dates.end,
        capacity: Number(slot[6]),
        room: typeof slot[5] === "boolean" ? "" : slot[5], // isto está completamente errado mas ns pq o room é um boolean
      };
      events.push(event);
    });
  });
  return events;
}

export default function CourseSchecules() {
  const [evt, setEvt] = useState<EventCalendarI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<string>("1º Year");
  const [hasScheduleJSON, setHasScheduleJSON] = useState(false);
  const [studentsListOpen, setStudentsListOpen] = useState(true);

  useEffect(() => {
    axios
      .get("/api/status")
      .then((response) => {
        const { alocation, schedule } = response.data;
        if (schedule == false) {
          toast.error("No schedule found. Please upload a schedule.");
        }
        setHasScheduleJSON(schedule);
      })
      .catch((error) => {
        console.error("Erro ao buscar status:", error);
      });
  }, [year]);

  const getSchedule = async () => {
    setIsLoading(true);
    try {
      const params = { year: year.match(/\d+/)?.[0] };
      const response = await axios.get("api/slots", { params });
      const evts = handleEvents(response.data.slots);
      setEvt(evts);
    } catch (error) {
      toast.error(
        "Error fetching schedule. Please ensure the schedule object is correctly formatted and uploaded."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasScheduleJSON) {
      getSchedule();
    }
  }, [hasScheduleJSON, year]);

  const deleteJson = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete("/api/dynamicAlocation");
      if (response.status === 200) {
        toast.success("JSON file deleted successfully.");
        setEvt([]);
      } else {
        toast.error("Failed to delete JSON file.");
      }
    } catch (error) {
      console.error("Error deleting JSON file:", error);
      toast.error("Error deleting JSON file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen bg-slate-200">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Head>
        <title>NECChange</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar activeTab="Course Schedules" />
      <div className="h-full pl-8 ml-[75px] pt-[60px]">
        <div className="w-full h-full flex">
          <div className="w-full">
            <div className="flex justify-between">
              <div className="flex gap-2">
                <RowRadioButtonsGroup setValue={setYear} value={year} />
              </div>
            </div>
            <Schedule
              eventsProps={evt}
              getSchedule={getSchedule}
              setIsLoading={setIsLoading}
              showCapacity={true}
              isClickable={true}
              isTrade={false}
            />
          </div>
          <div
            style={{
              width: studentsListOpen ? "300px" : "0px",
            }}
            className="h-full relative transition-all"
          >
            <div
              className="cursor-pointer absolute w-[20px] h-[50px] bg-[#1775B9] rounded-l-full -left-[20px] top-[50%] -translate-y-[50%]"
              onClick={() => setStudentsListOpen((state) => !state)}
            ></div>
            <div className="w-full h-full flex flex-col overflow-y-auto bg-white border-l-2 border-slate-300 p-2 gap-2">
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  onClick={deleteJson}
                  className="bg-[#1775B9]"
                >
                  Clear Restrictions
                </Button>
              </div>
              <DynamicAlocationCard />
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Loader />}
    </main>
  );
}

const DynamicAlocationCard = () => {
  const isEmpty = Object.keys(dynamicAllocationData).length === 0;

  return (
    <div className="flex flex-col gap-4 w-full  bg-white">
      {isEmpty ? (
        <div className="text-slate-600 text-sm text-center italic">
          There are currently no dynamic allocations available.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(dynamicAllocationData).map(([label, count]) => (
            <div
              key={label}
              className="h-[70px] w-full border-2 border-slate-300 bg-slate-100 rounded-lg flex p-3 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col justify-between w-full">
                <p className="whitespace-nowrap text-sm font-semibold truncate w-full text-gray-700">
                  {label}
                </p>
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <p className="font-bold">Allocations:</p>
                  <p>{String(count)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
