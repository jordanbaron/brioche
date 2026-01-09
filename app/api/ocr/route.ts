import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const response = await mistral.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "image_url",
        imageUrl: dataUrl,
      },
    });

    const markdown =
      response.pages?.map((page) => page.markdown).join("\n\n---\n\n") || "";

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OCR processing failed" },
      { status: 500 }
    );
  }
}
