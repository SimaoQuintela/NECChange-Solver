import { useOverlapData } from "@/app/api/analytics/routeOverlapChart";
import ShiftPieChart from "./ShiftPieChart";

//juntar ao chartPerUC.tsx

export default function OverlapChart({ ucName }: { ucName: string }) {
  const { chartData, loading, error } = useOverlapData(ucName);

  if (loading) return <p>Carregando dados de sobreposição...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!chartData) return <p className="text-center">Nenhuma sobreposição encontrada.</p>;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-center mb-4 font-medium">Sobreposições por Tipo de Aula e Turno</h3>
      <ShiftPieChart data={chartData} />
    </div>
  );
}
