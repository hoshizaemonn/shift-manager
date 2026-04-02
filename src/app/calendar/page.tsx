"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MonthData, DayData } from "@/lib/types";
import { loadMonths, upsertMonth } from "@/lib/storage";
import { generateId, formatDate } from "@/lib/utils";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import DayEditModal from "@/components/calendar/DayEditModal";
import SummaryTable from "@/components/summary/SummaryTable";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const reload = useCallback(() => {
    setMonths(loadMonths());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload]);

  useEffect(() => {
    if (months.length > 0) {
      const latest = months[months.length - 1];
      setYear(latest.year);
      setMonth(latest.month);
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentData = useMemo(
    () => months.find((m) => m.year === year && m.month === month),
    [months, year, month]
  );

  const editingDay = useMemo(() => {
    if (!editingDate || !currentData) return null;
    return currentData.days.find((d) => d.date === editingDate) ?? null;
  }, [editingDate, currentData]);

  const saveMonthData = useCallback(
    (updated: MonthData) => {
      upsertMonth(updated);
      reload();
    },
    [reload]
  );

  const handleDaySave = useCallback(
    (updatedDay: DayData) => {
      if (!currentData) return;
      const updated: MonthData = {
        ...currentData,
        days: currentData.days.map((d) =>
          d.date === updatedDay.date ? updatedDay : d
        ),
        staffNames: [
          ...new Set(
            currentData.days
              .flatMap((d) => (d.date === updatedDay.date ? updatedDay : d).shifts)
              .map((s) => s.name)
              .filter((n) => n && n !== "?")
          ),
        ],
        updatedAt: new Date().toISOString(),
      };
      saveMonthData(updated);
      setEditingDate(null);
    },
    [currentData, saveMonthData]
  );

  const handleRenameStaff = useCallback(
    (oldName: string, newName: string) => {
      if (!currentData) return;
      const updated: MonthData = {
        ...currentData,
        days: currentData.days.map((day) => ({
          ...day,
          shifts: day.shifts.map((shift) =>
            shift.name === oldName ? { ...shift, name: newName } : shift
          ),
        })),
        staffNames: currentData.staffNames.map((n) =>
          n === oldName ? newName : n
        ),
        updatedAt: new Date().toISOString(),
      };
      saveMonthData(updated);
    },
    [currentData, saveMonthData]
  );

  const handleUpdateStaffDays = useCallback(
    (staffName: string, dates: number[], startTime: string) => {
      if (!currentData) return;
      const dateSet = new Set(dates);

      const updated: MonthData = {
        ...currentData,
        days: currentData.days.map((day) => {
          const dayNum = parseInt(day.date.split("-")[2]);
          if (day.isClosed) return day;

          const otherShifts = day.shifts.filter((s) => s.name !== staffName);

          if (dateSet.has(dayNum)) {
            // Add or keep this staff on this day
            const existing = day.shifts.find((s) => s.name === staffName);
            return {
              ...day,
              shifts: [
                ...otherShifts,
                existing
                  ? { ...existing, startTime: startTime || existing.startTime }
                  : { id: generateId(), name: staffName, startTime: startTime, endTime: null },
              ],
            };
          } else {
            // Remove this staff from this day
            return { ...day, shifts: otherShifts };
          }
        }),
        updatedAt: new Date().toISOString(),
      };

      // Update staffNames
      updated.staffNames = [
        ...new Set(
          updated.days
            .flatMap((d) => d.shifts)
            .map((s) => s.name)
            .filter((n) => n && n !== "?")
        ),
      ];

      saveMonthData(updated);
    },
    [currentData, saveMonthData]
  );

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            {year}年{month}月
          </h1>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {currentData ? (
          <>
            <div className="bg-white">
              <MonthCalendar data={currentData} onDayTap={setEditingDate} />
            </div>

            <div className="px-4 py-4 mt-2">
              <h2 className="text-base font-bold text-gray-900 mb-3">出勤集計</h2>
              <SummaryTable
                data={currentData}
                onRenameStaff={handleRenameStaff}
                onUpdateStaffDays={handleUpdateStaffDays}
              />
            </div>

            {/* Day edit modal */}
            {editingDay && (
              <DayEditModal
                day={editingDay}
                staffNames={currentData.staffNames}
                onSave={handleDaySave}
                onClose={() => setEditingDate(null)}
              />
            )}
          </>
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-gray-400 mb-2">
              {year}年{month}月のデータがありません
            </p>
            <a href="/" className="text-blue-600 text-sm hover:text-blue-800">
              シフト表を読み取る →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
