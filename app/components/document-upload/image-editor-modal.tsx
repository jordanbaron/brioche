"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  XMarkIcon,
  ScissorsIcon,
} from "@heroicons/react/24/outline";
import {
  type CropArea,
  drawRotatedImage,
  drawCropOverlay,
  getRotatedDimensions,
  calculateScale,
  exportEditedImage,
} from "../../lib/canvas-utils";

type DragHandle =
  | "move"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | null;

interface ImageEditorModalProps {
  imageUrl: string | null;
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

const HANDLE_SIZE = 20;
const MIN_CROP_SIZE = 50;

export default function ImageEditorModal({
  imageUrl,
  onSave,
  onClose,
}: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, crop: null as CropArea | null });
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageUrl) {
      setRotation(0);
      setImage(null);
      setCropMode(false);
      setCropArea(null);
      return;
    }

    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: imgWidth, height: imgHeight } = getRotatedDimensions(image, rotation);
    const containerRect = container.getBoundingClientRect();
    const newScale = calculateScale(imgWidth, imgHeight, containerRect.width - 32, containerRect.height - 32);
    setScale(newScale);

    const newCanvasWidth = imgWidth * newScale;
    const newCanvasHeight = imgHeight * newScale;
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
    setCanvasSize({ width: newCanvasWidth, height: newCanvasHeight });

    drawRotatedImage(ctx, image, rotation, newScale);

    if (cropArea && cropMode) {
      drawCropOverlay(ctx, cropArea);
    }
  }, [image, rotation, cropArea, cropMode]);

  const getHandle = useCallback(
    (x: number, y: number): DragHandle => {
      if (!cropArea) return null;

      const { x: cx, y: cy, width: cw, height: ch } = cropArea;

      // Check corners first
      if (Math.abs(x - cx) < HANDLE_SIZE && Math.abs(y - cy) < HANDLE_SIZE) return "top-left";
      if (Math.abs(x - (cx + cw)) < HANDLE_SIZE && Math.abs(y - cy) < HANDLE_SIZE) return "top-right";
      if (Math.abs(x - cx) < HANDLE_SIZE && Math.abs(y - (cy + ch)) < HANDLE_SIZE) return "bottom-left";
      if (Math.abs(x - (cx + cw)) < HANDLE_SIZE && Math.abs(y - (cy + ch)) < HANDLE_SIZE) return "bottom-right";

      // Check edges
      if (Math.abs(y - cy) < HANDLE_SIZE && x > cx && x < cx + cw) return "top";
      if (Math.abs(y - (cy + ch)) < HANDLE_SIZE && x > cx && x < cx + cw) return "bottom";
      if (Math.abs(x - cx) < HANDLE_SIZE && y > cy && y < cy + ch) return "left";
      if (Math.abs(x - (cx + cw)) < HANDLE_SIZE && y > cy && y < cy + ch) return "right";

      // Check inside for move
      if (x > cx && x < cx + cw && y > cy && y < cy + ch) return "move";

      return null;
    },
    [cropArea]
  );

  const getCursor = useCallback((handle: DragHandle): string => {
    switch (handle) {
      case "top":
      case "bottom":
        return "ns-resize";
      case "left":
      case "right":
        return "ew-resize";
      case "top-left":
      case "bottom-right":
        return "nwse-resize";
      case "top-right":
      case "bottom-left":
        return "nesw-resize";
      case "move":
        return "move";
      default:
        return "default";
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!cropMode || !canvasRef.current || !cropArea) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const handle = getHandle(x, y);
      if (handle) {
        setActiveHandle(handle);
        setDragStart({ x, y, crop: { ...cropArea } });
      }
    },
    [cropMode, cropArea, getHandle]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!activeHandle || !dragStart.crop) {
        if (cropMode && cropArea) {
          const handle = getHandle(x, y);
          canvasRef.current.style.cursor = getCursor(handle);
        }
        return;
      }

      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      const { x: ox, y: oy, width: ow, height: oh } = dragStart.crop;

      let newX = ox;
      let newY = oy;
      let newW = ow;
      let newH = oh;

      switch (activeHandle) {
        case "move":
          newX = Math.max(0, Math.min(canvasSize.width - ow, ox + dx));
          newY = Math.max(0, Math.min(canvasSize.height - oh, oy + dy));
          break;
        case "top":
          newY = Math.max(0, Math.min(oy + oh - MIN_CROP_SIZE, oy + dy));
          newH = oh - (newY - oy);
          break;
        case "bottom":
          newH = Math.max(MIN_CROP_SIZE, Math.min(canvasSize.height - oy, oh + dy));
          break;
        case "left":
          newX = Math.max(0, Math.min(ox + ow - MIN_CROP_SIZE, ox + dx));
          newW = ow - (newX - ox);
          break;
        case "right":
          newW = Math.max(MIN_CROP_SIZE, Math.min(canvasSize.width - ox, ow + dx));
          break;
        case "top-left":
          newX = Math.max(0, Math.min(ox + ow - MIN_CROP_SIZE, ox + dx));
          newY = Math.max(0, Math.min(oy + oh - MIN_CROP_SIZE, oy + dy));
          newW = ow - (newX - ox);
          newH = oh - (newY - oy);
          break;
        case "top-right":
          newY = Math.max(0, Math.min(oy + oh - MIN_CROP_SIZE, oy + dy));
          newW = Math.max(MIN_CROP_SIZE, Math.min(canvasSize.width - ox, ow + dx));
          newH = oh - (newY - oy);
          break;
        case "bottom-left":
          newX = Math.max(0, Math.min(ox + ow - MIN_CROP_SIZE, ox + dx));
          newW = ow - (newX - ox);
          newH = Math.max(MIN_CROP_SIZE, Math.min(canvasSize.height - oy, oh + dy));
          break;
        case "bottom-right":
          newW = Math.max(MIN_CROP_SIZE, Math.min(canvasSize.width - ox, ow + dx));
          newH = Math.max(MIN_CROP_SIZE, Math.min(canvasSize.height - oy, oh + dy));
          break;
      }

      setCropArea({ x: newX, y: newY, width: newW, height: newH });
    },
    [activeHandle, dragStart, cropMode, cropArea, canvasSize, getHandle, getCursor]
  );

  const handleMouseUp = useCallback(() => {
    setActiveHandle(null);
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => (prev - 90 + 360) % 360);
    setCropArea(null);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
    setCropArea(null);
  }, []);

  const handleToggleCrop = useCallback(() => {
    if (!cropMode && canvasSize.width > 0 && canvasSize.height > 0) {
      const margin = 0.1;
      setCropArea({
        x: canvasSize.width * margin,
        y: canvasSize.height * margin,
        width: canvasSize.width * (1 - margin * 2),
        height: canvasSize.height * (1 - margin * 2),
      });
      setCropMode(true);
    } else {
      setCropMode(false);
      setCropArea(null);
    }
  }, [cropMode, canvasSize]);

  const handleSave = useCallback(async () => {
    if (!image) return;

    try {
      const blob = await exportEditedImage(image, rotation, cropArea, scale);
      onSave(blob);
      onClose();
    } catch (error) {
      console.error("Failed to export image:", error);
    }
  }, [image, rotation, cropArea, scale, onSave, onClose]);

  const handleReset = useCallback(() => {
    setRotation(0);
    setCropArea(null);
    setCropMode(false);
  }, []);

  const hasChanges = rotation !== 0 || cropArea !== null;

  return (
    <Dialog.Root open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-4 flex flex-col overflow-hidden rounded-xl bg-zinc-50 shadow-xl md:inset-8 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Edit Image
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div
            ref={containerRef}
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 p-6"
          >
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-full max-w-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleRotateLeft}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
                Rotate Left
              </button>
              <button
                onClick={handleRotateRight}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ArrowUturnRightIcon className="h-4 w-4" />
                Rotate Right
              </button>
              <button
                onClick={handleToggleCrop}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  cropMode
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <ScissorsIcon className="h-4 w-4" />
                {cropMode ? "Cancel Crop" : "Crop"}
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
