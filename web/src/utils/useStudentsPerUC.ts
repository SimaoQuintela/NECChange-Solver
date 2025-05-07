import { useEffect, useState } from "react";
import axios from "axios"; // Importa o axios

export function useStudentsPerUC(year: number, ucFilter?: string | null) {
  const [chartData, setChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/alocationData");
        
        if (response.data && response.data.alocation) {
          const data = response.data.data; 

          const ucCounts: Record<string, number> = {};

          (Object.values(data) as any[][]).forEach((studentSchedule: any[]) => {
            const studentUCs = new Set<string>();

            studentSchedule.forEach((uc: { year: number; uc: string; type_class: string }) => {
              if (Number(uc.year) === year && (!ucFilter || uc.uc === ucFilter)) {
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
          } else {
            setChartData({
              labels: Object.keys(ucCounts),
              datasets: [{ label: "Número de Alunos", data: Object.values(ucCounts) }]
            });
          }

        } else {
          setChartData({
            labels: ["Sem dados disponíveis"],
            datasets: [{ label: "Número de Alunos", data: [0] }]
          });
        }

        setLoading(false);

      } catch (error) {
        console.error("Erro ao processar os dados:", error);
        setChartData({
          labels: ["Erro ao carregar dados"],
          datasets: [{ label: "Número de Alunos", data: [0] }]
        });
        setLoading(false);
      }
    }
    
    fetchData();
  }, [year, ucFilter]);

  return { chartData, loading };
}
