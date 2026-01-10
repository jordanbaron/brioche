"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Document } from "../lib/db";
import MarkdownEditor from "./markdown-editor";
import { useDocuments } from "../hooks/use-documents";

interface DocumentViewerModalProps {
  doc: Document | null;
  onClose: () => void;
}

export default function DocumentViewerModal({
  doc,
  onClose,
}: DocumentViewerModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { updateMarkdown } = useDocuments();

  useEffect(() => {
    if (doc?.blob) {
      const url = URL.createObjectURL(doc.blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImageUrl(null);
  }, [doc?.blob]);

  const handleMarkdownChange = async (newMarkdown: string) => {
    if (doc?.id) {
      await updateMarkdown(doc.id, newMarkdown);
    }
  };

  return (
    <Dialog.Root open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-4 flex flex-col overflow-hidden rounded-xl bg-zinc-50 shadow-xl md:inset-8 dark:bg-zinc-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {doc?.title}
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

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden p-6 md:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Document Preview
              </h3>
              <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={doc?.title}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </div>

            <MarkdownEditor
              content={doc?.markdown || ""}
              onContentChange={handleMarkdownChange}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
