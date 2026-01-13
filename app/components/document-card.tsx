"use client";

import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { Document } from "../lib/db";
import { formatDate, formatFileSize } from "../lib/utils";

interface DocumentCardProps {
  doc: Document;
  onDelete: (id: number) => void;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
}

export default function DocumentCard({
  doc,
  onDelete,
  onClick,
  selectable = false,
  selected = false,
  onSelect,
}: DocumentCardProps) {
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(doc.id!, e.target.checked);
  };

  const handleCardClick = () => {
    if (selectable || selected) {
      onSelect?.(doc.id!, !selected);
    } else {
      onClick?.();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-background-secondary transition-shadow hover:shadow-md ${
        selected
          ? "border-accent ring-2 ring-accent"
          : "border-border"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background-tertiary">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={doc.title}
            className="h-full w-full object-cover"
          />
        )}

        {/* Checkbox - always available on hover, always visible when selected */}
        <div className={`absolute left-2 top-2 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 cursor-pointer rounded border-border-strong bg-background-secondary text-accent focus:ring-accent"
          />
        </div>

        {/* Delete button - show on hover when not selected */}
        {!selected && (
          <button
            onClick={handleDelete}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
            title="Delete document"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate font-medium text-foreground">
          {doc.title}
        </h3>
        <p className="text-xs text-foreground-muted">
          {formatDate(doc.uploadedAt)}
        </p>
        <p className="text-xs text-foreground-muted">
          {formatFileSize(doc.size)}
        </p>
      </div>
    </div>
  );
}
