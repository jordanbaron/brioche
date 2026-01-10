import Dexie, { type Table } from "dexie";

export interface Document {
  id?: number;
  title: string;
  blob: Blob;
  mimeType: string;
  size: number;
  markdown: string;
  uploadedAt: Date;
}

export class BriocheDB extends Dexie {
  documents!: Table<Document>;

  constructor() {
    super("brioche");
    this.version(1).stores({
      documents: "++id, title, uploadedAt",
    });
  }
}

export const db = new BriocheDB();
