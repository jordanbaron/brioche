"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { Markdown } from "@tiptap/markdown";

export default function MarkdownEditor({
  content,
  onContentChange,
}: {
  content: string;
  onContentChange?: (content: string) => void;
}) {
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: content || "Markdown output will appear here...",
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none h-full focus:outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!isExternalUpdate.current && onContentChange) {
        onContentChange(editor.getText());
      }
    },
    contentType: "markdown",
  });

  useEffect(() => {
    if (editor) {
      isExternalUpdate.current = true;
      editor.commands.setContent(
        content || "Markdown output will appear here...",
        {
          contentType: "markdown",
        }
      );
      isExternalUpdate.current = false;
    }
  }, [editor, content]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Markdown Output</h2>

      <div className="flex-1 overflow-auto rounded-lg border border-border bg-background-secondary p-4">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {content && (
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="self-end rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Copy Markdown
        </button>
      )}
    </div>
  );
}
