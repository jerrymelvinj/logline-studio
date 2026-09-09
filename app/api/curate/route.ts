import { NextRequest, NextResponse } from "next/server";
import { curateContentWithGemini, DEFAULT_CHANNEL_TEMPLATE } from "@/lib/aiCurator";
import { DraftContentItem, ChannelTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: DraftContentItem[] = body.items || [];
    const apiKey: string = body.apiKey || process.env.GEMINI_API_KEY || "";
    const channelTemplate: ChannelTemplate = body.channelTemplate || DEFAULT_CHANNEL_TEMPLATE;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No content items provided" }, { status: 400 });
    }

    const curatedRecords = await curateContentWithGemini(items, apiKey, channelTemplate);

    return NextResponse.json({
      success: true,
      records: curatedRecords,
    });
  } catch (error: any) {
    console.error("Error in /api/curate:", error);
    return NextResponse.json({ error: error.message || "Failed to curate content" }, { status: 500 });
  }
}
