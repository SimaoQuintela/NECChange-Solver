import { useEffect, useState } from "react";
import data from "@/data/alocation.json";

export function useStudentsPerUC(year: number, ucFilter?: string | null) {
  const [chartData, setChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
        const ucCounts: Record<string, number> = {};

        Object.values(data).forEach(studentSchedule => {
          const studentUCs = new Set<string>();

          studentSchedule.forEach(uc => {
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
          return;
        }

        setChartData({
          labels: Object.keys(ucCounts),
          datasets: [{ label: "Número de Alunos", data: Object.values(ucCounts) }]
        });

        setLoading(false);
      
    }
    
    fetchData();
  }, [year, ucFilter]);

  return { chartData, loading};
}