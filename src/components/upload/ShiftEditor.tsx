"use client";

import { useState } from "react";
import { DayData, MonthData, ShiftEntry } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  data: MonthData;
  onSave: (data: MonthData) => void;
};

const TIME_OPTIONS = [
  "", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

export default function ShiftEditor({ data, onSave }: Props) {
  const [monthData, setMonthData] = useState<MonthData>(data);

  const updateDay = (dateStr: string, updater: (day: DayData) => DayData) => {
    setMonthData((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.date === dateStr ? updater(d) : d)),
    }));
  };

  const addShift = (dateStr: string) => {
    updateDay(dateStr, (day) => ({
      ...day,
      shifts: [
        ...day.shifts,
        { id: generateId(), name: "", startTime: "", endTime: null },
      ],
    }));
  };

  const removeShift = (dateStr: string, shiftId: string) => {
    updateDay(dateStr, (day) => ({
      ...day,
      shifts: day.shifts.filter((s) => s.id !== shiftId),
    }));
  };

  const updateShift = (
    dateStr: string,
    shiftId: string,
    field: keyof ShiftEntry,
    value: string
  ) => {
    updateDay(dateStr, (day) => ({
      ...day,
      shifts: day.shifts.map((s) =>
        s.id === shiftId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const toggleClosed = (dateStr: string) => {
    updateDay(dateStr, (day) => ({ ...day, isClosed: !day.isClosed }));
  };

  const handleSave = () => {
    const staffNames = [
      ...new Set(
        monthData.days.flatMap((d) =>
          d.shifts.map((s) => s.name).filter((n) => n.length > 0)
        )
      ),
    ];
    onSave({
      ...monthData,
      staffNames,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {monthData.year}年{monthData.month}月のシフト
        </h2>
        <span className="text-sm text-gray-500">
          {monthData.days.filter((d) => d.shifts.length > 0).length}日分
        </span>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {monthData.days.map((day) => {
          const dayNum = parseInt(day.date.split("-")[2]);
          const dow = new Date(day.date).getDay();
          const dowStr = ["日", "月", "火", "水", "木", "金", "土"][dow];
          const isWeekend = dow === 0 || dow === 6;

          if (!day.isClosed && day.shifts.length === 0) {
            return (
              <div
                key={day.date}
                className="flex items-center gap-2 py-1 px-3 text-sm text-gray-400"
              >
                <span className={isWeekend ? "text-red-300" : ""}>
                  {dayNum}日({dowStr})
                </span>
                <button
                  onClick={() => addShift(day.date)}
                  className="text-xs text-blue-400 hover:text-blue-600"
                >
                  + 追加
                </button>
                <button
                  onClick={() => toggleClosed(day.date)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  休み
                </button>
              </div>
            );
          }

          return (
            <div
              key={day.date}
              className={`rounded-xl p-3 ${
                day.isClosed ? "bg-gray-100" : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-medium ${
                    isWeekend ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {dayNum}日({dowStr})
                </span>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={day.isClosed}
                    onChange={() => toggleClosed(day.date)}
                    className="rounded"
                  />
                  休み
                </label>
              </div>

              {!day.isClosed && (
                <div className="space-y-2">
                  {day.shifts.map((shift) => (
                    <div key={shift.id} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={shift.name}
                        onChange={(e) =>
                          updateShift(day.date, shift.id, "name", e.target.value)
                        }
                        placeholder="名前"
                        className={`min-w-0 flex-1 px-2 py-1.5 text-sm border rounded-lg ${
                          shift.name === "?"
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-gray-200"
                        }`}
                      />
                      <select
                        value={shift.startTime}
                        onChange={(e) =>
                          updateShift(day.date, shift.id, "startTime", e.target.value)
                        }
                        className="w-[80px] shrink-0 px-1 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t || "時間"}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeShift(day.date, shift.id)}
                        className="shrink-0 p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addShift(day.date)}
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    スタッフ追加
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
      >
        確定して保存
      </button>
    </div>
  );
}
