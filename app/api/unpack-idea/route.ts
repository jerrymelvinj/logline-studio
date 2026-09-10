import { NextRequest, NextResponse } from "next/server";
import { unpackRawIdeaWithGemini, DEFAULT_CHANNEL_TEMPLATE } from "@/lib/aiCurator";
import { ChannelTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdea: string = body.rawIdea || "";
    const apiKey: string = body.apiKey || process.env.GEMINI_API_KEY || "";
    const channelTemplate: ChannelTemplate = body.channelTemplate || DEFAULT_CHANNEL_TEMPLATE;

    if (!rawIdea || !rawIdea.trim()) {
      return NextResponse.json({ error: "No raw idea provided" }, { status: 400 });
    }

    const unpackedResult = await unpackRawIdeaWithGemini(rawIdea, channelTemplate, apiKey);

    return NextResponse.json({
      success: true,
      data: unpackedResult,
    });
  } catch (error: any) {
    console.error("Error in /api/unpack-idea:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unpack raw idea" },
      { status: 500 }
    );
  }
}
