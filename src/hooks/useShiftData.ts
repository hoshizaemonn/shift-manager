"use client";

import { useState, useEffect, useCallback } from "react";
import { MonthData } from "@/lib/types";
import { loadMonths, upsertMonth } from "@/lib/storage";

export function useShiftData() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setMonths(loadMonths());
    setIsLoaded(true);
  }, []);

  const saveMonth = useCallback(
    (data: MonthData) => {
      upsertMonth(data);
      setMonths(loadMonths());
    },
    []
  );

  const getMonth = useCallback(
    (year: number, month: number) => {
      return months.find((m) => m.year === year && m.month === month);
    },
    [months]
  );

  return { months, isLoaded, saveMonth, getMonth };
}
