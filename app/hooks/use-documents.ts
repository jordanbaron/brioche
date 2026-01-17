import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Document } from "../lib/db";

export function useDocuments() {
  const documents = useLiveQuery(() =>
    db.documents.orderBy("uploadedAt").reverse().toArray()
  );

  const deleteDocument = useCallback(async (id: number) => {
    await db.documents.delete(id);
  }, []);

  const deleteDocuments = useCallback(async (ids: number[]) => {
    await db.documents.bulkDelete(ids);
  }, []);

  const getDocument = useCallback(async (id: number) => {
    return await db.documents.get(id);
  }, []);

  const updateMarkdown = useCallback(async (id: number, markdown: string) => {
    await db.documents.update(id, { markdown });
  }, []);

  return {
    documents,
    isLoading: documents === undefined,
    deleteDocument,
    deleteDocuments,
    getDocument,
    updateMarkdown,
  };
}

export type { Document };
