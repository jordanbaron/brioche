export interface ImageItem {
  file: File;
  previewUrl: string;
  status: "pending" | "processing" | "processed";
  markdown?: string;
  documentId?: number;
}
