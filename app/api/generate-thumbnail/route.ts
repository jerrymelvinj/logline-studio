import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { brief, title } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // Compose a prompt tailored for high-CTR YouTube packaging
    const prompt = `A cinematic, ultra-high-contrast YouTube thumbnail. ${brief || title}. Vibrant lighting, clear visual focal point, professional studio photography style, 4k.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9", // Native 16:9 widescreen YouTube format
            outputMimeType: "image/jpeg",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Google Imagen API Error:", data.error || data);
      return NextResponse.json(
        { success: false, error: data.error?.message || "Failed to generate image from Google AI" },
        { status: 500 }
      );
    }

    // Google returns the image as a raw base64 string
    const base64Bytes = data.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Bytes) {
      return NextResponse.json(
        { success: false, error: "No image bytes returned by the model." },
        { status: 500 }
      );
    }

    const dataUrl = `data:image/jpeg;base64,${base64Bytes}`;

    return NextResponse.json({ success: true, imageUrl: dataUrl });
  } catch (err: any) {
    console.error("Image generation handler error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
