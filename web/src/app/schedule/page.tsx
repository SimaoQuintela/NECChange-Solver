"use client";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import Head from "next/head";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Schedule from "@/components/schedule/calendar/Schedule";
import axios from "axios";
import {
  EventCalendarI,
  SlotType,
  StudentAlocationType,
  StudentNumberTypeNotNull,
  StudentsNumberType,
  StudentType,
} from "@/types/Types";
import Button from "@mui/material/Button";
import { FaFilter, FaSort } from "react-icons/fa";

interface StudentData {
  name: string;
  number: string;
  alocations: number;
  overlaps: number;
}

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
  // filters
  const [isOpen, setIsOpen] = useState(false);
  const [searchBox, setSearchBox] = useState<string>("");
  const [allocation, setAllocation] = useState<number>(10);
  const [overlaps, setOverlaps] = useState<number>(5);
  const [allocationFilter, setAllocationFilter] = useState<boolean>(false);
  const [overlapsFilter, setOverlapsFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<keyof typeof sorts>("allocation");
  const [Students, setStudents] = useState<StudentType | null>(null);
  const [studentNr, setStudentNr] = useState<StudentsNumberType>("");
  const [evt, setEvt] = useState<EventCalendarI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [, setStudentKeys] = useState<string[]>([]);
  const [studentsListOpen, setStudentsListOpen] = useState(true);


  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch("/api/students/get_json");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }

    fetchStudents();
  }, []);

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

  useEffect(() => {
    getSchedule();
  }, [studentNr])

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

    // Update the studentNr state with the selected student number
    // In "background" (not loading)
    const response = await fetch("/api/students/get_json");
    const data = await response.json();
    setStudents(data);
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

  if (!Students) {
    return (
      <div className="h-screen bg-slate-200">
        <Head>
          <title>NECChange</title>
          <link rel="icon" href="logos/necc-blue.svg" />
        </Head>
        <Sidebar activeTab="Schedule" />
        <div className="h-full pl-8 ml-[75px] pt-[60px]">
          <Loader />
        </div>
      </div>
    )
  }

  const studentsArray = Object.keys(Students);

  const filters = {
    allocation: (allocation: number) => (student: StudentData) =>
      student.alocations > allocation,
    overlaps: (overlaps: number) => (student: StudentData) =>
      student.overlaps > overlaps,
    number: (number: string) => (student: StudentData) =>
      student.number.toLowerCase().includes(number.toLowerCase()),
    name: (name: string) => (student: StudentData) =>
      student.name.toLowerCase().includes(name.toLowerCase()),
  };

  const sorts = {
    allocation: (studentA: StudentData, studentB: StudentData) => {
      if (studentA.alocations > studentB.alocations) return -1;
      if (studentA.alocations < studentB.alocations) return 1;
      return 0;
    },
    overlaps: (studentA: StudentData, studentB: StudentData) => {
      if (studentA.overlaps > studentB.overlaps) return -1;
      if (studentA.overlaps < studentB.overlaps) return 1;
      return 0;
    },
  };

  const everyFilters = [
    allocationFilter ? filters.allocation(allocation) : () => true,
    overlapsFilter ? filters.overlaps(overlaps) : () => true,
  ];
  const someFilters = [filters.number(searchBox), filters.name(searchBox)];

  // Filter and sort the students based on the active filters and sorting criteria
  const filteredStudents = studentsArray
    .filter((student) => {
      const studentData = Students[student as keyof typeof Students];

      return (
        everyFilters.every((filter) => filter(studentData)) &&
        someFilters.some((filter) => filter(studentData))
      );
    })
    .sort((studentA, studentB) =>
      sorts[sortBy](
        Students[studentA as keyof typeof Students],
        Students[studentB as keyof typeof Students]
      )
    );

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
            {isOpen && (
              <div className="absolute top-2 -left-[190px] w-[200px] bg-white z-50 rounded shadow-lg flex flex-col border border-slate-300">
                <div className="flex items-center justify-between bg-[#1775B9] text-white p-2 rounded-t">
                  <input
                    type="checkbox"
                    className="border-2 border-white pl-1 outline-none"
                    placeholder="Search"
                    onChange={(e) => setAllocationFilter(e.target.checked)}
                    checked={allocationFilter}
                  />
                  <label className="text-sm font-semibold">
                    Filter by Allocations
                  </label>
                </div>
                {allocationFilter && (
                  <div>
                    <input
                      type="number"
                      className="w-full border-2 border-slate-400 pl-1 outline-none"
                      placeholder="Allocations"
                      onChange={(e) => {
                        setAllocation(Number(e.target.value));
                      }}
                      value={allocation}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between bg-[#1775B9] text-white p-2 border-t">
                  <div className="flex items-center justify-between w-full">
                    <input
                      type="checkbox"
                      className="border-2 border-white pl-1 outline-none"
                      placeholder="Search"
                      onChange={(e) => setOverlapsFilter(e.target.checked)}
                      checked={overlapsFilter}
                    />
                    <label className="text-sm font-semibold">
                      Filter by Overlaps
                    </label>
                  </div>
                </div>
                {overlapsFilter && (
                  <div>
                    <input
                      type="number"
                      className="w-full border-2 border-slate-400 pl-1 outline-none"
                      placeholder="Allocations"
                      onChange={(e) => {
                        setOverlaps(Number(e.target.value));
                      }}
                      value={overlaps}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="relative w-full h-full flex flex-col overflow-y-auto bg-white border-l-2 border-slate-300 p-2 gap-2">
              <div className="flex gap-2">
                <Button
                  color="info"
                  variant="contained"
                  className="flex-1"
                  style={{
                    padding: "0px !important",
                    minWidth: "40px !important",
                    width: "40px",
                    height: "30px",
                  }}
                  onClick={() => setIsOpen((state) => !state)}
                >
                  <FaFilter />
                </Button>
                <div className="relative group flex-1">
                  <Button
                    color="info"
                    variant="contained"
                    className="p-0 relative"
                    style={{
                      padding: "0px !important",
                      minWidth: "0px !important",
                      width: "40px",
                      height: "30px",
                    }}
                    onClick={() => {
                      const sortModes = Object.keys(sorts);
                      const currentIndex = sortModes.indexOf(sortBy);
                      const nextIndex = (currentIndex + 1) % sortModes.length;
                      setSortBy(sortModes[nextIndex] as keyof typeof sorts);
                    }}
                  >
                    <FaSort />
                  </Button>

                  <div className="absolute -left-1/2 min-w-[100px] z-50 bg-black border border-slate-400 text-[10px] text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Sort by: <span className="font-bold ml-1">{sortBy}</span>
                  </div>
                </div>
                <input
                  type="text"
                  className="max-w-[175px] flex-1 border-2 border-slate-400 pl-1 outline-none"
                  placeholder="Search"
                  onChange={(e) => setSearchBox(e.target.value)}
                  value={searchBox}
                />
              </div>
              {filteredStudents.map((student) => {
                return (
                  <StudentCard
                    studentData={Students[student as keyof typeof Students]}
                    setStudentNr={setStudentNr}
                    getSchedule={getSchedule}
                    key={student}
                  />
                );
              })}
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

const StudentCard = ({
  studentData,
  setStudentNr,
  // getSchedule,
}: {
  studentData: {
    name: string;
    number: string;
    alocations: number;
    overlaps: number;
  };
  setStudentNr: Dispatch<SetStateAction<StudentsNumberType>>;
  getSchedule: () => Promise<void>;
}) => {
  return (
    <div
      className="cursor-pointer bg-[#1775B9] hover:bg-[#134c75] border border-blue-300 relative rounded-lg shadow-md p-4 font-sans"
      onClick={() => {
        setStudentNr(studentData.number.toLocaleUpperCase() as StudentsNumberType);
        // getSchedule();
      }}
    >
      {studentData.overlaps > 0 && (
        <div className="absolute right-3 top-2 text-white px-1 rounded-lg text-xl font-bold bg-red-600">
          !
        </div>
      )}
      <h4 className="text-base font-bold mb-1 text-white">
        {studentData.name}
      </h4>
      <div className="font-semibold mb-1 text-white/90">
        {studentData.number}
      </div>
      <div className="text-white text-sm">
        Allocations: {studentData.alocations} &nbsp;&nbsp; Overlaps:{" "}
        <span className="p-1 rounded-md font-bold">{studentData.overlaps}</span>
      </div>
    </div>
  );
};
