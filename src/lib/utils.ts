const STAFF_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-pink-100 text-pink-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-teal-100 text-teal-800",
  "bg-red-100 text-red-800",
  "bg-yellow-100 text-yellow-800",
  "bg-indigo-100 text-indigo-800",
  "bg-emerald-100 text-emerald-800",
];

export function getStaffColor(name: string, staffNames: string[]): string {
  const idx = staffNames.indexOf(name);
  return STAFF_COLORS[idx >= 0 ? idx % STAFF_COLORS.length : 0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function parseTimeString(input: string): string {
  const s = input.trim();
  // Already in HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(s)) return s;
  // "15半" -> "15:30"
  const halfMatch = s.match(/^(\d{1,2})半$/);
  if (halfMatch) return `${halfMatch[1]}:30`;
  // "16" -> "16:00"
  const hourMatch = s.match(/^(\d{1,2})$/);
  if (hourMatch) return `${hourMatch[1]}:00`;
  // "15時30分" or "15時"
  const jpMatch = s.match(/^(\d{1,2})時(?:(\d{1,2})分?)?$/);
  if (jpMatch) return `${jpMatch[1]}:${jpMatch[2] || "00"}`;
  return s;
}
