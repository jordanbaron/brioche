import { useCallback, useState } from "react";
import { type CropArea } from "../../../lib/canvas-utils";

export type DragHandle =
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

interface DragState {
  x: number;
  y: number;
  crop: CropArea | null;
}

const HANDLE_SIZE = 20;
const MIN_CROP_SIZE = 50;

export interface CropInteractionState {
  activeHandle: DragHandle;
  dragStart: DragState;
}

export interface CropInteractionActions {
  getHandle: (x: number, y: number, cropArea: CropArea | null) => DragHandle;
  getCursor: (handle: DragHandle) => string;
  startDrag: (x: number, y: number, cropArea: CropArea) => DragHandle;
  updateDrag: (
    x: number,
    y: number,
    canvasSize: { width: number; height: number }
  ) => CropArea | null;
  endDrag: () => void;
}

export function useCropInteraction() {
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<DragState>({
    x: 0,
    y: 0,
    crop: null,
  });

  const getHandle = useCallback(
    (x: number, y: number, cropArea: CropArea | null): DragHandle => {
      if (!cropArea) return null;

      const { x: cx, y: cy, width: cw, height: ch } = cropArea;

      // Check corners first
      if (Math.abs(x - cx) < HANDLE_SIZE && Math.abs(y - cy) < HANDLE_SIZE)
        return "top-left";
      if (
        Math.abs(x - (cx + cw)) < HANDLE_SIZE &&
        Math.abs(y - cy) < HANDLE_SIZE
      )
        return "top-right";
      if (
        Math.abs(x - cx) < HANDLE_SIZE &&
        Math.abs(y - (cy + ch)) < HANDLE_SIZE
      )
        return "bottom-left";
      if (
        Math.abs(x - (cx + cw)) < HANDLE_SIZE &&
        Math.abs(y - (cy + ch)) < HANDLE_SIZE
      )
        return "bottom-right";

      // Check edges
      if (Math.abs(y - cy) < HANDLE_SIZE && x >= cx && x <= cx + cw)
        return "top";
      if (Math.abs(y - (cy + ch)) < HANDLE_SIZE && x >= cx && x <= cx + cw)
        return "bottom";
      if (Math.abs(x - cx) < HANDLE_SIZE && y >= cy && y <= cy + ch)
        return "left";
      if (Math.abs(x - (cx + cw)) < HANDLE_SIZE && y >= cy && y <= cy + ch)
        return "right";

      // Check inside for move
      if (x > cx && x < cx + cw && y > cy && y < cy + ch) return "move";

      return null;
    },
    []
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

  const startDrag = useCallback(
    (x: number, y: number, cropArea: CropArea): DragHandle => {
      const handle = getHandle(x, y, cropArea);
      if (handle) {
        setActiveHandle(handle);
        setDragStart({ x, y, crop: { ...cropArea } });
      }
      return handle;
    },
    [getHandle]
  );

  const updateDrag = useCallback(
    (
      x: number,
      y: number,
      canvasSize: { width: number; height: number }
    ): CropArea | null => {
      if (!activeHandle || !dragStart.crop) return null;

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
          newH = Math.max(
            MIN_CROP_SIZE,
            Math.min(canvasSize.height - oy, oh + dy)
          );
          break;
        case "left":
          newX = Math.max(0, Math.min(ox + ow - MIN_CROP_SIZE, ox + dx));
          newW = ow - (newX - ox);
          break;
        case "right":
          newW = Math.max(
            MIN_CROP_SIZE,
            Math.min(canvasSize.width - ox, ow + dx)
          );
          break;
        case "top-left":
          newX = Math.max(0, Math.min(ox + ow - MIN_CROP_SIZE, ox + dx));
          newY = Math.max(0, Math.min(oy + oh - MIN_CROP_SIZE, oy + dy));
          newW = ow - (newX - ox);
          newH = oh - (newY - oy);
          break;
        case "top-right":
          newY = Math.max(0, Math.min(oy + oh - MIN_CROP_SIZE, oy + dy));
          newW = Math.max(
            MIN_CROP_SIZE,
            Math.min(canvasSize.width - ox, ow + dx)
          );
          newH = oh - (newY - oy);
          break;
        case "bottom-left":
          newX = Math.max(0, Math.min(ox + ow - MIN_CROP_SIZE, ox + dx));
          newW = ow - (newX - ox);
          newH = Math.max(
            MIN_CROP_SIZE,
            Math.min(canvasSize.height - oy, oh + dy)
          );
          break;
        case "bottom-right":
          newW = Math.max(
            MIN_CROP_SIZE,
            Math.min(canvasSize.width - ox, ow + dx)
          );
          newH = Math.max(
            MIN_CROP_SIZE,
            Math.min(canvasSize.height - oy, oh + dy)
          );
          break;
      }

      return { x: newX, y: newY, width: newW, height: newH };
    },
    [activeHandle, dragStart]
  );

  const endDrag = useCallback(() => {
    setActiveHandle(null);
  }, []);

  return {
    state: {
      activeHandle,
      dragStart,
    } as CropInteractionState,
    actions: {
      getHandle,
      getCursor,
      startDrag,
      updateDrag,
      endDrag,
    } as CropInteractionActions,
  };
}
