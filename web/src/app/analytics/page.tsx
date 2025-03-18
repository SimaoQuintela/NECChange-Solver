"use client";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import StudentsPerUCChart from "@/components/analytics/StudentsPerUCChart";
import ShiftDistributionChart from "@/components/analytics/chartPerUC";
import OverlapChart from "@/components/analytics/OverlapChart";
import DashboardCard from "@/components/analytics/DashboardCard";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { UCSData, UCItem } from "@/types/Types";


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
          <Dropdown>
            <DropdownTrigger>
              <Button className="bg-blue-500 text-white px-3 py-1 rounded">
                {selectedUC}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="UC Selection" 
              onAction={(key) => {
                const selected = ucList.find(uc => uc.id === key);
                if (selected) setSelectedUC(selected.name);
              }}
              className="max-h-64 overflow-y-auto"
            >
              {ucList.map((uc) => (
                <DropdownItem key={uc.id}>{uc.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex flex-col flex-grow gap-4">
          {selectedUC !== "General" && (
            <div className="flex flex-col items-center w-full gap-8">
              {/* Linha para Distribuição por Turnos e Sobreposição */}
              <div className="flex justify-center items-center w-full gap-8">
                {/* Container para gráficos */}
                <div className="flex flex-col md:flex-row justify-center items-center w-full gap-8">
                  {/* Container para gráficos de distribuição por turnos */}
                  <div className="flex flex-col justify-center items-center w-[500px] h-[500px]">
                    {availableYears.length > 0 && (
                      <div className="flex flex-col justify-center items-center w-full h-full gap-4">
                        {availableYears.slice(0, 2).map((year) => (
                          <div key={`shift-${year}`} className="w-full h-[240px]">
                            <h2 className="text-lg font-bold text-center mb-2">{`Distribuição por Turnos (${year}º Ano)`}</h2>
                            <ShiftDistributionChart ucName={selectedUC} year={year} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Container para o gráfico de sobreposição */}
                  <div className="flex flex-col justify-center items-center w-[500px] h-[500px]">
                    <h2 className="text-lg font-bold text-center mb-2">Sobreposição de Horários</h2>
                    <OverlapChart ucName={selectedUC} />
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