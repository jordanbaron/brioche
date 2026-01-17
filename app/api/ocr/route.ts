import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

const responseSchema = z.object({
  pages: z.array(
    z.object({
      index: z.number().describe("The 0-based index of the image"),
      markdown: z.string().describe("The extracted text as markdown"),
    })
  ),
});

function buildPrompt(imageCount: number) {
  return `You are processing ${imageCount} image${imageCount > 1 ? "s" : ""} for OCR. Extract all text from each image and return clean, well-formatted markdown.

Rules:
- Preserve the document structure (headings, paragraphs, lists, tables)
- Use appropriate markdown syntax for formatting
- For tables, use markdown table syntax
- For handwritten text, do your best to transcribe accurately
- If there are multiple columns, process them in reading order
- Do not include any commentary or explanations, just the extracted text
- If an image contains no text, use "(No text found)" for that page
- Return results for each image in order, using the index to identify which image each result corresponds to`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF, BMP, TIFF` },
          { status: 400 }
        );
      }
    }

    const imageContents = await Promise.all(
      files.map(async (file) => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const mimeType = file.type || "image/jpeg";
        return {
          type: "image" as const,
          image: bytes,
          mimeType,
        };
      })
    );

    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: responseSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildPrompt(files.length) },
            ...imageContents,
          ],
        },
      ],
    });

    return NextResponse.json({ pages: result.object.pages });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "OCR processing failed",
      },
      { status: 500 }
    );
  }
}
