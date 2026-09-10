import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { brief, title } = await req.json();
    const apiKey = process.env.POLLINATIONS_API_KEY;

    // Craft a clean, high-contrast prompt suitable for a 16:9 YouTube thumbnail
    const prompt = encodeURIComponent(
      `YouTube thumbnail, 16:9 aspect ratio, high visual contrast, cinematic lighting, ${brief || title}`
    );

    // Pollinations generates directly via a clean URL with 16:9 YouTube dimensions (1280x720)
    const imageUrl = `https://gen.pollinations.ai/image/${prompt}?width=1280&height=720&model=flux&key=${apiKey}`;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
