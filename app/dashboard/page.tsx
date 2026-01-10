"use client";

import Link from "next/link";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Header from "../components/header";
import DocumentCard from "../components/document-card";
import DocumentViewerModal from "../components/document-viewer-modal";
import Spinner from "../components/spinner";
import { useDocuments, type Document } from "../hooks/use-documents";

export default function Dashboard() {
  const { documents, isLoading, deleteDocument, deleteDocuments } = useDocuments();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const handleSelect = (id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
        // Auto-enter selection mode when first item is selected
        if (!selectionMode) {
          setSelectionMode(true);
        }
      } else {
        next.delete(id);
        // Auto-exit selection mode when last item is deselected
        if (next.size === 0) {
          setSelectionMode(false);
        }
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (documents) {
      setSelectedIds(new Set(documents.map((d) => d.id!)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    if (confirm(`Delete ${count} document${count > 1 ? "s" : ""}?`)) {
      await deleteDocuments(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const hasDocuments = documents && documents.length > 0;
  const allSelected = hasDocuments && selectedIds.size === documents.length;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <Header />

      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Your Documents
          </h2>

          {hasDocuments && (
            <div className="flex items-center gap-2">
              {selectionMode ? (
                <>
                  <button
                    onClick={allSelected ? handleDeselectAll : handleSelectAll}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete ({selectedIds.size})
                  </button>
                  <button
                    onClick={handleCancelSelection}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectionMode(true)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Select
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6 text-zinc-400" />
          </div>
        ) : documents?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DocumentTextIcon className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
            <p className="text-zinc-500 dark:text-zinc-400">No documents yet</p>
            <Link
              href="/"
              className="mt-4 text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {documents?.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={deleteDocument}
                onClick={() => setSelectedDoc(doc)}
                selectable={selectionMode}
                selected={selectedIds.has(doc.id!)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </main>

      <DocumentViewerModal
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
