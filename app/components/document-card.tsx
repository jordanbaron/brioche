"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Document } from "../lib/db";
import { formatDate, formatFileSize } from "../lib/utils";

interface DocumentCardProps {
  doc: Document;
  onDelete: (id: number) => void;
}

export default function DocumentCard({ doc, onDelete }: DocumentCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(doc.blob);
    setThumbnailUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [doc.blob]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${doc.title}"?`)) {
      onDelete(doc.id!);
    }
  };

  return (
    <Link
      href={`/?doc=${doc.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={doc.title}
            className="h-full w-full object-cover"
          />
        )}
        <button
          onClick={handleDelete}
          className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
          title="Delete document"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-100">
          {doc.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(doc.uploadedAt)}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatFileSize(doc.size)}
        </p>
      </div>
    </Link>
  );
}
