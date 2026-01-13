import { useMutation } from "@tanstack/react-query";
import { db } from "../lib/db";

export interface OcrPage {
  index: number;
  markdown: string;
}

export interface OcrResult {
  pages: OcrPage[];
  documentIds: number[];
}

interface UseOcrOptions {
  onSuccess?: (result: OcrResult) => void;
  onError?: (error: Error) => void;
}

async function processOcr(files: File[]): Promise<OcrPage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/ocr", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "OCR failed");
  }

  const data = await response.json();
  return data.pages;
}

async function saveDocuments(
  files: File[],
  pages: OcrPage[]
): Promise<number[]> {
  const documentIds: number[] = [];

  for (const page of pages) {
    const file = files[page.index];
    if (!file) continue;

    const id = await db.documents.add({
      title: file.name.replace(/\.[^/.]+$/, ""),
      blob: file,
      mimeType: file.type,
      size: file.size,
      markdown: page.markdown,
      uploadedAt: new Date(),
    });
    documentIds[page.index] = id;
  }

  return documentIds;
}

export function useOcr(options: UseOcrOptions = {}) {
  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      const pages = await processOcr(files);
      const documentIds = await saveDocuments(files, pages);
      return { pages, documentIds };
    },
    onSuccess: (result) => {
      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });

  return {
    process: mutation.mutate,
    processAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
