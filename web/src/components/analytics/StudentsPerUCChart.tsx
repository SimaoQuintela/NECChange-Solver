import { useStudentsPerUC } from "@/app/api/analytics/useStudentsPerUC";
import StudentsBarChart from "./StudentsBarChart";

export default function StudentsPerUCChart({ 
  year, 
  color, 
  borderColor, 
  ucFilter = null 
}: { year: string, color: string, borderColor: string, ucFilter?: string | null }) {
  
  const { chartData, loading, error } = useStudentsPerUC(year, ucFilter);

  if (loading) return <p>Carregando gráfico...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!chartData) return <p className="text-center">Nenhum dado encontrado.</p>;

  return <StudentsBarChart data={chartData} color={color} borderColor={borderColor} />;
}