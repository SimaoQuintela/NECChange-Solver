import { useEffect, useState } from "react";
import { UCSData, ShiftCount } from "@/types/Types";

export function useShiftDistribution(ucName: string, year: string) {
  const [chartData, setChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!ucName) return;

      try {
        setLoading(true);
        const response = await fetch("/data/alocation.json");
        const data: Record<string, UCSData[]> = await response.json();

        const studentsByShift: Record<string, Set<string>> = {};
        const shiftCombinations: Record<string, string[]> = {};

        Object.entries(data).forEach(([studentId, studentSchedule]) => {
          let studentShifts: string[] = [];

          studentSchedule.forEach(entry => {
            if (entry.uc === ucName && entry.year === year) {
              const shiftKey = `${entry.type_class}-${entry.shift}`;
              studentShifts.push(shiftKey);
              if (!studentsByShift[shiftKey]) studentsByShift[shiftKey] = new Set();
            }
          });

          if (studentShifts.length > 0) {
            studentShifts.sort();
            const combinationKey = studentShifts.join("+");
            if (!shiftCombinations[combinationKey]) shiftCombinations[combinationKey] = studentShifts;

            studentShifts.forEach(shift => studentsByShift[shift].add(studentId));
          }
        });

        const counts: ShiftCount[] = Object.entries(shiftCombinations).map(([_, shifts]) => {
          const studentsWithThisCombination = Object.entries(data)
            .filter(([_, schedule]) => {
              const studentShifts = schedule
                .filter(entry => entry.uc === ucName && entry.year === year)
                .map(entry => `${entry.type_class}-${entry.shift}`);

              return shifts.length === studentShifts.length && shifts.every(shift => studentShifts.includes(shift));
            })
            .map(([studentId]) => studentId);

          return {
            shiftLabel: shifts.map(shift => shift.replace("-", "")).join(" + "),
            count: studentsWithThisCombination.length
          };
        }).filter(item => item.count > 0);

        if (counts.length > 0) {
          const colors = [
            'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
          ];

          setChartData({
            labels: counts.map(item => `${item.shiftLabel} (${item.count} alunos)`),
            datasets: [
              {
                data: counts.map(item => item.count),
                backgroundColor: counts.map((_, index) => colors[index % colors.length]),
                borderColor: counts.map((_, index) => colors[index % colors.length].replace('0.7', '1')),
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