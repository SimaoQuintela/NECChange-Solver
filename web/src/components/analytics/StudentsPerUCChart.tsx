import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { UCData } from "@/types/Types";
import { CategoryScale } from "chart.js";
import { StudentsPerUCChartProps } from "@/types/Types";
import { ChartData } from "@/types/Types";

Chart.register(CategoryScale);

export default function StudentsPerUCChart({ year, color, borderColor }: StudentsPerUCChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/data/alocation.json");
        const data: Record<string, UCData[]> = await response.json();
        
        const ucCounts: Record<string, number> = {};

        Object.values(data).forEach(studentSchedule => {
          const studentUCs = new Set<string>();
          
          studentSchedule.forEach(uc => {
            if (uc.year === year) {
              if (!ucCounts[uc.uc]) {
                ucCounts[uc.uc] = 0;
              }
              
              if (!studentUCs.has(uc.uc)) {
                if (uc.type_class.startsWith('T')) {
                  // Se for teórica, conta o aluno uma vez
                  ucCounts[uc.uc]++;
                  studentUCs.add(uc.uc);
                } else if (uc.type_class.startsWith('TP') || uc.type_class.startsWith('PL')) {
                  // Se for TP ou PL e não houver T, conta o aluno
                  if (!studentSchedule.some(otherUC => otherUC.uc === uc.uc && otherUC.type_class.startsWith('T'))) {
                    ucCounts[uc.uc]++;
                    studentUCs.add(uc.uc);
                  }
                }
              }
            }
          });
        });

        setChartData({
          labels: Object.keys(ucCounts),
          datasets: [
            {
              label: "Número de Alunos",
              data: Object.values(ucCounts),
              backgroundColor: color,
              borderColor: borderColor,
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      }
    }
    fetchData();
  }, [year, color, borderColor]);

  return chartData ? <Bar data={chartData} options={{ maintainAspectRatio: false }} /> : <p>Carregando gráfico...</p>;
}
