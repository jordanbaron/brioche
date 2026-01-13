"use client";

import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  XMarkIcon,
  ScissorsIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface EditorToolbarProps {
  cropMode: boolean;
  hasChanges: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onEnterCrop: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onReset: () => void;
}

export default function EditorToolbar({
  cropMode,
  hasChanges,
  onRotateLeft,
  onRotateRight,
  onEnterCrop,
  onApplyCrop,
  onCancelCrop,
  onReset,
}: EditorToolbarProps) {
  if (cropMode) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onCancelCrop}
          className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
        >
          <XMarkIcon className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={onApplyCrop}
          className="flex items-center gap-2 rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          <CheckIcon className="h-4 w-4" />
          Apply Crop
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button
        onClick={onRotateLeft}
        className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
        Rotate Left
      </button>
      <button
        onClick={onRotateRight}
        className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
        Rotate Right
      </button>
      <button
        onClick={onEnterCrop}
        className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
      >
        <ScissorsIcon className="h-4 w-4" />
        Crop
      </button>
      {hasChanges && (
        <button
          onClick={onReset}
          className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
        >
          Reset
        </button>
      )}
    </div>
  );
}
