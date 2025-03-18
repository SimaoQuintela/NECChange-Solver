//faço a chamada à API aqui
//escrevo as funções na utils
//importo a função da utils e o argumento da função é a resposta da API


import { useShiftDistribution } from "@/utils/UseShiftDistribution";
import ShiftPieChart from "./ShiftPieChart";
import { useOverlapData } from "@/utils/utilsChartPerUC";


export default function CombinedChart({ ucName, year }: { ucName: string, year: string }) {
  const { chartData: shiftData, loading: shiftLoading, error: shiftError } = useShiftDistribution(ucName, year);
  const { chartData: overlapData, loading: overlapLoading, error: overlapError } = useOverlapData(ucName);

  if (shiftLoading || overlapLoading) return <p>Carregando dados do gráfico...</p>;
  if (shiftError || overlapError) {
    return <p className="text-red-500">{shiftError || overlapError}</p>;
  } 

  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full">
      {/* Shift Distribution Chart */}
      <div className="flex-1 flex flex-col items-center">
        <h3 className="text-center mb-4 font-medium">Distribuição de Alunos por Turno</h3>
        {shiftData ? <ShiftPieChart data={shiftData} /> : <p className="text-center">Sem dados de distribuição por turnos.</p>}
      </div>

      {/* Overlap Chart */}
      <div className="flex-1 flex flex-col items-center">
        <h3 className="text-center mb-4 font-medium">Sobreposições por Tipo de Aula e Turno</h3>
        {overlapData ? <ShiftPieChart data={overlapData} /> : <p className="text-center">Nenhuma sobreposição encontrada.</p>}
      </div>
    </div>
  );
}