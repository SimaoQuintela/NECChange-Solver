import { useShiftDistribution } from "@/app/api/analytics/route";
import ShiftPieChart from "./ShiftPieChart";

//faço a chamada à API aqui
//escrevo as funções na utils
//importo a função da utils e o argumento da função é a resposta da API

export default function ShiftDistributionChart({ ucName, year }: { ucName: string, year: string }) {
  const { chartData, loading, error } = useShiftDistribution(ucName, year);

  if (loading) return <p>Carregando distribuição por turnos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!chartData) return null;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-center mb-4 font-medium">Distribuição de Alunos por Turno</h3>
      <ShiftPieChart data={chartData} />
    </div>
  );
}