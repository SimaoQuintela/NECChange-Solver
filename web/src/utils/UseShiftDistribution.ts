import { useEffect, useState } from "react";
import { UCSData, ShiftCount } from "@/types/Types";
import { ChartData } from "chart.js";

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
        const response = await fetch("/data/alocation.json");
        const data: Record<string, UCSData[]> = await response.json();

        const shiftCombinations: Record<string, { shifts: string[]; count: number }> = {};

        Object.values(data).forEach((studentSchedule) => {
          const studentShifts = studentSchedule
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
            labels: counts.map(item => `${item.shiftLabel} (${item.count} alunos)`),
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

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados de turnos:", error);
        setError("Erro ao carregar os dados.");
        setLoading(false);
      }
    }

    fetchData();
  }, [ucName, year]);

  return { chartData, loading, error };
}