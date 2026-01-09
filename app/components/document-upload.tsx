"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";

export default function DocumentUpload({
  onMarkdownGenerated,
}: {
  onMarkdownGenerated: (markdown: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const ocrMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OCR failed");
      }

      const data = await response.json();
      return data.markdown;
    },
    onSuccess: (markdown) => {
      onMarkdownGenerated(markdown);
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        alert("Please upload an image or PDF file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      ocrMutation.mutate(file);
    },
    [ocrMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Upload Document
      </h2>

      <label
        className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
        } ${preview ? "p-2" : "p-8"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleInputChange}
        />

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-full max-w-full rounded object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm">
              Drop an image or PDF here, or click to browse
            </span>
          </div>
        )}
      </label>

      {ocrMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing with Mistral OCR...
        </div>
      )}

      {ocrMutation.isError && (
        <div className="text-sm text-red-500">
          Error: {ocrMutation.error.message}
        </div>
      )}
    </div>
  );
}
