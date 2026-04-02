import { MonthData } from "./types";

const STORAGE_KEY = "shift_manager_data";

export function loadMonths(): MonthData[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MonthData[];
  } catch {
    return [];
  }
}

export function saveMonths(months: MonthData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(months));
}

export function getMonth(year: number, month: number): MonthData | undefined {
  return loadMonths().find((m) => m.year === year && m.month === month);
}

export function upsertMonth(data: MonthData): void {
  const months = loadMonths();
  const idx = months.findIndex(
    (m) => m.year === data.year && m.month === data.month
  );
  if (idx >= 0) {
    months[idx] = data;
  } else {
    months.push(data);
  }
  months.sort((a, b) => a.year - b.year || a.month - b.month);
  saveMonths(months);
}

export function deleteMonth(year: number, month: number): void {
  const months = loadMonths().filter(
    (m) => !(m.year === year && m.month === month)
  );
  saveMonths(months);
}
