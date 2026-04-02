export type ShiftEntry = {
  id: string;
  name: string;
  startTime: string;
  endTime: string | null;
};

export type DayData = {
  date: string;
  isClosed: boolean;
  shifts: ShiftEntry[];
};

export type MonthData = {
  id: string;
  year: number;
  month: number;
  days: DayData[];
  staffNames: string[];
  createdAt: string;
  updatedAt: string;
};
