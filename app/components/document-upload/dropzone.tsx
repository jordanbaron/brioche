"use client";

import { useCallback, useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

interface DropzoneProps {
  onFiles: (files: FileList) => void;
}

export default function Dropzone({ onFiles }: DropzoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles]
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
      if (e.target.files && e.target.files.length > 0) {
        onFiles(e.target.files);
      }
    },
    [onFiles]
  );

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed p-8 transition-colors ${
        dragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleInputChange}
        />
        <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <CloudArrowUpIcon className="h-12 w-12" strokeWidth={1.5} />
          <span className="text-sm">
            Drop images here, or click to browse
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Multiple files supported
          </span>
        </div>
      </label>
    </div>
  );
}
