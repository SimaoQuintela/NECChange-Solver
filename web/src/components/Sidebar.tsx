import { NeccLogo } from "@/icons/NeccLogo";
import { ScheduleLogo } from "@/icons/ScheduleLogo";
import { UploadIcon } from "@/icons/UploadIcon";
import { CourseSchedulesIcon } from "@/icons/CourseSchedulesIcon";
import { AnalyticsLogo } from "@/icons/AnalyticsLogo";
import { Button } from "@mui/material";
import Link from "next/link";
import { FaAngleDoubleRight, FaAngleDoubleLeft } from "react-icons/fa";
import axios from "axios";
import { useEffect, useState } from "react";

const sidebarData = [
  {
    title: "Upload",
    href: "/",
    icon: <UploadIcon />,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: <ScheduleLogo />,
  },
];

function Sidebar(props: { activeTab: "Schedule" | "Upload" | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAllocationsJSON, setHasAllocationsJSON] = useState(false);
  const [hasScheduleJSON, setHasScheduleJSON] = useState(false);

  useEffect(() => {
    axios
      .get("/api/status")
      .then((response) => {
        const { alocation, schedule } = response.data;
        setHasAllocationsJSON(alocation);
        setHasScheduleJSON(schedule);
      })
      .catch((error) => console.error("Erro ao buscar status:", error));
  }, []);

  return (
    <>
      <nav className="fixed z-50 w-full h-[60px] bg-[#1775B9] flex items-center justify-between shadow-md border-b box-content border-[#546069b0]">
        <Link
          href="https://necc.di.uminho.pt/"
          className="flex items-center pl-3 bg-[#1775B9] h-full w-full"
        >
          <NeccLogo />
          <span className="self-center text-white text-xl ml-3 font-semibold whitespace-nowrap">
            NECChange
          </span>
        </Link>
        <div className="flex w-[400px] justify-center bg-[#1775B9] gap-8">
          <div className="flex items-center justify-center text-white gap-2 font-bold">
            <div
              className={`w-3 h-3 ${
                hasAllocationsJSON ? "bg-green-400" : "bg-red-600"
              } rounded-full`}
            ></div>
            Allocations
          </div>
          <div className="flex items-center justify-center text-white gap-2 font-bold">
            <div
              className={`w-3 h-3 ${
                hasScheduleJSON ? "bg-green-400" : "bg-red-600"
              } rounded-full`}
            ></div>
            Schedule
          </div>
        </div>
      </nav>
      <aside
        style={{
          width: isOpen ? "200px" : "70px",
        }}
        className="absolute z-50 h-[calc(100vh-60px)] mt-[60px] overflow-hidden transition-all flex flex-col justify-between shadow-xl border-r border-[#546069b0]"
      >
        <div
          className={`h-full w-full flex flex-col transition-all ${
            isOpen ? "items-start" : "items-start"
          } pb-4 bg-gray-100`}
        >
          <ul className="flex flex-col items-start justify-start w-[200px]">
            {sidebarData.map((item) => (
              <li
                key={item.title}
                onClick={() => setIsOpen(!isOpen)}
                className={`text-gray-900 pl-[15px] py-1 w-full ${
                  props.activeTab === item.title
                    ? "bg-gray-200"
                    : "hover:bg-gray-200"
                }`}
              >
                <Link
                  href={isOpen ? item.href : "#"}
                  className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg "
                >
                  {item.icon}
                  <span
                    className="ml-3"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transition: "opacity 0.3s",
                    }}
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Button
          className="bg-gray-100 w-full"
          style={{
            backgroundColor: "#f3f4f6",
            color: "black",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FaAngleDoubleLeft className="h-5 w-5" />
          ) : (
            <FaAngleDoubleRight className="h-5 w-5" />
          )}
        </Button>
      </aside>
    </>
  );
}

export default Sidebar;
