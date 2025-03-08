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

export type WeekDayType = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
export type SlotType = [WeekDayType, string, string, string, string, string, boolean];


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

export type UcSchedule = typeof schedule;