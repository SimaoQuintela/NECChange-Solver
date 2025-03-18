import alocation from "@/../public/data/alocation.json"
import schedule from "@/../public/data/schedule.json"

export type StudentNumberTypeNotNull = keyof typeof alocation;
export type StudentsNumberType = keyof typeof alocation | "";
export type StudentAlocationType<T extends keyof typeof alocation> = typeof alocation[T] | null;
export type StudentAlocationUniqueType = StudentAlocationType<"A102504">;

export type StudentAlocation = {
    uc: string;
    year: string;
    semester: string;
    type_class: string;
    shift: string;
    slots: SlotType[];
};

export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
};

export type WeekDayType = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
export type SlotType = [WeekDayType, string, string, string, string, string, string];


// Calendar Event Type
export interface EventCalendarI {
  title: string;
  year: string;
  semester: string;
  uc: string;
  type_class: "TP" | "T" | "PL";
  shift: string;
  overlap: boolean;
  allDay: boolean;
  start: Date;
  end: Date;
  room?: string;
  capacity?: number;
  allocations?: number;
};

export interface StudentsPerUCChartProps {
  year: string;
  color: string;
  borderColor: string;
  ucFilter?: string | null;
}

export interface DashboardCardProps {
  title: string;
  children: React.ReactNode; 
}

export interface UCSData {
  uc: string;
  year: string;
  semester: string;
  type_class: string;
  shift: string;
  slots: Array<[string, string, string, string, string, string, boolean]>;
}

export interface OverlapChartProps {
  ucName: string;
}

export interface ShiftDistributionChartProps {
  ucName: string;
  year: string;
}

export interface ShiftCount {
  shiftLabel: string;
  count: number;
}

export interface UCItem {
  id: string;
  name: string;
}

export type UcSchedule = typeof schedule;