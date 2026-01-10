"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DocumentUpload from "./components/document-upload";
import MarkdownEditor from "./components/markdown-editor";
import Header from "./components/header";
import { useDocuments } from "./hooks/use-documents";

function HomeContent() {
  const [markdown, setMarkdown] = useState("");
  const [initialPreview, setInitialPreview] = useState<string | null>(null);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getDocument, updateMarkdown } = useDocuments();

  // Load document from URL parameter
  useEffect(() => {
    const docId = searchParams.get("doc");
    if (docId) {
      const id = parseInt(docId, 10);
      if (!isNaN(id)) {
        getDocument(id).then((doc) => {
          if (doc) {
            setMarkdown(doc.markdown);
            setCurrentDocId(doc.id!);
            // Create preview URL from blob
            const url = URL.createObjectURL(doc.blob);
            setInitialPreview(url);
          }
        });
      }
    }
  }, [searchParams, getDocument]);

  const handleDocumentSaved = (id: number) => {
    setCurrentDocId(id);
    router.replace(`/?doc=${id}`, { scroll: false });
  };

  // Update markdown in IndexedDB when it changes (for existing documents)
  const handleMarkdownChange = async (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    if (currentDocId) {
      await updateMarkdown(currentDocId, newMarkdown);
    }
  };

  return (
    <main className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden p-6 md:grid-cols-2">
      <DocumentUpload
        onMarkdownGenerated={setMarkdown}
        onDocumentSaved={handleDocumentSaved}
        initialPreview={initialPreview}
      />
      <MarkdownEditor
        content={markdown}
        onContentChange={handleMarkdownChange}
      />
    </main>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <Header />
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          </main>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
