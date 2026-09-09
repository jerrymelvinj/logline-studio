"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Database,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ExternalLink,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  Eye,
  Edit3,
} from "lucide-react";
import { ContentRecord, ContentStatus, ContentFormat, SyncNotification } from "@/lib/types";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";

interface Screen03ExecutionTableProps {
  records: ContentRecord[];
  onUpdateRecord: (index: number, field: keyof ContentRecord, value: any) => void;
  onBack: () => void;
  onOpenContentDb: () => void;
  onSyncGoogleSheets: () => void;
  onDownloadExcelBackup: () => void;
  onOpenSheetsModal: () => void;
  hasSheetsWebhook: boolean;
  notification: SyncNotification | null;
  isSyncing: boolean;
}

const STATUS_OPTIONS: ContentStatus[] = [
  "Idea / Draft",
  "Scripting",
  "Ready to Record",
  "In Editing",
  "Scheduled",
  "Published",
  "On Hold",
];

const FORMAT_OPTIONS: ContentFormat[] = [
  "Long-form Video",
  "YouTube Short",
  "Community Post",
  "Live Stream",
  "Podcast / Interview",
];

export default function Screen03ExecutionTable({
  records,
  onUpdateRecord,
  onBack,
  onOpenContentDb,
  onSyncGoogleSheets,
  onDownloadExcelBackup,
  onOpenSheetsModal,
  hasSheetsWebhook,
  notification,
  isSyncing,
}: Screen03ExecutionTableProps) {
  const [selectedRowDetail, setSelectedRowDetail] = useState<ContentRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Row background coloring based on Status
   */
  const getRowBgClass = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950";
      case "Scheduled":
        return "bg-amber-50/70 hover:bg-amber-100/70 text-amber-950";
      case "In Editing":
        return "bg-purple-50/70 hover:bg-purple-100/70 text-purple-950";
      case "Ready to Record":
        return "bg-sky-50/70 hover:bg-sky-100/70 text-sky-950";
      case "Scripting":
        return "bg-blue-50/70 hover:bg-blue-100/70 text-blue-950";
      case "On Hold":
        return "bg-rose-50/70 hover:bg-rose-100/70 text-rose-950";
      default:
        return "bg-white hover:bg-gray-50 text-gray-900";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Scheduled":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "In Editing":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Ready to Record":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "Scripting":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "On Hold":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-pageBg flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center transition-transform hover:scale-105 shadow"
            title="Back to Staging"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Content Pipeline Ready for Execution!
            </h1>
            <p className="text-xs text-gray-500">
              Inline-editable table synced to your live Google Sheet database
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheet Sync Settings</span>
          </button>

          <a
            href={DEFAULT_GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>Open Sheet ↗</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 flex flex-col">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-xl border shadow-md transition-all flex items-start justify-between ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : notification.type === "error"
                ? "bg-rose-50 border-rose-300 text-rose-900"
                : "bg-blue-50 border-blue-300 text-blue-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div className="text-xs">
                {notification.type === "success" ? (
                  <>
                    <span className="font-bold">Sync Successful! </span>
                    Saved & synced <strong>{notification.savedCount}</strong> item(s) to your Google
                    Sheet database!
                    {notification.duplicateCount ? (
                      <span className="ml-1 text-emerald-700">
                        ({notification.duplicateCount} updated/deduplicated).
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <span className="font-bold">Sync Notice: </span>
                    {notification.errorMessage}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dense Inline Editable Table Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col mb-4">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              {/* Deep Blue Table Header (Matches previous project #00529B) */}
              <thead>
                <tr className="bg-appBlue text-white font-semibold uppercase tracking-wider text-[11px] border-b border-appBlue-dark">
                  <th className="py-3 px-3 w-12 text-center border-r border-blue-700/50">#</th>
                  <th className="py-3 px-3 min-w-[220px] border-r border-blue-700/50">Content Title</th>
                  <th className="py-3 px-3 min-w-[130px] border-r border-blue-700/50">Format</th>
                  <th className="py-3 px-3 min-w-[140px] border-r border-blue-700/50">Pillar</th>
                  <th className="py-3 px-3 min-w-[200px] border-r border-blue-700/50">Hook / Opening 10s</th>
                  <th className="py-3 px-3 min-w-[220px] border-r border-blue-700/50">Script Outline</th>
                  <th className="py-3 px-3 min-w-[180px] border-r border-blue-700/50">SEO Tags</th>
                  <th className="py-3 px-3 min-w-[200px] border-r border-blue-700/50">Thumbnail Brief</th>
                  <th className="py-3 px-3 min-w-[140px] border-r border-blue-700/50">Target Channel</th>
                  <th className="py-3 px-3 min-w-[170px] border-r border-blue-700/50">Schedule (Date/Time)</th>
                  <th className="py-3 px-3 min-w-[140px] border-r border-blue-700/50">Status</th>
                  <th className="py-3 px-3 min-w-[160px] border-r border-blue-700/50">Execution Notes</th>
                  <th className="py-3 px-3 w-16 text-center">Inspect</th>
                </tr>
              </thead>

              {/* Table Body with Dynamic Status Row Coloring */}
              <tbody className="divide-y divide-gray-200 font-medium">
                {records.map((rec, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${getRowBgClass(rec.status as string)}`}
                  >
                    {/* S.No */}
                    <td className="py-2.5 px-2 text-center font-mono text-gray-500 font-semibold border-r border-gray-100">
                      {idx + 1}
                    </td>

                    {/* Title */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <input
                        type="text"
                        value={rec.title}
                        onChange={(e) => onUpdateRecord(idx, "title", e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none font-bold text-gray-900 transition-all"
                      />
                      {rec.titleVariations && rec.titleVariations.length > 1 && (
                        <div className="text-[10px] text-blue-600 font-medium mt-0.5 cursor-pointer hover:underline"
                             onClick={() => setSelectedRowDetail(rec)}>
                          + {rec.titleVariations.length - 1} AI variations
                        </div>
                      )}
                    </td>

                    {/* Format Dropdown */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <select
                        value={rec.format}
                        onChange={(e) => onUpdateRecord(idx, "format", e.target.value)}
                        className="w-full bg-white/80 border border-gray-200 rounded px-2 py-1 text-xs font-semibold text-gray-800 outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        {FORMAT_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Pillar */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <input
                        type="text"
                        value={rec.pillar}
                        onChange={(e) => onUpdateRecord(idx, "pillar", e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none font-medium text-gray-800"
                      />
                    </td>

                    {/* Hook */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <textarea
                        value={rec.hook}
                        onChange={(e) => onUpdateRecord(idx, "hook", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none text-[11px] text-gray-700 resize-none font-normal"
                      />
                    </td>

                    {/* Outline */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <textarea
                        value={rec.scriptOutline}
                        onChange={(e) => onUpdateRecord(idx, "scriptOutline", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none text-[11px] text-gray-700 resize-none font-normal font-mono"
                      />
                    </td>

                    {/* SEO Tags */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <input
                        type="text"
                        value={rec.seoTags}
                        onChange={(e) => onUpdateRecord(idx, "seoTags", e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none text-[11px] text-gray-600"
                      />
                    </td>

                    {/* Thumbnail Brief */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <textarea
                        value={rec.thumbnailBrief}
                        onChange={(e) => onUpdateRecord(idx, "thumbnailBrief", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none text-[11px] text-gray-700 resize-none"
                      />
                    </td>

                    {/* Target Channel */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <input
                        type="text"
                        value={rec.targetChannel}
                        onChange={(e) => onUpdateRecord(idx, "targetChannel", e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none text-xs text-gray-800"
                      />
                    </td>

                    {/* Schedule (Date & Time) */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <div className="flex items-center gap-1 bg-white/90 border border-gray-200 rounded px-2 py-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={rec.scheduleTime}
                          onChange={(e) => onUpdateRecord(idx, "scheduleTime", e.target.value)}
                          placeholder="DD/MM/YYYY, HH:MM AM/PM"
                          className="w-full bg-transparent border-0 text-[11px] font-mono outline-none text-gray-800"
                        />
                      </div>
                    </td>

                    {/* Status Dropdown (Color coded) */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <select
                        value={rec.status}
                        onChange={(e) => onUpdateRecord(idx, "status", e.target.value)}
                        className={`w-full border rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer ${getStatusBadgeClass(
                          rec.status as string
                        )}`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Notes */}
                    <td className="py-2 px-3 border-r border-gray-100">
                      <input
                        type="text"
                        value={rec.notes}
                        onChange={(e) => onUpdateRecord(idx, "notes", e.target.value)}
                        placeholder="Drive link or notes..."
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-1 rounded outline-none text-xs text-gray-700"
                      />
                    </td>

                    {/* Detail Modal Action */}
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => setSelectedRowDetail(rec)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Full Content & AI Script Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls Bar (Matching previous project) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center transition-transform hover:scale-105 shadow"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenContentDb}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-appGreen-border bg-white text-appGreen-text font-bold text-xs hover:bg-appGreen-hover transition-colors shadow-sm"
            >
              <Database className="w-4 h-4 text-appGreen-border" />
              Go to Content DB Inspector
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Download Excel Backup Button */}
            <button
              onClick={onDownloadExcelBackup}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Download Excel Backup (.xlsx)
            </button>

            {/* Primary Save & Sync Button */}
            <button
              onClick={onSyncGoogleSheets}
              disabled={isSyncing || records.length === 0}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                isSyncing || records.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-appBlue hover:bg-appBlue-dark active:scale-[0.99]"
              }`}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Syncing to Google Sheets...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                  <span>Sync to Google Sheets ➔</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Full Content Item Inspector Modal */}
      {selectedRowDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {selectedRowDetail.format} • {selectedRowDetail.pillar}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {selectedRowDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Alternative Titles */}
              {selectedRowDetail.titleVariations && selectedRowDetail.titleVariations.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700 uppercase text-[11px] mb-1.5">
                    Alternative High-CTR Titles
                  </h4>
                  <div className="space-y-1">
                    {selectedRowDetail.titleVariations.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                      >
                        <span className="font-medium text-gray-800">{v}</span>
                        <button
                          onClick={() => handleCopy(v, `title-${i}`)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          {copiedId === `title-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hook */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-700 uppercase text-[11px]">
                    Pattern-Interrupt Hook (Opening 10-15s)
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedRowDetail.hook, "hook")}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedId === "hook" ? "Copied!" : "Copy Hook"}
                  </button>
                </div>
                <p className="bg-amber-50/70 text-amber-950 p-3 rounded-lg border border-amber-200 leading-relaxed font-medium">
                  {selectedRowDetail.hook}
                </p>
              </div>

              {/* Script Outline */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-700 uppercase text-[11px]">
                    Script Outline & Talking Points
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedRowDetail.scriptOutline, "script")}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedId === "script" ? "Copied!" : "Copy Outline"}
                  </button>
                </div>
                <pre className="bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-200 font-mono whitespace-pre-wrap leading-relaxed text-[11px]">
                  {selectedRowDetail.scriptOutline}
                </pre>
              </div>

              {/* Thumbnail Brief */}
              <div>
                <h4 className="font-bold text-gray-700 uppercase text-[11px] mb-1">
                  Thumbnail Concept Brief
                </h4>
                <p className="bg-blue-50/60 text-blue-950 p-3 rounded-lg border border-blue-200 leading-relaxed">
                  {selectedRowDetail.thumbnailBrief}
                </p>
              </div>

              {/* YouTube Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-700 uppercase text-[11px]">
                    Ready YouTube Description
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedRowDetail.description, "desc")}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedId === "desc" ? "Copied!" : "Copy Description"}
                  </button>
                </div>
                <pre className="bg-gray-50 text-gray-700 p-3 rounded-lg border border-gray-200 font-sans whitespace-pre-wrap leading-relaxed text-[11px] max-h-40 overflow-y-auto">
                  {selectedRowDetail.description}
                </pre>
              </div>

              {/* SEO Tags */}
              <div>
                <h4 className="font-bold text-gray-700 uppercase text-[11px] mb-1">SEO Keywords & Tags</h4>
                <p className="bg-gray-50 text-gray-600 p-2 rounded-lg border border-gray-200 text-[11px]">
                  {selectedRowDetail.seoTags}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
