export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rotation: number,
  scale: number
): void {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
}

export function drawCropOverlay(
  ctx: CanvasRenderingContext2D,
  cropArea: CropArea
): void {
  const canvas = ctx.canvas;

  // Darken outside crop area
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, cropArea.y);
  ctx.fillRect(
    0,
    cropArea.y + cropArea.height,
    canvas.width,
    canvas.height - cropArea.y - cropArea.height
  );
  ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
  ctx.fillRect(
    cropArea.x + cropArea.width,
    cropArea.y,
    canvas.width - cropArea.x - cropArea.width,
    cropArea.height
  );

  // White border
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  // Corner handles
  ctx.fillStyle = "white";
  const corners = [
    { x: cropArea.x, y: cropArea.y },
    { x: cropArea.x + cropArea.width, y: cropArea.y },
    { x: cropArea.x, y: cropArea.y + cropArea.height },
    { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
  ];
  corners.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Edge handles (bars)
  const barLength = 30;
  const barThickness = 4;

  // Top and bottom bars
  ctx.fillRect(
    cropArea.x + cropArea.width / 2 - barLength / 2,
    cropArea.y - barThickness / 2,
    barLength,
    barThickness
  );
  ctx.fillRect(
    cropArea.x + cropArea.width / 2 - barLength / 2,
    cropArea.y + cropArea.height - barThickness / 2,
    barLength,
    barThickness
  );

  // Left and right bars
  ctx.fillRect(
    cropArea.x - barThickness / 2,
    cropArea.y + cropArea.height / 2 - barLength / 2,
    barThickness,
    barLength
  );
  ctx.fillRect(
    cropArea.x + cropArea.width - barThickness / 2,
    cropArea.y + cropArea.height / 2 - barLength / 2,
    barThickness,
    barLength
  );
}

export function getRotatedDimensions(
  image: HTMLImageElement,
  rotation: number
): { width: number; height: number } {
  const isRotated90 = rotation === 90 || rotation === 270;
  return {
    width: isRotated90 ? image.height : image.width,
    height: isRotated90 ? image.width : image.height,
  };
}

export function calculateScale(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  return Math.min(
    1,
    containerWidth / imageWidth,
    containerHeight / imageHeight
  );
}

export async function exportEditedImage(
  image: HTMLImageElement,
  rotation: number,
  cropArea: CropArea | null,
  scale: number
): Promise<Blob> {
  const { width: finalWidth, height: finalHeight } = getRotatedDimensions(
    image,
    rotation
  );

  // Create rotated image at full resolution
  const rotatedCanvas = document.createElement("canvas");
  const rotatedCtx = rotatedCanvas.getContext("2d");
  if (!rotatedCtx) throw new Error("Could not get canvas context");

  rotatedCanvas.width = finalWidth;
  rotatedCanvas.height = finalHeight;
  rotatedCtx.translate(finalWidth / 2, finalHeight / 2);
  rotatedCtx.rotate((rotation * Math.PI) / 180);
  rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

  // Apply crop if exists
  const exportCanvas = document.createElement("canvas");
  const ctx = exportCanvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
    // Scale crop coordinates back to original image size
    const cropX = cropArea.x / scale;
    const cropY = cropArea.y / scale;
    const cropW = cropArea.width / scale;
    const cropH = cropArea.height / scale;

    exportCanvas.width = cropW;
    exportCanvas.height = cropH;
    ctx.drawImage(
      rotatedCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    );
  } else {
    exportCanvas.width = finalWidth;
    exportCanvas.height = finalHeight;
    ctx.drawImage(rotatedCanvas, 0, 0);
  }

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create blob"));
      }
    }, "image/png");
  });
}
