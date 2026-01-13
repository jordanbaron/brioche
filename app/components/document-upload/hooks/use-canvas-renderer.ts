import { useEffect, type RefObject } from "react";
import {
  type CropArea,
  drawRotatedImage,
  drawCropOverlay,
  getRotatedDimensions,
  calculateScale,
} from "../../../lib/canvas-utils";

interface UseCanvasRendererOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  image: HTMLImageElement | null;
  rotation: number;
  cropArea: CropArea | null;
  cropMode: boolean;
  cropScale: number;
  onScaleChange: (scale: number) => void;
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

export function useCanvasRenderer({
  canvasRef,
  containerRef,
  image,
  rotation,
  cropArea,
  cropMode,
  cropScale,
  onScaleChange,
  onCanvasSizeChange,
}: UseCanvasRendererOptions): void {
  useEffect(() => {
    if (!image || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: imgWidth, height: imgHeight } = getRotatedDimensions(
      image,
      rotation
    );
    const containerRect = container.getBoundingClientRect();

    // If crop is applied (not in crop mode but cropArea exists), show cropped preview
    if (cropArea && !cropMode) {
      // Use the scale from when crop was created
      const originalScale = cropScale;

      // Convert crop coordinates to original image space
      const srcX = cropArea.x / originalScale;
      const srcY = cropArea.y / originalScale;
      const srcW = cropArea.width / originalScale;
      const srcH = cropArea.height / originalScale;

      // Calculate display scale for the cropped region
      const displayScale = calculateScale(
        srcW,
        srcH,
        containerRect.width - 32,
        containerRect.height - 32
      );

      canvas.width = srcW * displayScale;
      canvas.height = srcH * displayScale;
      onCanvasSizeChange({ width: canvas.width, height: canvas.height });

      // Create temp canvas with full rotated image at original size
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCanvas.width = imgWidth;
        tempCanvas.height = imgHeight;
        tempCtx.translate(imgWidth / 2, imgHeight / 2);
        tempCtx.rotate((rotation * Math.PI) / 180);
        tempCtx.drawImage(image, -image.width / 2, -image.height / 2);

        // Draw cropped region scaled to fit
        ctx.drawImage(
          tempCanvas,
          srcX,
          srcY,
          srcW,
          srcH,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    } else {
      // Normal view or crop mode
      const newScale = calculateScale(
        imgWidth,
        imgHeight,
        containerRect.width - 32,
        containerRect.height - 32
      );
      onScaleChange(newScale);

      const newCanvasWidth = imgWidth * newScale;
      const newCanvasHeight = imgHeight * newScale;
      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;
      onCanvasSizeChange({ width: newCanvasWidth, height: newCanvasHeight });

      drawRotatedImage(ctx, image, rotation, newScale);

      if (cropArea && cropMode) {
        drawCropOverlay(ctx, cropArea);
      }
    }
  }, [
    image,
    rotation,
    cropArea,
    cropMode,
    cropScale,
    canvasRef,
    containerRef,
    onScaleChange,
    onCanvasSizeChange,
  ]);
}
