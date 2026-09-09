import ExcelJS from "exceljs";
import { ContentRecord } from "./types";
import { CONTENT_COLUMNS } from "./googleSheetsSync";

export const EXCEL_FILENAME = "youtube_content_pipeline_db.xlsx";

/**
 * Builds an ExcelJS Workbook with:
 * 1. Master Content Pipeline sheet
 * 2. Format-segregated sheets (Long-form Videos, YouTube Shorts, etc.)
 * 3. Deep royal blue header styling, bold white text
 * 4. Conditional styling for Status column
 */
export async function buildStyledExcelWorkbook(records: ContentRecord[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "YouTube Content Curation Studio";
  workbook.created = new Date();

  // 1. Group records by format
  const formatGroups = new Map<string, ContentRecord[]>();
  for (const rec of records) {
    const fmt = rec.format || "Other";
    if (!formatGroups.has(fmt)) {
      formatGroups.set(fmt, []);
    }
    formatGroups.get(fmt)!.push(rec);
  }

  // Helper to style a sheet
  const populateSheet = (sheet: ExcelJS.Worksheet, items: ContentRecord[]) => {
    // Header row
    const headerRow = sheet.addRow(CONTENT_COLUMNS);
    headerRow.height = 28;
    headerRow.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00529B" }, // Deep Royal Blue
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "medium", color: { argb: "FF003366" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };
    });

    // Populate data rows
    items.forEach((r, idx) => {
      const row = sheet.addRow([
        idx + 1,
        r.title,
        r.format,
        r.pillar,
        r.hook,
        r.scriptOutline,
        r.seoTags,
        r.description,
        r.thumbnailBrief,
        r.targetChannel,
        r.scheduleTime,
        r.status,
        r.notes,
        r.addedTimestamp,
      ]);

      row.height = 24;
      row.alignment = { vertical: "middle", wrapText: true };

      // Status styling
      const statusVal = String(r.status || "");
      if (statusVal === "Published") {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
        });
      } else if (statusVal === "Scheduled") {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        });
      } else if (statusVal === "Ready to Record") {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0F2FE" } };
        });
      } else if (statusVal === "In Editing") {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3E8FF" } };
        });
      } else if (statusVal === "On Hold") {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
        });
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    // Column widths
    sheet.columns = [
      { width: 8 },  // S.No
      { width: 32 }, // Title
      { width: 18 }, // Format
      { width: 22 }, // Pillar
      { width: 35 }, // Hook
      { width: 45 }, // Outline
      { width: 28 }, // SEO Tags
      { width: 40 }, // Description
      { width: 35 }, // Thumbnail Brief
      { width: 20 }, // Channel
      { width: 22 }, // Schedule
      { width: 18 }, // Status
      { width: 25 }, // Notes
      { width: 22 }, // Added On
    ];

    sheet.views = [{ state: "frozen", ySplit: 1 }];
  };

  // Master Sheet
  const masterSheet = workbook.addWorksheet("Master Content Pipeline");
  populateSheet(masterSheet, records);

  // Sub-sheets by Format
  for (const [fmt, group] of Array.from(formatGroups.entries())) {
    const sheetName = fmt.replace(/[\/\\?*:[\]]/g, "").slice(0, 31);
    const subSheet = workbook.addWorksheet(sheetName);
    populateSheet(subSheet, group);
  }

  return workbook;
}

/**
 * Trigger client-side download of the workbook
 */
export async function downloadExcelDatabase(records: ContentRecord[], filename = EXCEL_FILENAME): Promise<void> {
  const workbook = await buildStyledExcelWorkbook(records);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
