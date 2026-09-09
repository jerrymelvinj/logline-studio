"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Database,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { ContentRecord } from "@/lib/types";
import { downloadExcelDatabase } from "@/lib/excelExport";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";

interface ContentDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: ContentRecord[];
  onClearDb: () => void;
}

export default function ContentDbModal({
  isOpen,
  onClose,
  database,
  onClearDb,
}: ContentDbModalProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Extract unique formats for tabs
  const formats = useMemo(() => {
    const set = new Set<string>();
    database.forEach((r) => {
      if (r.format) set.add(r.format);
    });
    return Array.from(set);
  }, [database]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return database.filter((rec) => {
      // Tab filter
      if (activeTab !== "all" && rec.format !== activeTab) return false;

      // Status filter
      if (statusFilter !== "all" && rec.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (rec.title || "").toLowerCase().includes(q);
        const matchPillar = (rec.pillar || "").toLowerCase().includes(q);
        const matchTags = (rec.seoTags || "").toLowerCase().includes(q);
        const matchNotes = (rec.notes || "").toLowerCase().includes(q);
        if (!matchTitle && !matchPillar && !matchTags && !matchNotes) return false;
      }

      return true;
    });
  }, [database, activeTab, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadExcelDatabase(database);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all locally saved content records?")) {
      onClearDb();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Scheduled":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Ready to Record":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "In Editing":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Scripting":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "On Hold":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6">
      <div className="bg-white rounded-2xl max-w-6xl w-full flex flex-col shadow-2xl border border-gray-200 h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-appGreen-hover text-appGreen-text flex items-center justify-center border border-appGreen-border/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Content Database Inspector
                <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-0.5 rounded-full border">
                  {database.length} Total Records
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Multi-sheet local cache synchronized with Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={DEFAULT_GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              Open Live Sheet ↗
            </a>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter and Tab Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-appBlue text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Content ({database.length})
            </button>
            {formats.map((fmt) => {
              const count = database.filter((r) => r.format === fmt).length;
              return (
                <button
                  key={fmt}
                  onClick={() => setActiveTab(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === fmt
                      ? "bg-appBlue text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {fmt} ({count})
                </button>
              );
            })}
          </div>

          {/* Search and Status Dropdown */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, tags..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white text-gray-700 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Idea / Draft">Idea / Draft</option>
              <option value="Scripting">Scripting</option>
              <option value="Ready to Record">Ready to Record</option>
              <option value="In Editing">In Editing</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Database Records Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Layers className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No records found</p>
              <p className="text-xs text-gray-500">
                {database.length === 0
                  ? "Your content database is currently empty. Run your first studio draft!"
                  : "No items match your active tab or search query."}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Pillar</th>
                    <th className="py-2.5 px-3">Schedule</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-gray-400 font-mono">
                        {r.sNo || i + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900 max-w-xs truncate">
                        {r.title}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 font-medium">{r.format}</td>
                      <td className="py-2.5 px-3 text-blue-600 font-medium">{r.pillar}</td>
                      <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px]">
                        {r.scheduleTime || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            r.status as string
                          )}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 text-[11px]">{r.targetChannel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleClear}
            disabled={database.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Local Database
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              disabled={database.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-appBlue hover:bg-appBlue-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel Database (.xlsx)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
