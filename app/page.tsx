"use client";

import { useState } from "react";
import DocumentUpload from "./components/document-upload";
import MarkdownEditor from "./components/markdown-editor";
import Header from "./components/header";

export default function Home() {
  const [markdown, setMarkdown] = useState("");

  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <Header />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden p-6 md:grid-cols-2">
        <DocumentUpload
          onMarkdownGenerated={setMarkdown}
          onMarkdownChange={setMarkdown}
        />
        <MarkdownEditor content={markdown} />
      </main>
    </div>
  );
}
