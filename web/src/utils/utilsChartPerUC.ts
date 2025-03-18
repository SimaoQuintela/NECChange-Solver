import { Chart } from "chart.js/auto";
import { useEffect, useState } from "react";
import { UCSData } from "@/types/Types";

export function useOverlapData(ucName: string) {
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
        
        const overlapCounts = new Map<string, number>();

        Object.entries(data).forEach(([_, studentSchedule]) => {
          const targetClasses = studentSchedule.filter(entry => entry.uc === ucName);
          if (targetClasses.length === 0) return;
          
          targetClasses.forEach(targetClass => {
            const classKey = `${targetClass.type_class}${targetClass.shift}`;

            targetClass.slots.forEach(([day, startHour, startMin, endHour, endMin]) => {
              const currentSlot = `${day}-${startHour}:${startMin}-${endHour}:${endMin}`;
              
              const hasOverlap = studentSchedule.some(otherClass => 
                otherClass.uc !== ucName && 
                otherClass.slots.some(([otherDay, otherStartHour, otherStartMin, otherEndHour, otherEndMin]) => {
                  const otherSlot = `${otherDay}-${otherStartHour}:${otherStartMin}-${otherEndHour}:${otherEndMin}`;
                  return currentSlot === otherSlot;
                })
              );

              if (hasOverlap) {
                overlapCounts.set(classKey, (overlapCounts.get(classKey) || 0) + 1);
              }
            });
          });
        });

        if (overlapCounts.size === 0) {
          setChartData(null);
        } else {
          const colorMap: Record<string, { bg: string, border: string }> = {
            T: { bg: "rgba(255, 99, 132, 0.7)", border: "rgba(255, 99, 132, 1)" },
            TP: { bg: "rgba(54, 162, 235, 0.7)", border: "rgba(54, 162, 235, 1)" },
            PL: { bg: "rgba(255, 206, 86, 0.7)", border: "rgba(255, 206, 86, 1)" }
          };

          const labels: string[] = [];
          const counts: number[] = [];
          const backgroundColors: string[] = [];
          const borderColors: string[] = [];

          Array.from(overlapCounts.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([classKey, count]) => {
            const type = classKey.replace(/[0-9]/g, '');
            labels.push(`${classKey} (${count} sobre.)`);
            counts.push(count);

            backgroundColors.push(colorMap[type]?.bg || "rgba(153, 102, 255, 0.7)");
            borderColors.push(colorMap[type]?.border || "rgba(153, 102, 255, 1)");
          });

          setChartData({
            labels,
            datasets: [
              {
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
              },
            ],
            options: {
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: "#333",
                    font: { size: 14 },
                    generateLabels: (chart: Chart) => {
                      const dataset = chart.data.datasets?.[0];
                      if (!dataset) return [];

                      const bgColors = dataset.backgroundColor as string[];
                      const borderColors = dataset.borderColor as string[];

                      return chart.data.labels?.map((label, index) => ({
                        text: label as string,
                        fillStyle: bgColors?.[index] || "rgba(0, 0, 0, 0.5)",
                        strokeStyle: borderColors?.[index] || "rgba(0, 0, 0, 1)",
                        lineWidth: 1,
                      })) || [];
                    },
                  },
                },
              },
            },
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados de sobreposição:", error);
        setError("Erro ao carregar os dados.");
        setLoading(false);
      }
    }
    fetchData();
  }, [ucName]);

  return { chartData, loading, error };
}
