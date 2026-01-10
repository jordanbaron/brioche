"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

export default function MarkdownEditor({
  content,
  onContentChange,
}: {
  content: string;
  onContentChange?: (content: string) => void;
}) {
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "<p>Markdown output will appear here...</p>",
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
  });

  useEffect(() => {
    if (editor && content) {
      isExternalUpdate.current = true;
      editor.commands.setContent(content);
      isExternalUpdate.current = false;
    }
  }, [editor, content]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Markdown Output
      </h2>

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {content && (
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="self-end rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Copy Markdown
        </button>
      )}
    </div>
  );
}
