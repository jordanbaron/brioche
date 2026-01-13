import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

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

    const imageContents = await Promise.all(
      files.map(async (file, index) => {
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
