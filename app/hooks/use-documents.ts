import { useLiveQuery } from "dexie-react-hooks";
import { db, type Document } from "../lib/db";

export function useDocuments() {
  const documents = useLiveQuery(() =>
    db.documents.orderBy("uploadedAt").reverse().toArray()
  );

  const deleteDocument = async (id: number) => {
    await db.documents.delete(id);
  };

  const deleteDocuments = async (ids: number[]) => {
    await db.documents.bulkDelete(ids);
  };

  const getDocument = async (id: number) => {
    return await db.documents.get(id);
  };

  const updateMarkdown = async (id: number, markdown: string) => {
    await db.documents.update(id, { markdown });
  };

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
