"use client";

import Link from "next/link";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Header from "../components/header";
import DocumentCard from "../components/document-card";
import DocumentViewerModal from "../components/document-viewer-modal";
import ConfirmDialog from "../components/confirm-dialog";
import Spinner from "../components/spinner";
import { useDocuments, type Document } from "../hooks/use-documents";

export default function Dashboard() {
  const { documents, isLoading, deleteDocument, deleteDocuments } = useDocuments();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
      const validIds = documents
        .map((d) => d.id)
        .filter((id): id is number => id !== undefined);
      setSelectedIds(new Set(validIds));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteDocuments(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const hasDocuments = documents && documents.length > 0;
  const allSelected = hasDocuments && selectedIds.size === documents.length;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />

      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Your Documents
          </h2>

          {hasDocuments && (
            <div className="flex items-center gap-2">
              {selectionMode ? (
                <>
                  <button
                    onClick={allSelected ? handleDeselectAll : handleSelectAll}
                    className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
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
                    className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectionMode(true)}
                  className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-interactive-hover"
                >
                  Select
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6 text-foreground-faint" />
          </div>
        ) : documents?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DocumentTextIcon className="mb-4 h-12 w-12 text-foreground-faint" strokeWidth={1.5} />
            <p className="text-foreground-muted">No documents yet</p>
            <Link
              href="/"
              className="mt-4 text-sm font-medium text-accent-strong hover:text-accent"
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
                selected={doc.id !== undefined && selectedIds.has(doc.id)}
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

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Documents"
        description={`Are you sure you want to delete ${selectedIds.size} document${selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
