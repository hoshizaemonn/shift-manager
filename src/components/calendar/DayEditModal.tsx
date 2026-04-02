"use client";

import { useState } from "react";
import { DayData, ShiftEntry } from "@/lib/types";
import { generateId, getStaffColor } from "@/lib/utils";
import { Plus, Trash2, X } from "lucide-react";

type Props = {
  day: DayData;
  staffNames: string[];
  onSave: (day: DayData) => void;
  onClose: () => void;
};

const TIME_OPTIONS = [
  "", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

export default function DayEditModal({ day, staffNames, onSave, onClose }: Props) {
  const [shifts, setShifts] = useState<ShiftEntry[]>(day.shifts);
  const [isClosed, setIsClosed] = useState(day.isClosed);

  const dayNum = parseInt(day.date.split("-")[2]);
  const dow = new Date(day.date).getDay();
  const dowStr = ["日", "月", "火", "水", "木", "金", "土"][dow];

  const addShift = () => {
    setShifts([...shifts, { id: generateId(), name: "", startTime: "", endTime: null }]);
  };

  const removeShift = (id: string) => {
    setShifts(shifts.filter((s) => s.id !== id));
  };

  const updateShift = (id: string, field: keyof ShiftEntry, value: string) => {
    setShifts(shifts.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    onSave({
      ...day,
      isClosed,
      shifts: isClosed ? [] : shifts,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-2xl p-5 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {dayNum}日({dowStr})
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed toggle */}
        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={isClosed}
            onChange={(e) => setIsClosed(e.target.checked)}
            className="rounded"
          />
          この日は休み
        </label>

        {/* Shifts */}
        {!isClosed && (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={shift.name}
                  onChange={(e) => updateShift(shift.id, "name", e.target.value)}
                  placeholder="名前"
                  list="staff-names"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl"
                />
                <select
                  value={shift.startTime}
                  onChange={(e) => updateShift(shift.id, "startTime", e.target.value)}
                  className="w-24 px-2 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t || "時間"}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeShift(shift.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <datalist id="staff-names">
              {staffNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>

            <button
              onClick={addShift}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              スタッフ追加
            </button>
          </div>
        )}

        {/* Current staff preview */}
        {!isClosed && shifts.filter((s) => s.name).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
            {shifts
              .filter((s) => s.name)
              .map((s) => (
                <span
                  key={s.id}
                  className={`text-xs px-2 py-0.5 rounded-full ${getStaffColor(s.name, staffNames)}`}
                >
                  {s.name}{s.startTime && ` ${s.startTime}`}
                </span>
              ))}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full mt-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}
