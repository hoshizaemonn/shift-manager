"use client";

import { MonthData } from "@/lib/types";
import { getDaysInMonth, getFirstDayOfWeek } from "@/lib/utils";
import DayCell from "./DayCell";

type Props = {
  data: MonthData;
  onDayTap?: (dateStr: string) => void;
};

const DAY_HEADERS = ["日", "月", "火", "水", "木", "金", "土"];

export default function MonthCalendar({ data, onDayTap }: Props) {
  const totalDays = getDaysInMonth(data.year, data.month);
  const firstDow = getFirstDayOfWeek(data.year, data.month);

  const today = new Date();
  const todayStr =
    today.getFullYear() === data.year && today.getMonth() + 1 === data.month
      ? today.getDate()
      : -1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayMap = new Map(data.days.map((d) => [d.date, d]));

  return (
    <div>
      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={`text-center text-xs font-medium py-1.5 border-b border-gray-200 ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((dayNum, i) => {
          const m = String(data.month).padStart(2, "0");
          const d = dayNum ? String(dayNum).padStart(2, "0") : "00";
          const dateStr = `${data.year}-${m}-${d}`;
          const dayData = dayNum ? dayMap.get(dateStr) ?? null : null;

          return (
            <DayCell
              key={i}
              day={dayData}
              dayNum={dayNum}
              staffNames={data.staffNames}
              isToday={dayNum === todayStr}
              onTap={onDayTap}
            />
          );
        })}
      </div>
    </div>
  );
}
