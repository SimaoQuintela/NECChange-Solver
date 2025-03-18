import { Pie } from "react-chartjs-2";

export default function ShiftPieChart({ data }: { data: any }) {
  return (
    <div className="flex-grow">
      <Pie 
        data={data} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 15, padding: 15 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1); // 1 casa decimal

                  return `${label}: ${value} alunos (${percentage}%)`;
                }
              }
            }
          }
        }}
      />
    </div>
  );
}
