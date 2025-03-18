import { useEffect, useState } from "react";
import { UCSData } from "@/types/Types";

export function useStudentsPerUC(year: string, ucFilter?: string | null) {
  const [chartData, setChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/data/alocation.json");
        const data: Record<string, UCSData[]> = await response.json();
        const ucCounts: Record<string, number> = {};

        Object.values(data).forEach(studentSchedule => {
          const studentUCs = new Set<string>();

          studentSchedule.forEach(uc => {
            if (uc.year === year && (!ucFilter || uc.uc === ucFilter)) {
              if (!ucCounts[uc.uc]) {
                ucCounts[uc.uc] = 0;
              }
              
              if (!studentUCs.has(uc.uc)) {
                if (uc.type_class.startsWith('T')) {
                  ucCounts[uc.uc]++;
                  studentUCs.add(uc.uc);
                } else if (uc.type_class.startsWith('TP') || uc.type_class.startsWith('PL')) {
                  if (!studentSchedule.some(otherUC => 
                    otherUC.uc === uc.uc && otherUC.type_class.startsWith('T')
                  )) {
                    ucCounts[uc.uc]++;
                    studentUCs.add(uc.uc);
                  }
                }
              }
            }
          });
        });

        if (ucFilter && Object.keys(ucCounts).length === 0) {
          setChartData({
            labels: [`${ucFilter} (Sem dados)`],
            datasets: [{ label: "Número de Alunos", data: [0] }]
          });
          return;
        }

        setChartData({
          labels: Object.keys(ucCounts),
          datasets: [{ label: "Número de Alunos", data: Object.values(ucCounts) }]
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        setError("Erro ao carregar os dados.");
        setLoading(false);
      }
    }
    
    fetchData();
  }, [year, ucFilter]);

  return { chartData, loading, error };
}
