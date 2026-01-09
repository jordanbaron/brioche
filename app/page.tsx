"use client";

import { useState } from "react";
import DocumentUpload from "./components/document-upload";
import MarkdownEditor from "./components/markdown-editor";

export default function Home() {
  const [markdown, setMarkdown] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Brioche
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Document to Markdown OCR
        </p>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <DocumentUpload onMarkdownGenerated={setMarkdown} />
        <MarkdownEditor content={markdown} />
      </main>
    </div>
  );
}
