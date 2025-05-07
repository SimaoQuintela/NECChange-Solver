import { useEffect, useState } from "react";
import { ShiftCount } from "@/types/Types";
import { ChartData } from "chart.js";
import axios from "axios"; // Importa o axios

export function useShiftDistribution(ucName: string, year: string) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!ucName || !year) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Chama a API para obter os dados
        const response = await axios.get("/api/alocationData");
        if (response.data && response.data.alocation) {
          const data = response.data.data
          const shiftCombinations: Record<string, { shifts: string[]; count: number }> = {};

          // Processa os dados como antes
          Object.values(data).forEach((studentSchedule) => {
            const typedSchedule = studentSchedule as { uc: string; year: string; type_class: string; shift: string }[];
            const studentShifts = typedSchedule
              .filter(entry => entry.uc === ucName && entry.year === year)
              .map(entry => `${entry.type_class}-${entry.shift}`)
              .sort();

            if (studentShifts.length > 0) {
              const combinationKey = studentShifts.join("+");
              if (!shiftCombinations[combinationKey]) {
                shiftCombinations[combinationKey] = { shifts: studentShifts, count: 0 };
              }
              shiftCombinations[combinationKey].count++;
            }
          });

          const counts: ShiftCount[] = Object.values(shiftCombinations)
            .map(({ shifts, count }) => ({
              shiftLabel: shifts.map(shift => shift.replace("-", "")).join(" + "),
              count,
            }))
            .filter(item => item.count > 0);

          if (counts.length > 0) {
            const generateColor = (index: number) => `hsl(${(index * 137) % 360}, 70%, 60%)`;

            setChartData({
              labels: counts.map(item => `${item.shiftLabel} (${item.count} al.)`),
              datasets: [
                {
                  data: counts.map(item => item.count),
                  backgroundColor: counts.map((_, index) => generateColor(index)),
                  borderColor: counts.map((_, index) => generateColor(index)),
                  borderWidth: 1,
                },
              ],
            });
          } else {
            setChartData(null);
          }
        } else {
          setError("Nenhum dado encontrado.");
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao processar dados de turnos:", error);
        setError("Erro ao processar os dados.");
        setLoading(false);
      }
    }

    fetchData();
  }, [ucName, year]);

  return { chartData, loading, error };
}
