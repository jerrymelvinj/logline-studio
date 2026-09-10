import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { brief, title } = await req.json();
    const apiKey = process.env.POLLINATIONS_API_KEY;

    // Clean and sanitize the prompt
    const cleanPrompt = (brief || title || "YouTube high contrast thumbnail")
      .replace(/[^\w\s,-]/gi, "")
      .trim();

    const encodedPrompt = encodeURIComponent(
      `YouTube thumbnail, 16:9 aspect ratio, high visual contrast, cinematic lighting, ${cleanPrompt}`
    );

    // Call Pollinations API
    const targetUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=1280&height=720&model=flux${
      apiKey ? `&key=${apiKey}` : ""
    }`;

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(targetUrl, { headers });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Pollinations error response:", errText);
      return NextResponse.json(
        { success: false, error: `Image API failed: ${response.status}` },
        { status: 500 }
      );
    }

    // Convert to Base64 data URL so the client browser never fails to display it
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    return NextResponse.json({ success: true, imageUrl: base64Image });
  } catch (error: any) {
    console.error("Thumbnail generation handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
