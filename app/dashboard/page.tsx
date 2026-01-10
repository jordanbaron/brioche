"use client";

import Link from "next/link";
import Header from "../components/header";
import DocumentCard from "../components/document-card";
import { useDocuments } from "../hooks/use-documents";

export default function Dashboard() {
  const { documents, isLoading, deleteDocument } = useDocuments();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <Header />

      <main className="flex-1 p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Your Documents
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-zinc-400" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : documents?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
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
              <DocumentCard key={doc.id} doc={doc} onDelete={deleteDocument} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
