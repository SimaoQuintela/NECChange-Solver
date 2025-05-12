"use client";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import StudentsPerUCChart from "@/components/analytics/StudentsPerUCChart";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useState, useEffect } from "react";
import { UCItem } from "@/types/Types";
import ShiftPieChart from "@/components/analytics/ShiftPieChart";
import { useShiftDistribution } from "@/utils/UseShiftDistribution";
import { useOverlapData } from "@/utils/utilsChartPerUC";
import axios from "axios";
import Modal from "@/components/analytics/Modal";
import { useRef} from "react";

export default function BackofficeAnalytics() {
  const [selectedUC, setSelectedUC] = useState<string>("General");
  const [ucList, setUcList] = useState<UCItem[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [alocationData, setAlocationData] = useState<any>(null);
  const [statusAlocation, setStatusAlocation] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("/api/alocationData")
      .then((response) => {
        const { alocation, data } = response.data;
        if (alocation == true) {
          setAlocationData(data);
          setStatusAlocation(true);
        }
        console.log("Dados de alocação:", alocationData);
      })
      .catch((error) => {
        console.error("Erro ao buscar status:", error);
      });
  }, []);

  useEffect(() => {
    if (!alocationData) return;

    const loadUCs = () => {
      try {
        const uniqueUCs = new Set<string>();

        Object.values(alocationData).forEach((studentSchedule: any) => {
          studentSchedule.forEach((uc: any) => {
            uniqueUCs.add(uc.uc);
          });
        });

        const ucItems: UCItem[] = Array.from(uniqueUCs).map((ucName) => ({
          id: ucName,
          name: ucName,
        }));

        setUcList([
          { id: "general", name: "General" },
          ...ucItems.sort((a, b) => a.name.localeCompare(b.name)),
        ]);
      } catch (error) {
        console.error("Erro ao processar dados das UCs:", error);
        setUcList([{ id: "general", name: "General" }]);
      }
    };

    loadUCs();
  }, [alocationData]);

  useEffect(() => {
    const checkAvailableYears = () => {
      if (selectedUC === "General" || !alocationData) return;

      const yearsWithData: string[] = [];

      for (const year of ["1", "2", "3"]) {
        const hasData = Object.values(alocationData).some((schedule: any) =>
          schedule.some((uc: any) => uc.uc === selectedUC && uc.year === year)
        );

        if (hasData) yearsWithData.push(year);
      }

      setAvailableYears(yearsWithData);
    };

    checkAvailableYears();
  }, [selectedUC, alocationData]);

  const ucData = [
    {
      year: 1,
      title: "Alunos por Unidade Curricular 1º Ano",
      color: "rgba(54, 162, 235, 0.6)",
    },
    {
      year: 2,
      title: "Alunos por Unidade Curricular 2º Ano",
      color: "rgba(75, 192, 192, 0.6)",
    },
    {
      year: 3,
      title: "Alunos por Unidade Curricular 3º Ano",
      color: "rgba(153, 102, 255, 0.6)",
    },
  ];

  return (
    <main className="h-screen bg-slate-200">
      <Head>
        <title>NECChange - Analytics</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar activeTab="Analytics" />
      <div className="h-full p-8 ml-[75px] pt-[75px] flex flex-col">
        <div className="bg-white rounded-lg shadow-md py-2 px-4 mb-6 flex justify-between items-center w-full">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <div className="w-[21%]">
            <FormControl fullWidth>
              <InputLabel id="uc-select-label">Unidade Curricular</InputLabel>
              <Select
                labelId="uc-select-label"
                id="uc-select"
                value={selectedUC}
                onChange={(e) => setSelectedUC(e.target.value)}
                label="Unidade Curricular"
                sx={{ maxWidth: 400 }}
              >
                {ucList.map((uc) => (
                  <MenuItem key={uc.id} value={uc.name}>
                    {uc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        {!statusAlocation ? (
          <h1>No data to show, need to generate an allocation first</h1>
        ) : (
          <div className="flex flex-col flex-grow gap-4">
            {selectedUC !== "General" && (
              <div className="flex flex-col items-center w-full gap-8">
                <div className="flex justify-center gap-8 w-full">
                  <div className="flex flex-col items-center justify-start bg-white shadow-md rounded-lg w-[600px] h-[400px] p-4">
                    <h2 className="text-lg font-bold text-center w-full border-b pb-2">
                      Distribuição por Turnos
                    </h2>
                    <div className="flex justify-center items-center w-full h-full">
                      <CombinedChart
                        ucName={selectedUC}
                        year={availableYears[0]}
                        chartType="shift"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-start bg-white shadow-md rounded-lg w-[600px] h-[400px] p-4">
                    <h2 className="text-lg font-bold text-center w-full border-b pb-2">
                      Sobreposição de Horários
                    </h2>
                    <div className="flex justify-center items-center w-full h-full">
                      <CombinedChart ucName={selectedUC} chartType="overlap" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedUC === "General" && (
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between h-full">
                {ucData.map(({ year, title, color }) => (
                  <div key={year}>
                    <h2 className="text-md font-semibold mb-10">{title}</h2>
                    <div>
                      <StudentsPerUCChart year={year} color={color} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function CombinedChart({
  ucName,
  year,
  chartType,
}: {
  ucName: string;
  year?: string;
  chartType: "shift" | "overlap";
}) {
  const { chartData: shiftData } = useShiftDistribution(ucName, year || "");
  const { chartData: overlapData } = useOverlapData(ucName);

  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<string[]>([]);

  const handlePieClick = (index: number) => {
    if (!overlapData) return;
    const studentsArr = overlapData.datasets[0].studentsPerClass[index] || [];
    setStudents(studentsArr);
    setShowModal(true);
  };

  return (
    <>
      {chartType === "shift" ? (
        shiftData ? (
<ShiftPieChart data={shiftData} width={350} height={350} />
        ) : (
          <div>Sem dados de distribuição por turnos.</div>
        )
      ) : overlapData ? (
        <>
          <ShiftPieChart data={overlapData} onElementClick={handlePieClick} width={350} height={350} />

          <Modal show={showModal} close={() => setShowModal(false)} students={students} />
        </>
      ) : (
        <div>Nenhuma sobreposição encontrada.</div>
      )}
    </>
  );
}

