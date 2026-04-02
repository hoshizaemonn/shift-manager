"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MonthData } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { useShiftData } from "@/hooks/useShiftData";
import ImageUploader from "@/components/upload/ImageUploader";
import ShiftEditor from "@/components/upload/ShiftEditor";
import { Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const { saveMonth } = useShiftData();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<MonthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const handleFilesChanged = useCallback((newFiles: File[], newPreviews: string[]) => {
    setFiles(newFiles);
    setPreviews(newPreviews);
  }, []);

  const handleExtract = async () => {
    if (files.length === 0) return;
    setIsExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file, i) => {
        formData.append(`image_${i}`, file);
      });
      formData.append("year", String(year));
      formData.append("month", String(month));

      const res = await fetch("/api/shifts/extract", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error);
        return;
      }

      const monthData: MonthData = {
        id: generateId(),
        year: result.data.year || year,
        month: result.data.month || month,
        days: result.data.days.map(
          (d: { date: string; isClosed: boolean; shifts: Array<{ name: string; startTime: string }> }) => {
            // Default: Tuesday(2) and Wednesday(3) are closed if no shifts
            const dow = new Date(d.date).getDay();
            const isDefaultClosed = (dow === 2 || dow === 3) && d.shifts.length === 0;
            return {
              ...d,
              isClosed: d.isClosed || isDefaultClosed,
              shifts: d.shifts.map(
                (s: { name: string; startTime: string }) => ({
                  ...s,
                  id: generateId(),
                  endTime: null,
                })
              ),
            };
          }
        ),
        staffNames: result.data.staffNames || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExtractedData(monthData);
    } catch {
      setError("読み取りに失敗しました。もう一度お試しください。");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = (data: MonthData) => {
    saveMonth(data);
    router.push("/calendar");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          シフト読み取り
        </h1>

        {!extractedData ? (
          <div className="space-y-6">
            <ImageUploader
              files={files}
              previews={previews}
              onFilesChanged={handleFilesChanged}
              isLoading={isExtracting}
            />

            {files.length > 0 && (
              <>
                <p className="text-sm text-gray-500 text-center">
                  {files.length}枚の画像を選択中
                </p>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      年
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                    >
                      {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(
                        (y) => (
                          <option key={y} value={y}>
                            {y}年
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      月
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m}月
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {files.length}枚を読み取り中...
                    </>
                  ) : (
                    `AIで読み取り開始（${files.length}枚）`
                  )}
                </button>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => {
                setExtractedData(null);
                setFiles([]);
                setPreviews([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← 画像を再アップロード
            </button>
            <ShiftEditor data={extractedData} onSave={handleSave} />
          </div>
        )}
      </div>
    </div>
  );
}
