"use client";

import { useCallback, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import EditorToolbar from "./editor-toolbar";
import { useImageEditor } from "./hooks/use-image-editor";
import { useCropInteraction } from "./hooks/use-crop-interaction";
import { useCanvasRenderer } from "./hooks/use-canvas-renderer";
import { exportEditedImage } from "../../lib/canvas-utils";

interface ImageEditorModalProps {
  imageUrl: string | null;
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

export default function ImageEditorModal({
  imageUrl,
  onSave,
  onClose,
}: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { state: editorState, actions: editorActions, cropScaleRef } = useImageEditor();
  const { state: cropState, actions: cropActions } = useCropInteraction();

  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl) {
      editorActions.reset();
      editorActions.setImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => editorActions.setImage(img);
    img.src = imageUrl;
  }, [imageUrl, editorActions]);

  // Canvas rendering
  useCanvasRenderer({
    canvasRef,
    containerRef,
    image: editorState.image,
    rotation: editorState.rotation,
    cropArea: editorState.cropArea,
    cropMode: editorState.cropMode,
    cropScale: cropScaleRef.current,
    onScaleChange: editorActions.setScale,
    onCanvasSizeChange: editorActions.setCanvasSize,
  });

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!editorState.cropMode || !canvasRef.current || !editorState.cropArea) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      cropActions.startDrag(x, y, editorState.cropArea);
    },
    [editorState.cropMode, editorState.cropArea, cropActions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (!cropState.activeHandle) {
        if (editorState.cropMode && editorState.cropArea) {
          const handle = cropActions.getHandle(x, y, editorState.cropArea);
          canvasRef.current.style.cursor = cropActions.getCursor(handle);
        }
        return;
      }

      const newCropArea = cropActions.updateDrag(x, y, editorState.canvasSize);
      if (newCropArea) {
        editorActions.setCropArea(newCropArea);
      }
    },
    [cropState.activeHandle, editorState.cropMode, editorState.cropArea, editorState.canvasSize, cropActions, editorActions]
  );

  const handleMouseUp = useCallback(() => {
    cropActions.endDrag();
  }, [cropActions]);

  const handleSave = useCallback(async () => {
    if (!editorState.image) return;

    try {
      const blob = await exportEditedImage(
        editorState.image,
        editorState.rotation,
        editorState.cropArea,
        editorState.scale
      );
      onSave(blob);
      onClose();
    } catch (error) {
      console.error("Failed to export image:", error);
    }
  }, [editorState.image, editorState.rotation, editorState.cropArea, editorState.scale, onSave, onClose]);

  return (
    <Dialog.Root open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-4 flex flex-col overflow-hidden rounded-xl bg-background shadow-xl md:inset-8">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Edit Image
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-interactive-hover hover:text-foreground"
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

            <EditorToolbar
              cropMode={editorState.cropMode}
              hasChanges={editorState.hasChanges}
              onRotateLeft={editorActions.rotateLeft}
              onRotateRight={editorActions.rotateRight}
              onEnterCrop={editorActions.enterCrop}
              onApplyCrop={editorActions.applyCrop}
              onCancelCrop={editorActions.cancelCrop}
              onReset={editorActions.reset}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
