"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOcr } from "../hooks/use-ocr";

interface DocumentUploadProps {
  onMarkdownGenerated: (markdown: string) => void;
  onDocumentSaved?: (id: number) => void;
  initialPreview?: string | null;
}

export default function DocumentUpload({
  onMarkdownGenerated,
  onDocumentSaved,
  initialPreview,
}: DocumentUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const currentFileRef = useRef<File | null>(null);

  const ocr = useOcr({
    onSuccess: (markdown, documentId) => {
      onMarkdownGenerated(markdown);
      onDocumentSaved?.(documentId);
    },
  });

  // Sync preview when initialPreview prop changes (e.g., loading from dashboard)
  useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview);
    }
  }, [initialPreview]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Please upload an image or PDF file");
      return;
    }

    currentFileRef.current = file;
    setPendingFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProcess = useCallback(() => {
    const file = currentFileRef.current;
    if (file) {
      ocr.process(file);
      setPendingFile(null);
    }
  }, [ocr]);

  const handleClear = useCallback(() => {
    currentFileRef.current = null;
    setPendingFile(null);
    setPreview(null);
    ocr.reset();
  }, [ocr]);

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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Upload Document
      </h2>

      <label
        className={`flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
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
            className="h-full w-full rounded object-contain"
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

      {preview && pendingFile && !ocr.isPending && (
        <div className="flex gap-2">
          <button
            onClick={handleProcess}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Process with OCR
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        </div>
      )}

      {ocr.isPending && (
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

      {ocr.isError && (
        <div className="text-sm text-red-500">
          Error: {ocr.error?.message}
        </div>
      )}
    </div>
  );
}
