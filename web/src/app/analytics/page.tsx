"use client";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import StudentsPerUCChart from "@/components/analytics/StudentsPerUCChart";
import DashboardCard from "@/components/analytics/DashboardCard";

export default function BackofficeAnalytics() {
  return (
    <main className="h-screen bg-slate-200">
      <Head>
        <title>NECChange - Analytics</title>
        <link rel="icon" href="logos/necc-blue.svg" />
      </Head>
      <Sidebar activeTab="Analytics" />
      <div className="h-full p-8 ml-[75px] pt-[75px] flex flex-col">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md py-2 px-4 mb-6 flex justify-between items-center w-full min-h-[50px]">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <div className="bg-blue-500 text-white px-3 py-1 rounded">General</div>
        </div>
        
        {/* Charts Container */}
        <div className="flex flex-col flex-grow gap-4">
          <DashboardCard title="Alunos por Unidade Curricular (1º Ano)">
            <StudentsPerUCChart year="1" color="rgba(54, 162, 235, 0.6)" borderColor="rgba(54, 162, 235, 1)" />
          </DashboardCard>
          
          <DashboardCard title="Alunos por Unidade Curricular (2º Ano)">
            <StudentsPerUCChart year="2" color="rgba(75, 192, 192, 0.6)" borderColor="rgba(75, 192, 192, 1)" />
          </DashboardCard>
          
          <DashboardCard title="Alunos por Unidade Curricular (3º Ano)">
            <StudentsPerUCChart year="3" color="rgba(153, 102, 255, 0.6)" borderColor="rgba(153, 102, 255, 1)" />
          </DashboardCard>
        </div>
      </div>
    </main>
  );
}
