"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { useOcr, type OcrResult } from "../../hooks/use-ocr";
import Spinner from "../spinner";
import Dropzone from "./dropzone";
import ImagePreview from "./image-preview";
import ImageEditorModal from "./image-editor-modal";
import type { ImageItem } from "./types";

interface DocumentUploadProps {
  onMarkdownGenerated: (markdown: string) => void;
  onMarkdownChange?: (markdown: string) => void;
}

export default function DocumentUpload({
  onMarkdownGenerated,
  onMarkdownChange,
}: DocumentUploadProps) {
  const [images, setImages] = useImmer<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Use ref pattern to avoid effect re-runs when callback reference changes
  const onMarkdownChangeRef = useRef(onMarkdownChange);
  useEffect(() => {
    onMarkdownChangeRef.current = onMarkdownChange;
  });

  const currentImage = images[currentIndex];

  const ocr = useOcr({
    onSuccess: (result: OcrResult) => {
      setImages((draft) => {
        for (const page of result.pages) {
          if (draft[page.index]) {
            draft[page.index].markdown = page.markdown;
            draft[page.index].documentId = result.documentIds[page.index];
          }
        }
      });
      if (result.pages.length > 0) {
        const firstPage = result.pages.find((p) => p.index === 0);
        if (firstPage) {
          onMarkdownGenerated(firstPage.markdown);
        }
      }
    },
  });

  useEffect(() => {
    if (currentImage?.markdown) {
      onMarkdownChangeRef.current?.(currentImage.markdown);
    } else {
      onMarkdownChangeRef.current?.("");
    }
  }, [currentIndex, currentImage]);

  const handleFiles = useCallback(
    (files: FileList) => {
      const validFiles: ImageItem[] = [];
      setFileError(null);

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const previewUrl = URL.createObjectURL(file);
          validFiles.push({ file, previewUrl });
        }
      });

      if (validFiles.length === 0) {
        setFileError("Please upload image files");
        return;
      }

      setImages(validFiles);
      setCurrentIndex(0);
    },
    [setImages]
  );

  const handleProcess = useCallback(() => {
    const files = images.map((img) => img.file);
    ocr.process(files);
  }, [images, ocr]);

  const handleClear = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setCurrentIndex(0);
    ocr.reset();
    setFileError(null);
    onMarkdownChangeRef.current?.("");
  }, [images, ocr, setImages]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
  }, [images.length]);

  const handleRemove = useCallback(() => {
    URL.revokeObjectURL(images[currentIndex].previewUrl);
    setImages((draft) => {
      draft.splice(currentIndex, 1);
    });
    setCurrentIndex((prev) => Math.min(prev, images.length - 2));
  }, [currentIndex, images, setImages]);

  const handleEdit = useCallback(() => {
    if (currentImage) {
      setEditingImageUrl(currentImage.previewUrl);
    }
  }, [currentImage]);

  const handleEditorSave = useCallback(
    (blob: Blob) => {
      const oldUrl = images[currentIndex].previewUrl;
      URL.revokeObjectURL(oldUrl);

      const newUrl = URL.createObjectURL(blob);
      const newFile = new File([blob], images[currentIndex].file.name, {
        type: "image/png",
      });

      setImages((draft) => {
        draft[currentIndex].file = newFile;
        draft[currentIndex].previewUrl = newUrl;
      });
    },
    [currentIndex, images, setImages]
  );

  const handleEditorClose = useCallback(() => {
    setEditingImageUrl(null);
  }, []);

  const isProcessing = ocr.isPending;
  const isProcessed = images.length > 0 && images.every((img) => img.markdown);
  const canProcess = images.length > 0 && !isProcessed && !isProcessing;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Upload Document</h2>

      {currentImage ? (
        <ImagePreview
          image={currentImage}
          currentIndex={currentIndex}
          totalImages={images.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onEdit={handleEdit}
          onRemove={handleRemove}
          disabled={isProcessing}
        />
      ) : (
        <Dropzone onFiles={handleFiles} />
      )}

      {canProcess && (
        <div className="flex gap-2">
          <button
            onClick={handleProcess}
            className="flex-1 rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Process {images.length} image{images.length > 1 ? "s" : ""} with OCR
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
          >
            Clear All
          </button>
        </div>
      )}

      {isProcessed && (
        <button
          onClick={handleClear}
          className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
        >
          Clear All
        </button>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Spinner />
          Processing {images.length} image{images.length > 1 ? "s" : ""}
        </div>
      )}

      {ocr.isError && (
        <div className="text-sm text-red-500">Error: {ocr.error?.message}</div>
      )}

      {fileError && (
        <div className="text-sm text-red-500">{fileError}</div>
      )}

      <ImageEditorModal
        imageUrl={editingImageUrl}
        onSave={handleEditorSave}
        onClose={handleEditorClose}
      />
    </div>
  );
}
