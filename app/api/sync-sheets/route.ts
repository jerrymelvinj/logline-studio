import { NextRequest, NextResponse } from "next/server";
import { syncToGoogleSheets, DEFAULT_GOOGLE_SHEET_URL, DEFAULT_GOOGLE_SHEET_ID } from "@/lib/googleSheetsSync";
import { ContentRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    sheetId: DEFAULT_GOOGLE_SHEET_ID,
    sheetUrl: DEFAULT_GOOGLE_SHEET_URL,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const records: ContentRecord[] = body.records || [];
    const webhookUrl: string = body.webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "No content records to sync" }, { status: 400 });
    }

    const result = await syncToGoogleSheets(records, webhookUrl);

    return NextResponse.json({
      success: result.success,
      sheetId: DEFAULT_GOOGLE_SHEET_ID,
      sheetUrl: DEFAULT_GOOGLE_SHEET_URL,
      addedRecords: result.addedRecords,
      duplicateRecords: result.duplicateRecords,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error in /api/sync-sheets:", error);
    return NextResponse.json({ error: error.message || "Failed to sync to Google Sheets" }, { status: 500 });
  }
}
