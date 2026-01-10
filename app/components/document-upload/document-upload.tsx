"use client";

import { useCallback, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { useOcr } from "../../hooks/use-ocr";
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

  const currentImage = images[currentIndex];

  const ocr = useOcr({
    onSuccess: (markdown, documentId) => {
      setImages((draft) => {
        draft[currentIndex].status = "processed";
        draft[currentIndex].markdown = markdown;
        draft[currentIndex].documentId = documentId;
      });
      onMarkdownGenerated(markdown);
    },
  });

  useEffect(() => {
    if (currentImage?.status === "processed" && currentImage.markdown) {
      onMarkdownChange?.(currentImage.markdown);
    } else if (currentImage?.status === "pending") {
      onMarkdownChange?.("");
    }
  }, [currentIndex, currentImage, onMarkdownChange]);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles: ImageItem[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        validFiles.push({
          file,
          previewUrl,
          status: "pending",
        });
      }
    });

    if (validFiles.length === 0) {
      alert("Please upload image files");
      return;
    }

    setImages(validFiles);
    setCurrentIndex(0);
  }, [setImages]);

  const handleProcess = useCallback(() => {
    if (currentImage && currentImage.status === "pending") {
      setImages((draft) => {
        draft[currentIndex].status = "processing";
      });
      ocr.process(currentImage.file);
    }
  }, [currentImage, currentIndex, ocr, setImages]);

  const handleClear = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setCurrentIndex(0);
    ocr.reset();
    onMarkdownChange?.("");
  }, [images, ocr, onMarkdownChange, setImages]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
  }, [images.length]);

  const handleEdit = useCallback(() => {
    if (currentImage) {
      setEditingImageUrl(currentImage.previewUrl);
    }
  }, [currentImage]);

  const handleEditorSave = useCallback((blob: Blob) => {
    const oldUrl = images[currentIndex].previewUrl;
    URL.revokeObjectURL(oldUrl);

    const newUrl = URL.createObjectURL(blob);
    const newFile = new File([blob], images[currentIndex].file.name, { type: "image/png" });

    setImages((draft) => {
      draft[currentIndex].file = newFile;
      draft[currentIndex].previewUrl = newUrl;
    });
  }, [currentIndex, images, setImages]);

  const handleEditorClose = useCallback(() => {
    setEditingImageUrl(null);
  }, []);

  const isProcessing = currentImage?.status === "processing";
  const isPending = currentImage?.status === "pending";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Upload Document
      </h2>

      {currentImage ? (
        <ImagePreview
          image={currentImage}
          currentIndex={currentIndex}
          totalImages={images.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onEdit={handleEdit}
        />
      ) : (
        <Dropzone onFiles={handleFiles} />
      )}

      {images.length > 0 && isPending && !isProcessing && (
        <div className="flex gap-2">
          <button
            onClick={handleProcess}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Process with OCR
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear All
          </button>
        </div>
      )}

      {images.length > 0 && !isPending && !isProcessing && (
        <button
          onClick={handleClear}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Clear All
        </button>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Spinner />
          Processing with Mistral OCR...
        </div>
      )}

      {ocr.isError && (
        <div className="text-sm text-red-500">
          Error: {ocr.error?.message}
        </div>
      )}

      <ImageEditorModal
        imageUrl={editingImageUrl}
        onSave={handleEditorSave}
        onClose={handleEditorClose}
      />
    </div>
  );
}
