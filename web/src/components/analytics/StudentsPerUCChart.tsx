import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { useStudentsPerUC } from "@/utils/useStudentsPerUC";

Chart.register(CategoryScale);

interface StudentsPerUCChartProps {
  year: string;
  color: string;
  borderColor: string;
  ucFilter?: string | null;
}

export default function StudentsPerUCChart({
  year,
  color,
  borderColor,
  ucFilter = null,
}: StudentsPerUCChartProps) {
  const { chartData, loading} = useStudentsPerUC(year, ucFilter);

  if (loading) {
    return (
      <div className="animate-pulse flex gap-10 justify-between items-end h-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="bg-gray-200 h-10 w-44 rounded" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const chartConfig = {
    ...chartData,
    datasets: [
      {
        ...chartData.datasets[0],
        backgroundColor: color,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Bar
      data={chartConfig}
      options={{
        maintainAspectRatio: false,
        scales: {
          x: { type: "category" },
        },
        plugins: {
          title: {
            display: true,
            text: "Número de Alunos por UC",
          },
        },
      }}
    />
  );
}
