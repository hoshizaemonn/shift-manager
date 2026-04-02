"use client";

import { DayData } from "@/lib/types";
import { getStaffColor } from "@/lib/utils";

type Props = {
  day: DayData | null;
  dayNum: number | null;
  staffNames: string[];
  isToday: boolean;
  onTap?: (dateStr: string) => void;
};

export default function DayCell({ day, dayNum, staffNames, isToday, onTap }: Props) {
  if (dayNum === null) {
    return <div className="min-h-[72px]" />;
  }

  const dow = day ? new Date(day.date).getDay() : 0;
  const isSunday = dow === 0;
  const isSaturday = dow === 6;

  return (
    <div
      onClick={() => day && onTap?.(day.date)}
      className={`min-h-[72px] p-1 border-b border-r border-gray-100 cursor-pointer active:bg-blue-50 ${
        day?.isClosed ? "bg-gray-50" : ""
      }`}
    >
      <div
        className={`text-xs font-medium mb-0.5 ${
          isToday
            ? "bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center"
            : isSunday
            ? "text-red-500"
            : isSaturday
            ? "text-blue-500"
            : "text-gray-700"
        }`}
      >
        {dayNum}
      </div>

      {day?.isClosed && (
        <span className="text-[10px] text-gray-400 block">休み</span>
      )}

      {day &&
        !day.isClosed &&
        day.shifts.map((shift) => (
          <div
            key={shift.id}
            className={`text-[10px] leading-tight rounded px-0.5 mb-0.5 truncate ${getStaffColor(
              shift.name,
              staffNames
            )}`}
          >
            {shift.name}
            {shift.startTime && (
              <span className="text-[9px] opacity-70 ml-0.5">
                {shift.startTime}
              </span>
            )}
          </div>
        ))}
    </div>
  );
}
