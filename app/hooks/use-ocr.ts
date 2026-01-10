import { useMutation } from "@tanstack/react-query";
import { db } from "../lib/db";

interface UseOcrOptions {
  onSuccess?: (markdown: string, documentId: number) => void;
  onError?: (error: Error) => void;
}

async function processOcr(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/ocr", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "OCR failed");
  }

  const data = await response.json();
  return data.markdown;
}

async function saveDocument(file: File, markdown: string): Promise<number> {
  return await db.documents.add({
    title: file.name.replace(/\.[^/.]+$/, ""),
    blob: file,
    mimeType: file.type,
    size: file.size,
    markdown,
    uploadedAt: new Date(),
  });
}

export function useOcr(options: UseOcrOptions = {}) {
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const markdown = await processOcr(file);
      const documentId = await saveDocument(file, markdown);
      return { markdown, documentId };
    },
    onSuccess: ({ markdown, documentId }) => {
      options.onSuccess?.(markdown, documentId);
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
