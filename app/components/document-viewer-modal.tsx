"use client";

import { useEffect, useMemo } from "react";
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
  const { updateMarkdown } = useDocuments();

  // Create and manage image URL with proper cleanup
  const blob = doc?.blob;
  const imageUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob]
  );

  useEffect(() => {
    if (imageUrl) {
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [imageUrl]);

  const handleMarkdownChange = async (newMarkdown: string) => {
    if (doc?.id) {
      await updateMarkdown(doc.id, newMarkdown);
    }
  };

  return (
    <Dialog.Root open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-4 flex flex-col overflow-hidden rounded-xl bg-background shadow-xl md:inset-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {doc?.title}
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

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden p-6 md:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">
                Document Preview
              </h3>
              <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-background-secondary p-2">
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
