"use client";

import React, { useState, useMemo } from "react";
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
  Trash2,
  Search,
  Clapperboard,
  Plus,
  Zap,
} from "lucide-react";
import { ContentRecord, ContentStatus, ContentFormat, SyncNotification } from "@/lib/types";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";

interface Screen03ExecutionTableProps {
  records: ContentRecord[];
  onUpdateRecord: (index: number, field: keyof ContentRecord, value: any) => void;
  onDeleteRecord?: (index: number) => void;
  onBack: () => void;
  onOpenContentDb: () => void;
  onSyncGoogleSheets: () => void;
  onDownloadExcelBackup: () => void;
  onOpenSheetsModal: () => void;
  hasSheetsWebhook: boolean;
  notification: SyncNotification | null;
  isSyncing: boolean;
  onDraftFirstVideo?: () => void;
}

const STAGE_OPTIONS: ContentStatus[] = [
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
  onDeleteRecord,
  onBack,
  onOpenContentDb,
  onSyncGoogleSheets,
  onDownloadExcelBackup,
  onOpenSheetsModal,
  hasSheetsWebhook,
  notification,
  isSyncing,
  onDraftFirstVideo,
}: Screen03ExecutionTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [selectedRowDetail, setSelectedRowDetail] = useState<ContentRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Stage Badge Copy & Color Styles
   */
  const getStageBadgeClass = (status: string) => {
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

  const getRowBgClass = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-950";
      case "Scheduled":
        return "bg-amber-50/60 hover:bg-amber-100/60 text-amber-950";
      case "In Editing":
        return "bg-purple-50/60 hover:bg-purple-100/60 text-purple-950";
      case "Ready to Record":
        return "bg-sky-50/60 hover:bg-sky-100/60 text-sky-950";
      case "Scripting":
        return "bg-blue-50/60 hover:bg-blue-100/60 text-blue-950";
      case "On Hold":
        return "bg-rose-50/60 hover:bg-rose-100/60 text-rose-950";
      default:
        return "bg-white hover:bg-gray-50 text-gray-900";
    }
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (formatFilter !== "all" && r.format !== formatFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (r.title || "").toLowerCase().includes(q);
        const matchPillar = (r.pillar || "").toLowerCase().includes(q);
        const matchHook = (r.hook || "").toLowerCase().includes(q);
        const matchTags = (r.seoTags || "").toLowerCase().includes(q);
        if (!matchTitle && !matchPillar && !matchHook && !matchTags) return false;
      }
      return true;
    });
  }, [records, statusFilter, formatFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col max-w-[1700px] w-full mx-auto p-4 md:p-6 font-sans">
      {/* Header & Subheading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Screen 03 • Execution & Sheet Sync</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight font-poppins">
            Master Execution Pipeline
          </h1>
          <p className="text-xs md:text-sm text-gray-600">
            Real-time status tracking and multi-channel publication queue.
          </p>
        </div>

        {/* Global Sync Action in Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSyncGoogleSheets}
            disabled={isSyncing || records.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
              isSyncing || records.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-appBlue hover:bg-appBlue-dark active:scale-[0.99]"
            }`}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Syncing changes...</span>
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
            <div className="text-xs font-semibold">
              {notification.type === "success" ? (
                <>
                  Synced successfully to Master Pipeline ({notification.savedCount} rows updated).
                </>
              ) : (
                <>{notification.errorMessage}</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, pillar, or tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 outline-none"
          >
            <option value="all">All Stages (7)</option>
            {STAGE_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 outline-none"
          >
            <option value="all">All Formats</option>
            {FORMAT_OPTIONS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {records.length === 0 ? (
        <div className="flex-1 min-h-[380px] bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <Clapperboard className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No content in production yet.
          </h3>
          <p className="text-xs text-gray-500 mb-5 max-w-sm">
            Create your first video logline or import existing items from your connected sheet.
          </p>
          <button
            onClick={onDraftFirstVideo || onBack}
            className="px-5 py-2.5 bg-appBlue hover:bg-appBlue-dark text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            Draft First Video ➔
          </button>
        </div>
      ) : (
        /* Table Container */
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col mb-4">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-appBlue text-white font-semibold uppercase tracking-wider text-[11px] border-b border-appBlue-dark">
                  <th className="py-3 px-3 w-12 text-center border-r border-blue-700/50">#</th>
                  <th className="py-3 px-3 min-w-[240px] border-r border-blue-700/50">
                    Title & Pillar
                  </th>
                  <th className="py-3 px-3 min-w-[130px] border-r border-blue-700/50">Format</th>
                  <th className="py-3 px-3 min-w-[240px] border-r border-blue-700/50">
                    Hook / Logline
                  </th>
                  <th className="py-3 px-3 min-w-[150px] border-r border-blue-700/50">
                    Target Channel
                  </th>
                  <th className="py-3 px-3 min-w-[170px] border-r border-blue-700/50">
                    Scheduled For
                  </th>
                  <th className="py-3 px-3 min-w-[150px] border-r border-blue-700/50">
                    Production Stage
                  </th>
                  <th className="py-3 px-3 w-24 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 font-medium">
                {filteredRecords.map((rec, idx) => {
                  const originalIndex = records.indexOf(rec);
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${getRowBgClass(rec.status as string)}`}
                    >
                      {/* # */}
                      <td className="py-3 px-2 text-center font-mono text-gray-500 font-semibold border-r border-gray-100">
                        {idx + 1}
                      </td>

                      {/* Title & Pillar */}
                      <td className="py-2.5 px-3 border-r border-gray-100">
                        <input
                          type="text"
                          value={rec.title}
                          onChange={(e) =>
                            onUpdateRecord(originalIndex, "title", e.target.value)
                          }
                          className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded outline-none font-bold text-gray-900 transition-all"
                        />
                        <div className="flex items-center justify-between gap-1.5 mt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {rec.pillar}
                            </span>
                            {rec.titleVariations && rec.titleVariations.length > 1 && (
                              <span
                                onClick={() => setSelectedRowDetail(rec)}
                                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                              >
                                +{rec.titleVariations.length - 1} alt titles
                              </span>
                            )}
                          </div>
                          {/* Character Count Validation */}
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              rec.title.length > 60
                                ? "text-amber-800 bg-amber-100 border border-amber-300"
                                : "text-emerald-700 bg-emerald-50"
                            }`}
                            title={
                              rec.title.length > 60
                                ? "Warning: May be truncated on mobile search (>60 chars)"
                                : "Optimal search title length (≤60 chars)"
                            }
                          >
                            {rec.title.length}c {rec.title.length > 60 && "⚠️ >60"}
                          </span>
                        </div>
                      </td>

                      {/* Format & Auto-tagging indicator */}
                      <td className="py-2.5 px-3 border-r border-gray-100">
                        <select
                          value={rec.format}
                          onChange={(e) =>
                            onUpdateRecord(originalIndex, "format", e.target.value)
                          }
                          className="w-full bg-white/80 border border-gray-200 rounded px-2 py-1 text-xs font-semibold text-gray-800 outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          {FORMAT_OPTIONS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        {/* Auto-detected Short badge if outline has under 60s or marked short */}
                        {(rec.format === "YouTube Short" ||
                          rec.scriptOutline?.toLowerCase().includes("short") ||
                          rec.scriptOutline?.toLowerCase().includes("<60") ||
                          rec.scriptOutline?.toLowerCase().includes("45s")) && (
                          <div className="mt-1 flex items-center">
                            <span className="text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 text-rose-500" />
                              Short (≤60s)
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Hook / Logline */}
                      <td className="py-2.5 px-3 border-r border-gray-100">
                        <textarea
                          value={rec.hook}
                          onChange={(e) =>
                            onUpdateRecord(originalIndex, "hook", e.target.value)
                          }
                          rows={2}
                          className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded outline-none text-[11px] text-gray-800 resize-none font-normal"
                        />
                      </td>

                      {/* Target Channel */}
                      <td className="py-2.5 px-3 border-r border-gray-100">
                        <input
                          type="text"
                          value={rec.targetChannel}
                          onChange={(e) =>
                            onUpdateRecord(originalIndex, "targetChannel", e.target.value)
                          }
                          className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded outline-none text-xs text-gray-800 font-medium"
                        />
                      </td>

                      {/* Scheduled For */}
                      <td className="py-2.5 px-3 border-r border-gray-100">
                        <div className="flex items-center gap-1 bg-white/90 border border-gray-200 rounded px-2 py-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={rec.scheduleTime}
                            onChange={(e) =>
                              onUpdateRecord(originalIndex, "scheduleTime", e.target.value)
                            }
                            placeholder="DD/MM/YYYY, HH:MM AM/PM"
                            className="w-full bg-transparent border-0 text-[11px] font-mono outline-none text-gray-800"
                          />
                        </div>
                      </td>

                      {/* Production Stage */}
                      <td className="py-2.5 px-3 border-r border-gray-100">
                        <select
                          value={rec.status}
                          onChange={(e) =>
                            onUpdateRecord(originalIndex, "status", e.target.value)
                          }
                          className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${getStageBadgeClass(
                            rec.status as string
                          )}`}
                        >
                          {STAGE_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedRowDetail(rec)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Inspect Script & Packaging Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onDeleteRecord && (
                            <button
                              onClick={() => onDeleteRecord(originalIndex)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Controls Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center transition-transform hover:scale-105 shadow"
            title="Back to Canvas"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenContentDb}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Master Pipeline Inspector</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onDownloadExcelBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Download Backup (.xlsx)</span>
          </button>

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
                <span>Syncing to Master Pipeline...</span>
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

      {/* Row Detail Inspector Modal */}
      {selectedRowDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto font-sans">
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
              {/* Hook */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-700 uppercase text-[11px]">
                    Hook / Opening 10s
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
                    Script & Storyboard Beats
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedRowDetail.scriptOutline, "beats")}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedId === "beats" ? "Copied!" : "Copy Beats"}
                  </button>
                </div>
                <pre className="bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-200 font-mono whitespace-pre-wrap leading-relaxed text-[11px]">
                  {selectedRowDetail.scriptOutline}
                </pre>
              </div>

              {/* Thumbnail Brief */}
              <div>
                <h4 className="font-bold text-gray-700 uppercase text-[11px] mb-1">
                  Thumbnail Visual Brief
                </h4>
                <p className="bg-blue-50/60 text-blue-950 p-3 rounded-lg border border-blue-200 leading-relaxed">
                  {selectedRowDetail.thumbnailBrief}
                </p>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-700 uppercase text-[11px]">
                    Video Description & Chapters
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
