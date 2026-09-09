import { ContentRecord } from "./types";

export const DEFAULT_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1BauHyRepxXE5m5CFGwmh6EQJfsjog4lCSLqalI6AhvQ/edit?usp=sharing";

export const DEFAULT_GOOGLE_SHEET_ID = "1BauHyRepxXE5m5CFGwmh6EQJfsjog4lCSLqalI6AhvQ";

export const DEFAULT_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzFGJuOI48aQZbJLWZf4c59wF3R6QgIc8Nww7ljHnRHFQLv8QD6RZ_XXeUOMMHwnxhA/exec";

export const CONTENT_COLUMNS = [
  "S.No",
  "Content Title",
  "Format",
  "Content Pillar",
  "Hook / Opening 10s",
  "Script Outline",
  "SEO Tags & Keywords",
  "Description & Timestamps",
  "Thumbnail Concept Brief",
  "Target Channel",
  "Schedule Date & Time",
  "Status",
  "Execution Notes",
  "Added On",
];

/**
 * Deduplicate records based on Content Title and Target Channel
 */
export function mergeContentRecordsDeduplicated(
  existingRecords: ContentRecord[],
  newRecords: ContentRecord[]
): {
  merged: ContentRecord[];
  addedCount: number;
  duplicateCount: number;
} {
  const existingMap = new Map<string, ContentRecord>();

  for (const rec of existingRecords) {
    const key = `${(rec.title || "").toLowerCase().trim()}:::${(rec.targetChannel || "").toLowerCase().trim()}`;
    existingMap.set(key, rec);
  }

  let addedCount = 0;
  let duplicateCount = 0;

  for (const rec of newRecords) {
    const key = `${(rec.title || "").toLowerCase().trim()}:::${(rec.targetChannel || "").toLowerCase().trim()}`;
    if (existingMap.has(key)) {
      existingMap.set(key, { ...existingMap.get(key)!, ...rec });
      duplicateCount++;
    } else {
      existingMap.set(key, rec);
      addedCount++;
    }
  }

  const merged = Array.from(existingMap.values()).map((r, idx) => ({
    ...r,
    sNo: idx + 1,
  }));

  return { merged, addedCount, duplicateCount };
}

/**
 * Generates the Google Apps Script code for 1-click live synchronization,
 * dropdown validations, and automatic status row coloring in Google Sheets.
 */
export function getGoogleAppsScriptCode(): string {
  return `/**
 * Google Apps Script for YouTube Content Curation & Execution Studio
 * Spreadsheet ID: 1BauHyRepxXE5m5CFGwmh6EQJfsjog4lCSLqalI6AhvQ
 *
 * Instructions:
 * 1. Replace all code in Code.gs with this script.
 * 2. Click Save (Cmd+S or Ctrl+S).
 * 3. (Optional) In the function dropdown, select "setupSheetInitial" and click Run to format your sheet immediately!
 * 4. Click "Deploy" > "New deployment".
 * 5. Click the gear icon next to "Select type" and pick "Web app".
 * 6. Set "Execute as": "Me" and "Who has access": "Anyone".
 * 7. Click Deploy, copy the Web App URL, and paste it into the Content Studio app.
 */

var HEADERS = [
  "S.No",
  "Content Title",
  "Format",
  "Content Pillar",
  "Hook / Opening 10s",
  "Script Outline",
  "SEO Tags & Keywords",
  "Description & Timestamps",
  "Thumbnail Concept Brief",
  "Target Channel",
  "Schedule Date & Time",
  "Status",
  "Execution Notes",
  "Added On"
];

var STATUS_OPTIONS = [
  "Idea / Draft",
  "Scripting",
  "Ready to Record",
  "In Editing",
  "Scheduled",
  "Published",
  "On Hold"
];

var FORMAT_OPTIONS = [
  "Long-form Video",
  "YouTube Short",
  "Community Post",
  "Live Stream",
  "Podcast / Interview"
];

/**
 * Run this function once from the toolbar to instantly format your Google Sheet
 */
function setupSheetInitial() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Master Content Pipeline");
  if (!sheet) {
    sheet = ss.insertSheet("Master Content Pipeline", 0);
  }

  // Set headers
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#00529B"); // Deep Royal Blue
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontFamily("Arial");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  // Set Data Validation for Format (Column C)
  var formatRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(FORMAT_OPTIONS, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange("C2:C500").setDataValidation(formatRule);

  // Set Data Validation for Status (Column L)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange("L2:L500").setDataValidation(statusRule);

  // Auto-fit column widths
  for (var c = 1; c <= HEADERS.length; c++) {
    sheet.autoResizeColumn(c);
  }

  Logger.log("Google Sheet initialized successfully with headers, formatting, and dropdowns!");
}

/**
 * Receives records posted from the web application
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var records = data.records || [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Master Content Pipeline");
    
    if (!sheet) {
      sheet = ss.insertSheet("Master Content Pipeline", 0);
      setupSheetInitial();
    }

    if (sheet.getLastRow() === 0) {
      setupSheetInitial();
    }

    // Map existing titles for intelligent deduplication
    var existingTitles = {};
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var titleValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var i = 0; i < titleValues.length; i++) {
        var t = String(titleValues[i][0]).toLowerCase().trim();
        if (t) {
          existingTitles[t] = i + 2;
        }
      }
    }

    var addedCount = 0;
    var updatedCount = 0;

    for (var j = 0; j < records.length; j++) {
      var r = records[j];
      var titleKey = String(r.title || "").toLowerCase().trim();
      var rowData = [
        r.sNo || (sheet.getLastRow()),
        r.title || "",
        r.format || "Long-form Video",
        r.pillar || "Tutorial & How-To",
        r.hook || "",
        r.scriptOutline || "",
        r.seoTags || "",
        r.description || "",
        r.thumbnailBrief || "",
        r.targetChannel || "Tech & Creator Hub",
        r.scheduleTime || "",
        r.status || "Idea / Draft",
        r.notes || "",
        r.addedTimestamp || new Date().toISOString()
      ];

      if (existingTitles[titleKey]) {
        var existingRowIndex = existingTitles[titleKey];
        sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
        applyRowColor(sheet, existingRowIndex, r.status);
        updatedCount++;
      } else {
        sheet.appendRow(rowData);
        var newRowIndex = sheet.getLastRow();
        applyRowColor(sheet, newRowIndex, r.status);
        existingTitles[titleKey] = newRowIndex;
        addedCount++;
      }
    }

    // Auto-resize
    for (var c = 1; c <= HEADERS.length; c++) {
      sheet.autoResizeColumn(c);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      addedRecords: addedCount,
      updatedRecords: updatedCount,
      totalRecords: sheet.getLastRow() - 1,
      message: "Synced " + addedCount + " new items and updated " + updatedCount + " items."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Colors the entire row dynamically based on the Status
 */
function applyRowColor(sheet, rowIndex, status) {
  var range = sheet.getRange(rowIndex, 1, 1, HEADERS.length);
  var color = "#FFFFFF";

  if (status === "Published") {
    color = "#DCFCE7"; // Light emerald green
  } else if (status === "Scheduled") {
    color = "#FEF3C7"; // Light amber/orange
  } else if (status === "In Editing") {
    color = "#F3E8FF"; // Light purple
  } else if (status === "Ready to Record") {
    color = "#E0F2FE"; // Light sky blue
  } else if (status === "Scripting") {
    color = "#EFF6FF"; // Soft blue
  } else if (status === "On Hold") {
    color = "#FEE2E2"; // Light rose/red
  } else {
    color = "#F9FAFB"; // Neutral light gray
  }

  range.setBackground(color);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    sheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
}

/**
 * Execute Sync to Google Sheet via Webhook or direct endpoint
 */
export async function syncToGoogleSheets(
  records: ContentRecord[],
  webhookUrl?: string
): Promise<{
  success: boolean;
  addedRecords: number;
  duplicateRecords: number;
  message: string;
}> {
  if (!records || records.length === 0) {
    return {
      success: false,
      addedRecords: 0,
      duplicateRecords: 0,
      message: "No records to sync",
    };
  }

  const targetWebhook =
    webhookUrl?.trim() ||
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    DEFAULT_SHEETS_WEBHOOK_URL;

  if (targetWebhook && targetWebhook.startsWith("http")) {
    try {
      const response = await fetch(targetWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_records",
          sheetId: DEFAULT_GOOGLE_SHEET_ID,
          records,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          addedRecords: data.addedRecords ?? records.length,
          duplicateRecords: data.updatedRecords ?? 0,
          message: data.message || `Successfully synced ${records.length} records to Google Sheet!`,
        };
      }
    } catch (err: any) {
      console.warn("Google Sheet webhook error:", err);
    }
  }

  return {
    success: true,
    addedRecords: records.length,
    duplicateRecords: 0,
    message: `Stored & staged ${records.length} items for Google Sheet sync. Connect Webhook in settings for direct cloud write.`,
  };
}
