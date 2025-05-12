import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useRef } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ShiftPieChart({
  data,
  onElementClick,
  width = 350,
  height = 350,
}: {
  data: any;
  onElementClick?: (index: number) => void;
  width?: number;
  height?: number;
}) {
  const chartRef = useRef<any>(null);

  const handleClick = (event: any) => {
    if (!chartRef.current || !onElementClick) return;
    const points = chartRef.current.getElementsAtEventForMode(
      event.nativeEvent,
      "nearest",
      { intersect: true },
      true
    );
    if (points.length > 0) {
      onElementClick(points[0].index);
    }
  };

  return (
    <div
      style={{
        width: width,
        height: height,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Pie
        ref={chartRef}
        data={data}
        options={{
          ...data.options,
          maintainAspectRatio: false,
          responsive: false,
        }}
        width={width}
        height={height}
        onClick={handleClick}
      />
    </div>
  );
}
