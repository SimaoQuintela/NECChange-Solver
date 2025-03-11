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
        // + " - " + slot[5],
        year: lesson.year,
        semester: lesson.semester,
        uc: lesson.uc,
        type_class: lesson.type_class as "TP" | "T" | "PL",
        shift: lesson.shift,
        allDay: false,
        overlap: slot[6] as boolean,
        start: dates.start,
        end: dates.end,
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

  return (
    <main className="h-screen bg-slate-200 ">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Head>
        <title>NECChange</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar activeTab="Course Schedules" />
      <div className="h-full p-8 ml-[75px] pt-[75px]">
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
            isClickable={false}
          />
        </div>

        {isLoading && <Loader />}
      </div>
    </main>
  );
}
