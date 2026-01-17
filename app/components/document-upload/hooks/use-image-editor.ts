import { useCallback, useState } from "react";
import { type CropArea } from "../../../lib/canvas-utils";

export interface ImageEditorState {
  image: HTMLImageElement | null;
  rotation: number;
  cropArea: CropArea | null;
  cropMode: boolean;
  scale: number;
  canvasSize: { width: number; height: number };
  cropScale: number;
  hasChanges: boolean;
}

export interface ImageEditorActions {
  setImage: (image: HTMLImageElement | null) => void;
  setScale: (scale: number) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  setCropArea: (area: CropArea | null) => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  enterCrop: () => void;
  applyCrop: () => void;
  cancelCrop: () => void;
  reset: () => void;
}

export function useImageEditor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cropScale, setCropScale] = useState(1);

  const rotateLeft = useCallback(() => {
    setRotation((prev) => (prev - 90 + 360) % 360);
    setCropArea(null);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
    setCropArea(null);
  }, []);

  const enterCrop = useCallback(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      setCropScale(scale);
      const margin = 0.1;
      setCropArea({
        x: canvasSize.width * margin,
        y: canvasSize.height * margin,
        width: canvasSize.width * (1 - margin * 2),
        height: canvasSize.height * (1 - margin * 2),
      });
      setCropMode(true);
    }
  }, [canvasSize, scale]);

  const applyCrop = useCallback(() => {
    setCropMode(false);
  }, []);

  const cancelCrop = useCallback(() => {
    setCropMode(false);
    setCropArea(null);
  }, []);

  const reset = useCallback(() => {
    setRotation(0);
    setCropArea(null);
    setCropMode(false);
  }, []);

  const hasChanges = rotation !== 0 || cropArea !== null;

  return {
    state: {
      image,
      rotation,
      cropArea,
      cropMode,
      scale,
      canvasSize,
      cropScale,
      hasChanges,
    } as ImageEditorState,
    actions: {
      setImage,
      setScale,
      setCanvasSize,
      setCropArea,
      rotateLeft,
      rotateRight,
      enterCrop,
      applyCrop,
      cancelCrop,
      reset,
    } as ImageEditorActions,
  };
}
