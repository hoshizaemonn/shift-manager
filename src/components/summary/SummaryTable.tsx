"use client";

import { useState } from "react";
import { MonthData } from "@/lib/types";
import { getStaffColor, getDaysInMonth } from "@/lib/utils";
import { Pencil, Check, X, Plus } from "lucide-react";

type Props = {
  data: MonthData;
  onRenameStaff?: (oldName: string, newName: string) => void;
  onUpdateStaffDays?: (staffName: string, dates: number[], startTime: string) => void;
};

type StaffSummary = {
  name: string;
  count: number;
  dates: number[];
  startTime: string;
};

export default function SummaryTable({ data, onRenameStaff, onUpdateStaffDays }: Props) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingDays, setEditingDays] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Set<number>>(new Set());
  const [editTime, setEditTime] = useState("");

  const totalDaysInMonth = getDaysInMonth(data.year, data.month);
  const closedDates = new Set(
    data.days.filter((d) => d.isClosed).map((d) => parseInt(d.date.split("-")[2]))
  );

  const summaryMap = new Map<string, StaffSummary>();

  for (const day of data.days) {
    if (day.isClosed) continue;
    const dayNum = parseInt(day.date.split("-")[2]);
    for (const shift of day.shifts) {
      if (!shift.name || shift.name === "?") continue;
      const existing = summaryMap.get(shift.name);
      if (existing) {
        existing.count++;
        existing.dates.push(dayNum);
        if (!existing.startTime && shift.startTime) existing.startTime = shift.startTime;
      } else {
        summaryMap.set(shift.name, {
          name: shift.name,
          count: 1,
          dates: [dayNum],
          startTime: shift.startTime || "",
        });
      }
    }
  }

  const summaries = [...summaryMap.values()].sort((a, b) => b.count - a.count);
  const totalShifts = summaries.reduce((acc, s) => acc + s.count, 0);

  const startEditingName = (name: string) => {
    setEditingName(name);
    setNewName(name);
  };

  const confirmRename = () => {
    if (editingName && newName.trim() && newName !== editingName && onRenameStaff) {
      onRenameStaff(editingName, newName.trim());
    }
    setEditingName(null);
    setNewName("");
  };

  const startEditingDays = (staff: StaffSummary) => {
    setEditingDays(staff.name);
    setSelectedDates(new Set(staff.dates));
    setEditTime(staff.startTime);
  };

  const toggleDate = (d: number) => {
    const next = new Set(selectedDates);
    if (next.has(d)) {
      next.delete(d);
    } else {
      next.add(d);
    }
    setSelectedDates(next);
  };

  const confirmDays = () => {
    if (editingDays && onUpdateStaffDays) {
      onUpdateStaffDays(editingDays, [...selectedDates].sort((a, b) => a - b), editTime);
    }
    setEditingDays(null);
  };

  if (summaries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        シフトデータがありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {summaries.map((staff) => (
          <div
            key={staff.name}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            {/* Name + count */}
            <div className="flex items-center justify-between mb-2">
              {editingName === staff.name ? (
                <div className="flex items-center gap-1 flex-1 mr-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                    autoFocus
                    className="flex-1 px-2 py-0.5 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button onClick={confirmRename} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-sm font-medium ${getStaffColor(staff.name, data.staffNames)}`}
                  >
                    {staff.name}
                  </span>
                  {onRenameStaff && (
                    <button onClick={() => startEditingName(staff.name)} className="p-1 text-gray-300 hover:text-gray-500">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">
                {staff.count}
                <span className="text-sm font-normal text-gray-500 ml-1">回</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(staff.count / data.days.filter((d) => !d.isClosed).length) * 100}%`,
                }}
              />
            </div>

            {/* Days editing */}
            {editingDays === staff.name ? (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">出勤日をタップで選択/解除:</p>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((d) => {
                    const closed = closedDates.has(d);
                    const selected = selectedDates.has(d);
                    return (
                      <button
                        key={d}
                        disabled={closed}
                        onClick={() => toggleDate(d)}
                        className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${
                          closed
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : selected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-gray-500">出勤時間:</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="例: 17:00"
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDays(null)}
                    className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={confirmDays}
                    className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-xl font-medium"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400 flex-1">
                  出勤日: {staff.dates.join("、")}日
                  {staff.startTime && ` (${staff.startTime}〜)`}
                </div>
                {onUpdateStaffDays && (
                  <button
                    onClick={() => startEditingDays(staff)}
                    className="p-1 text-gray-300 hover:text-gray-500"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between">
        <span className="font-medium">合計シフト数</span>
        <span className="text-2xl font-bold">{totalShifts}</span>
      </div>
    </div>
  );
}
