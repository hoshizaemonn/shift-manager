"use client";

import { useCallback, useRef } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

type Props = {
  files: File[];
  previews: string[];
  onFilesChanged: (files: File[], previews: string[]) => void;
  isLoading: boolean;
};

export default function ImageUploader({
  files,
  previews,
  onFilesChanged,
  isLoading,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
      const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
      onFilesChanged([...files, ...imageFiles], [...previews, ...newPreviews]);
    },
    [files, previews, onFilesChanged]
  );

  const removeFile = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previews[index]);
      onFilesChanged(
        files.filter((_, i) => i !== index),
        previews.filter((_, i) => i !== index)
      );
    },
    [files, previews, onFilesChanged]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  return (
    <div className="space-y-4">
      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previews.map((url, i) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={`シフト表 ${i + 1}`}
                className="w-full h-32 object-cover rounded-xl border border-gray-200"
              />
              {!isLoading && (
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {i + 1}枚目
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
          transition-colors duration-200
          ${
            isLoading
              ? "border-gray-300 bg-gray-50 pointer-events-none"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }
        `}
      >
        <div className="space-y-2">
          <div className="flex justify-center gap-3">
            <Camera className="w-8 h-8 text-gray-400" />
            <ImagePlus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-sm">
            {previews.length === 0
              ? "シフト表の写真をタップして選択"
              : "さらに追加する"}
          </p>
          <p className="text-xs text-gray-400">
            複数枚まとめて選択OK
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
