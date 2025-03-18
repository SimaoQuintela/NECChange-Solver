import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";

Chart.register(CategoryScale); 

export default function StudentsBarChart({ data, color, borderColor }: { data: any, color: string, borderColor: string }) {
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
          x: { type: "category" }, // ⬅ Garante que o eixo X seja categórico
        },
        plugins: {
          title: {
            display: true,
            text: "Número de Alunos por UC",
          }
        }
      }} 
    />
  );
}
