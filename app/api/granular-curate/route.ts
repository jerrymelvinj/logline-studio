import { NextRequest, NextResponse } from "next/server";
import { granularFleshWithGemini, DEFAULT_CHANNEL_TEMPLATE } from "@/lib/aiCurator";
import { DraftContentItem, ChannelTemplate, ContentRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type: "outline" | "thumbnail" | "description" | "tags" = body.type;
    const item: DraftContentItem = body.item;
    const currentRecord: Partial<ContentRecord> | undefined = body.currentRecord;
    const apiKey: string = body.apiKey || process.env.GEMINI_API_KEY || "";
    const channelTemplate: ChannelTemplate = body.channelTemplate || DEFAULT_CHANNEL_TEMPLATE;

    if (!type || !item) {
      return NextResponse.json({ error: "Missing required parameters (type, item)" }, { status: 400 });
    }

    const res = await granularFleshWithGemini({
      type,
      item,
      currentRecord,
      channelTemplate,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      result: res.result,
    });
  } catch (error: any) {
    console.error("Error in /api/granular-curate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute granular AI action" },
      { status: 500 }
    );
  }
}
