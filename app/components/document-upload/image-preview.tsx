"use client";

import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { ImageItem } from "./types";
import StatusBadge from "./status-badge";

interface ImagePreviewProps {
  image: ImageItem;
  currentIndex: number;
  totalImages: number;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
}

export default function ImagePreview({
  image,
  currentIndex,
  totalImages,
  onPrev,
  onNext,
  onEdit,
}: ImagePreviewProps) {
  const showArrows = totalImages > 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 p-2 dark:border-zinc-700">
      <img
        src={image.previewUrl}
        alt="Preview"
        className="h-full w-full rounded object-contain"
      />

      {showArrows && (
        <>
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 disabled:opacity-30"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalImages - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 disabled:opacity-30"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {totalImages > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          {currentIndex + 1} of {totalImages}
        </div>
      )}

      <StatusBadge status={image.status} />

      {image.status === "pending" && (
        <button
          onClick={onEdit}
          className="absolute left-2 top-2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70"
          title="Edit image"
        >
          <PencilSquareIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
