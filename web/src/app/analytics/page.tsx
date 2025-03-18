"use client";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import StudentsPerUCChart from "@/components/analytics/StudentsPerUCChart";
import DashboardCard from "@/components/analytics/DashboardCard";
import { MenuItem, Select, InputLabel, FormControl, Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { UCSData, UCItem } from "@/types/Types";
import ShiftPieChart from "@/components/analytics/ShiftPieChart";
import { useShiftDistribution } from "@/utils/UseShiftDistribution";
import { useOverlapData } from "@/utils/utilsChartPerUC";

export default function BackofficeAnalytics() {
  const [selectedUC, setSelectedUC] = useState<string>("General");
  const [ucList, setUcList] = useState<UCItem[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchUCs = async () => {
      try {
        const response = await fetch("/data/alocation.json");
        const data: Record<string, UCSData[]> = await response.json();
        const uniqueUCs = new Set<string>();

        Object.values(data).forEach(studentSchedule => {
          studentSchedule.forEach(uc => {
            uniqueUCs.add(uc.uc);
          });
        });

        const ucItems: UCItem[] = Array.from(uniqueUCs).map(ucName => ({
          id: ucName,
          name: ucName
        }));

        setUcList([
          { id: "general", name: "General" },
          ...ucItems.sort((a, b) => a.name.localeCompare(b.name))
        ]);
      } catch (error) {
        console.error("Error fetching UC data:", error);
        setUcList([{ id: "general", name: "General" }]);
      }
    };

    fetchUCs();
  }, []);

  useEffect(() => {
    const checkAvailableYears = async () => {
      if (selectedUC === "General") return;

      const yearsWithData: string[] = [];
      const response = await fetch("/data/alocation.json");
      const data: Record<string, UCSData[]> = await response.json();

      for (const year of ["1", "2", "3"]) {
        const hasData = Object.values(data).some(schedule =>
          schedule.some(uc => uc.uc === selectedUC && uc.year === year)
        );

        if (hasData) yearsWithData.push(year);
      }

      setAvailableYears(yearsWithData);
    };

    checkAvailableYears();
  }, [selectedUC]);

  return (
    <main className="h-screen bg-slate-200">
      <Head>
        <title>NECChange - Analytics</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar activeTab="Analytics" />
      <div className="h-full p-8 ml-[75px] pt-[75px] flex flex-col">
        <div className="bg-white rounded-lg shadow-md py-2 px-4 mb-6 flex justify-between items-center w-full min-h-[50px]">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="uc-select-label">Unidade Curricular</InputLabel>
              <Select
                labelId="uc-select-label"
                id="uc-select"
                value={selectedUC}
                onChange={(e) => setSelectedUC(e.target.value)}
                label="Unidade Curricular"
                sx={{ maxWidth: 200 }}
              >
                {ucList.map((uc) => (
                  <MenuItem key={uc.id} value={uc.name}>
                    {uc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>

        <div className="flex flex-col flex-grow gap-4">
          {selectedUC !== "General" && (
            <div className="flex flex-col items-center w-full gap-8">
              {/* Linha para Distribuição por Turnos e Sobreposição */}
              <div className="flex justify-center gap-8 w-full">
                {/* Container Distribuição por Turnos */}
                <div className="flex flex-col items-center justify-start bg-white shadow-md rounded-lg w-[600px] h-[400px] p-4">
                  <h2 className="text-lg font-bold text-center w-full border-b pb-2">
                    Distribuição por Turnos
                  </h2>
                  <div className="flex justify-center items-center w-full h-full">
                    <CombinedChart ucName={selectedUC} year={availableYears[0]} chartType="shift" />
                  </div>
                </div>

                {/* Container Sobreposição de Horários */}
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
            <>
              {["1", "2", "3"].map(year => (
                <DashboardCard key={`students-${year}`} title={`Alunos por Unidade Curricular (${year}º Ano)`}>
                  <StudentsPerUCChart
                    year={year}
                    color={year === "1" ? "rgba(54, 162, 235, 0.6)" : year === "2" ? "rgba(75, 192, 192, 0.6)" : "rgba(153, 102, 255, 0.6)"}
                    borderColor={year === "1" ? "rgba(54, 162, 235, 1)" : year === "2" ? "rgba(75, 192, 192, 1)" : "rgba(153, 102, 255, 1)"}
                  />
                </DashboardCard>
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}


function CombinedChart({ ucName, year, chartType }: { ucName: string, year?: string, chartType: 'shift' | 'overlap' }) {
  const { chartData: shiftData, loading: shiftLoading, error: shiftError } = useShiftDistribution(ucName, year || "");
  const { chartData: overlapData, loading: overlapLoading, error: overlapError } = useOverlapData(ucName);

  if (shiftLoading || overlapLoading) return <p>Carregando dados do gráfico...</p>;

  if (shiftError || overlapError) {
    return <p className="text-red-500">{shiftError || overlapError}</p>;
  }

  return (
    <div className="h-full flex flex-col justify-center items-center">
      {chartType === 'shift' ? (
        shiftData ? <ShiftPieChart data={shiftData} /> : <p className="text-center">Sem dados de distribuição por turnos.</p>
      ) : (
        overlapData ? <ShiftPieChart data={overlapData} /> : <p className="text-center">Nenhuma sobreposição encontrada.</p>
      )}
    </div>
  );
}
