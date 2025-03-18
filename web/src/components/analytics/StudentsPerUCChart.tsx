import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { useStudentsPerUC } from "@/utils/useStudentsPerUC";

Chart.register(CategoryScale);

interface StudentsBarChartProps {
  data: any;
  color: string;
  borderColor: string;
}

interface StudentsPerUCChartProps {
  year: string;
  color: string;
  borderColor: string;
  ucFilter?: string | null;
}

function StudentsBarChart({ data, color, borderColor }: StudentsBarChartProps) {
  if (!data || !data.datasets || data.datasets.length === 0) {
    return <p>Sem dados para exibir no gráfico.</p>;
  }

  return (
    <Bar
      data={{
        ...data,
        datasets: [
          {
            ...data.datasets[0],
            backgroundColor: color,
            borderColor: borderColor,
            borderWidth: 1,
          },
        ],
      }}
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


export default function StudentsPerUCChart({
  year,
  color,
  borderColor,
  ucFilter = null,
}: StudentsPerUCChartProps) {
  const { chartData, loading, error } = useStudentsPerUC(year, ucFilter);

  if (loading) return <p>Carregando gráfico...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!chartData) return <p>Nenhum dado encontrado.</p>;

  return (
    
      <StudentsBarChart data={chartData} color={color} borderColor={borderColor} />
    
  );
}
