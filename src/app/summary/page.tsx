"use client";

import { useState, useMemo } from "react";
import { useShiftData } from "@/hooks/useShiftData";
import SummaryTable from "@/components/summary/SummaryTable";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SummaryPage() {
  const { months, isLoaded } = useShiftData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const currentData = useMemo(
    () => months.find((m) => m.year === year && m.month === month),
    [months, year, month]
  );

  const prevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
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
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            {year}年{month}月 集計
          </h1>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-4 py-4">
          {currentData ? (
            <SummaryTable data={currentData} />
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-400 mb-2">
                {year}年{month}月のデータがありません
              </p>
              <a
                href="/"
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                シフト表を読み取る →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
