"use client";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import Head from "next/head";

import { useState, useEffect } from "react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import Trades from "@/components/schedule/Trades/Trades";
import Schedule from "@/components/schedule/calendar/Schedule";
import axios from "axios";
import { EventCalendarI, SlotType, StudentAlocationType, StudentNumberTypeNotNull, StudentsNumberType } from "@/types/Types";

function getDates(
  slot: SlotType
) {
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

  //console.log({ "start": year + "-" + month + "-" + day + "T" + slot[1] + ":" + slot[2] });
  //console.log({ "end": year + "-" + month + "-" + day + "T" + slot[3] + ":" + slot[4] });

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
        type_class: lesson.type_class,
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

export default function BackofficeSchedule() {
  const [studentNr, setStudentNr] = useState<StudentsNumberType>("");
  const [evt, setEvt] = useState<EventCalendarI[]>([]);
  const [isLoadingExportAll, setIsLoadingExportAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExportNotification, setShowExportNotification] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showExportNotification || errorMessage) {
      timer = setTimeout(() => {
        setShowExportNotification(false);
        setErrorMessage(null);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [showExportNotification, errorMessage]);


  /**
   * @brief This function gets the schedule of a student
   * It will make a request to the server to get the schedule of the student stored as JSON
   * generated from the parser. It will then call the handleEvents function to convert the
   * JSON into an array of events that can be displayed on the calendar.
   * 
   * @returns {Promise<void>}
   */
  const getSchedule = async () => {
    if (studentNr === "") return;

    const res = await axios.get<
      { classes: StudentAlocationType<typeof studentNr>, studentNr: StudentsNumberType }
    >(`/api/students/${studentNr}`);

    if (res.data.classes?.length === 0) {
      setEvt([]);
      setErrorMessage("No classes found for student number " + studentNr);
      return;
    }

    const evts = handleEvents(res.data.classes);
    setEvt(evts);
  };

  /**
   * @brief This function will export all the classes of all students to a PDF file
   * It will make a request to the server to execute the export_all.py script
   * 
   * @todo Loading
   * @todo Download the file as .zip from the server
   * @returns {Promise<void>}
   */
  const handleExportAll = async () => {
    setIsLoadingExportAll(true);
    try {
      const res = await axios.post("/api/export/all");
      
      if (res.data.status === 200) {
        console.log(res.data);
        setShowExportNotification(true);
      } 
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred during exportation.");
    }

    setIsLoadingExportAll(false);
  }


  /**
   * @brief This function will export the year schedule to a PDF file
   * It will make a request to the server to execute the export_year_schedule.py script
   * 
   * @todo Loading
   * @todo Download the file from the server
   * @returns {Promise<void>}
   */
  const handleYearSchedule = async () => {
    setIsLoadingExportAll(true);
    try {
      const res = await axios.post("/api/export/year_schedule");

      if (res.data.status === 200) {
        console.log(res.data);
        setShowExportNotification(true);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred during exportation.");
    }

    setIsLoadingExportAll(false);
  }

  return (
    <main className="h-screen bg-slate-200 ">
      <Head>
        <title>NECChange</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar />
      <div className="h-full p-8 ml-64">
        <div className="w-full">
          <input
            type="text"
            className="rounded-lg"
            value={studentNr}
            onChange={(e) => setStudentNr(e.target.value as StudentsNumberType)}
            placeholder="Student number"
          />
          <button
            type="button"
            className="bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 ml-2 rounded-lg"
            onClick={getSchedule}
          >
            Search
          </button>
          <Trades
            studentNr={studentNr}
            events={evt}
            getSchedule={getSchedule}
          />
          <Schedule events={evt} />
        </div>

        <button
          className="bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 ml-2 rounded-lg mt-2 "
          onClick={handleExportAll}
        >
          Export All to PDF
        </button>

        <button
          className="bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 ml-2 rounded-lg mt-2 "
          onClick={handleYearSchedule}
        >
          Export Year Schedule
        </button>

        {isLoadingExportAll && <Loader />}

        {showExportNotification && (
          <div className="fixed top-0 right-0 m-6 p-4 bg-green-500 text-white rounded shadow-lg">
            Export successful!
          </div>
        )}

        {errorMessage && (
          <div className="fixed top-0 right-0 m-6 p-4 bg-red-500 text-white rounded shadow-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}
