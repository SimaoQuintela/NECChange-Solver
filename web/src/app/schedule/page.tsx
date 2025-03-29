"use client";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import Head from "next/head";
import { useState, useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Schedule from "@/components/schedule/calendar/Schedule";
import axios from "axios";
import {
  EventCalendarI,
  SlotType,
  StudentAlocationType,
  StudentNumberTypeNotNull,
  StudentsNumberType,
} from "@/types/Types";
import InputAuto from "@/components/InputAuto";
import Button from "@mui/material/Button";
import { Filter1 } from "@mui/icons-material";
import { FaFilter, FaSearch, FaSort } from "react-icons/fa";

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

export default function BackofficeSchedule() {
  const [studentNr, setStudentNr] = useState<StudentsNumberType>("");
  const [evt, setEvt] = useState<EventCalendarI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [studentKeys, setStudentKeys] = useState<string[]>([]);
  const [studentsListOpen, setStudentsListOpen] = useState(true);

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

    const res = await axios.get<{
      classes: StudentAlocationType<typeof studentNr>;
      studentNr: StudentsNumberType;
    }>(`/api/students/${studentNr}`);

    if (res.data.classes?.length === 0) {
      setEvt([]);
      setErrorMessage("No classes found for student number " + studentNr);
      setIsLoading(false);
      return;
    }

    const evts = handleEvents(res.data.classes);
    setEvt(evts);

    setIsLoading(false);
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
    setIsLoading(true);
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

    setIsLoading(false);
  };

  /**
   * @brief This function will export the year schedule to a PDF file
   * It will make a request to the server to execute the export_year_schedule.py script
   *
   * @todo Loading
   * @todo Download the file from the server
   * @returns {Promise<void>}
   */
  const handleYearSchedule = async () => {
    setIsLoading(true);
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

    setIsLoading(false);
  };

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch("/api/students/numbers");
        const data = await response.json();
        setStudentKeys(
          data.map((student: { studentNr: string }) => student.studentNr)
        );
      } catch (error) {
        console.error("Erro ao buscar estudantes:", error);
      }
    }

    fetchStudents();
  }, []);

  return (
    <main className="h-screen bg-slate-200">
      <Head>
        <title>NECChange</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar activeTab="Schedule" />
      <div className="h-full pl-8 ml-[75px] pt-[60px]">
        <div className="w-full h-full flex">
          <div className="w-full pt-4 flex flex-col">
            <Schedule
              eventsProps={evt}
              studentNr={studentNr}
              getSchedule={getSchedule}
              setIsLoading={setIsLoading}
            />

            <div className="pt-2 -ml-2">
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
            </div>
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
                  color="info"
                  variant="contained"
                  style={{
                    padding: "0px !important",
                    minWidth: "0px !important",
                    width: "40px",
                    height: "30px",
                  }}
                >
                  <FaFilter />
                </Button>
                <Button
                  color="info"
                  variant="contained"
                  className="p-0"
                  style={{
                    padding: "0px !important",
                    minWidth: "0px !important",
                    width: "40px",
                    height: "30px",
                  }}
                >
                  <FaSort />
                </Button>
                <input
                  type="text"
                  className="max-w-[150px] flex-1 border-2 border-slate-400 pl-1 outline-none"
                  placeholder="Student Number"
                />
                <Button
                  color="info"
                  variant="contained"
                  className="p-0"
                  style={{
                    padding: "0px !important",
                    minWidth: "0px !important",
                    width: "40px",
                    height: "30px",
                  }}
                >
                  <FaSearch />
                </Button>
                {/* <InputAuto
                  label="Student number"
                  options={studentKeys}
                  setStudent={setStudentNr}
                /> */}

                {/* <Button
                  variant="contained"
                  onClick={getSchedule}
                  className="bg-[#1775B9]"
                >
                  Search
                </Button> */}
              </div>
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
              <StudentCard />
            </div>
          </div>
        </div>
        {isLoading && <Loader />}

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

const StudentCard = () => {
  return (
    <div className="h-[50px] w-full border-2 border-slate-400 bg-slate-200 flex p-1 pb-0">
      <div className="flex flex-col justify-between w-full">
        <p className="whitespace-nowrap text-[0.65em] truncate w-full">
          Pedro Augusto Ennes de Martino Camargo
        </p>
        <div className="flex justify-between">
          <p className="whitespace-nowrap text-[1em] font-bold">a102504</p>
          <p>Allocations: 7</p>
          <p>Overlaps: 3</p>
        </div>
      </div>
    </div>
  );
};
