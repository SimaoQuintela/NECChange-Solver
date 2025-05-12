import { useEffect, useState } from "react";
import axios from "axios";

export function useOverlapData(ucName: string) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!ucName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get("/api/alocationData");
        if (response.data && response.data.alocation) {
          const data = response.data.data;
          // Map: classKey -> { count, students }
          const overlapCounts = new Map<string, { count: number; students: string[] }>();

          Object.entries(data).forEach(([studentNumber, studentSchedule]) => {
            const typedSchedule = studentSchedule as { uc: string; type_class: string; shift: string; slots: any[] }[];
            const targetClasses = typedSchedule.filter((entry) => entry.uc === ucName);

            targetClasses.forEach(targetClass => {
              const classKey = `${targetClass.type_class}${targetClass.shift}`;
              let hasOverlap = false;

              targetClass.slots.forEach((slot) => {
                const [day, startHour, startMin, endHour, endMin] = slot;
                const currentSlot = `${day}-${startHour}:${startMin}-${endHour}:${endMin}`;
                hasOverlap = typedSchedule.some(otherClass =>
                  otherClass.uc !== ucName &&
                  otherClass.slots.some(([otherDay, otherStartHour, otherStartMin, otherEndHour, otherEndMin]) => {
                    const otherSlot = `${otherDay}-${otherStartHour}:${otherStartMin}-${otherEndHour}:${otherEndMin}`;
                    return currentSlot === otherSlot;
                  })
                );
                if (hasOverlap) {
                  const entry = overlapCounts.get(classKey) || { count: 0, students: [] };
                  if (!entry.students.includes(studentNumber)) {
                    entry.count += 1;
                    entry.students.push(studentNumber);
                  }
                  overlapCounts.set(classKey, entry);
                }
              });
            });
          });

          if (overlapCounts.size === 0) {
            setChartData(null);
          } else {
            const colorMap: Record<string, { bg: string; border: string }> = {
              T: { bg: "rgba(255, 99, 132, 0.7)", border: "rgba(255, 99, 132, 1)" },
              TP: { bg: "rgba(54, 162, 235, 0.7)", border: "rgba(54, 162, 235, 1)" },
              PL: { bg: "rgba(255, 206, 86, 0.7)", border: "rgba(255, 206, 86, 1)" }
            };
            const labels: string[] = [];
            const counts: number[] = [];
            const backgroundColors: string[] = [];
            const borderColors: string[] = [];
            const studentsPerClass: string[][] = [];

            Array.from(overlapCounts.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .forEach(([classKey, { count, students }]) => {
                const type = classKey.replace(/[0-9]/g, '');
                labels.push(`${classKey} (${count} sobre.)`);
                counts.push(count);
                backgroundColors.push(colorMap[type]?.bg || "rgba(153, 102, 255, 0.7)");
                borderColors.push(colorMap[type]?.border || "rgba(153, 102, 255, 1)");
                studentsPerClass.push(students);
              });

            setChartData({
              labels,
              datasets: [
                {
                  label: "Sobreposições",
                  data: counts,
                  backgroundColor: backgroundColors,
                  borderColor: borderColors,
                  borderWidth: 1,
                  studentsPerClass,
                }
              ],
              options: {
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      color: "#333",
                      font: { size: 14 }
                    }
                  }
                }
              }
            });
          }
        } else {
          setError("Nenhum dado encontrado.");
        }
        setLoading(false);
      } catch (error) {
        setError("Erro ao processar os dados.");
        setLoading(false);
      }
    }
    fetchData();
  }, [ucName]);

  return { chartData, loading, error };
}
