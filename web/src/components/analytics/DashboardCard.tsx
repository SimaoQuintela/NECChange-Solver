import { DashboardCardProps } from "@/types/Types";

export default function DashboardCard({ title, children }: DashboardCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex-1">
        <h2 className="text-md font-semibold mb-2">{title}</h2>
        <div className="h-[calc(100%-2rem)]">{children}</div>
      </div>
    );
  }
  