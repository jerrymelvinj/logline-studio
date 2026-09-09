"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Youtube,
  Database,
  Key,
  Sliders,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DraftContentItem, ContentFormat, ChannelTemplate } from "@/lib/types";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";

interface Screen01IdeateProps {
  onAddDraftItem: (item: DraftContentItem) => void;
  onLoadTrendSparks: () => void;
  onOpenContentDb: () => void;
  onOpenApiKeyModal: () => void;
  onOpenChannelModal: () => void;
  onOpenSheetsModal: () => void;
  hasApiKey: boolean;
  channelTemplate: ChannelTemplate;
}

const FORMAT_OPTIONS: ContentFormat[] = [
  "Long-form Video",
  "YouTube Short",
  "Community Post",
  "Live Stream",
  "Podcast / Interview",
];

export default function Screen01Ideate({
  onAddDraftItem,
  onLoadTrendSparks,
  onOpenContentDb,
  onOpenApiKeyModal,
  onOpenChannelModal,
  onOpenSheetsModal,
  hasApiKey,
  channelTemplate,
}: Screen01IdeateProps) {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ContentFormat>("Long-form Video");
  const [pillar, setPillar] = useState(channelTemplate.contentPillars[0] || "Tutorial & How-To");
  const [rawNotes, setRawNotes] = useState("");
  const [audienceAngle, setAudienceAngle] = useState("");

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: DraftContentItem = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      format,
      pillar,
      rawNotes: rawNotes.trim(),
      targetChannel: channelTemplate.name,
      audienceAngle: audienceAngle.trim(),
    };

    onAddDraftItem(newItem);
    setTitle("");
    setRawNotes("");
    setAudienceAngle("");
  };

  return (
    <div className="min-h-screen bg-pageBg flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              YouTube Studio Hub
              <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Content Curation & Google Sheets Pipeline</p>
          </div>
        </div>

        {/* Global Action Modals Trigger */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenChannelModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
          >
            <Sliders className="w-3.5 h-3.5 text-gray-500" />
            <span>Channel: {channelTemplate.name}</span>
          </button>

          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheets Sync</span>
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>Gemini AI</span>
            {hasApiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Zero Uploads • Direct Curation • Google Sheets Integration
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Draft, Curate & Execute Your YouTube Content
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Write your video ideas, let Gemini AI generate high-CTR hooks, scripts, and SEO tags, and automatically sync
            everything directly to your connected Google Sheet.
          </p>
        </div>

        {/* Studio Input Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 p-6 md:p-8 mb-6">
          <form onSubmit={handleCreateDraft} className="space-y-6">
            {/* Title / Topic Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Video Topic or Working Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why Senior Engineers Write Less Code (And Why You Should Too)"
                className="w-full px-4 py-3.5 text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-900"
                required
              />
            </div>

            {/* Format & Pillar Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Format Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Content Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormat(opt)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        format === opt
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {opt === "YouTube Short" ? "⚡ Short (9:16)" : opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Pillar Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Content Pillar / Category
                </label>
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white text-gray-800 font-medium"
                >
                  {channelTemplate.contentPillars.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Talking Points & Angle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Raw Talking Points / Notes (Optional)
                </label>
                <textarea
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  rows={3}
                  placeholder="Key concepts, talking points, software tools mentioned, or personal stories..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-gray-400 font-normal text-gray-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Target Viewer / Specific Angle (Optional)
                </label>
                <textarea
                  value={audienceAngle}
                  onChange={(e) => setAudienceAngle(e.target.value)}
                  rows={3}
                  placeholder="e.g. Junior devs struggling with impostor syndrome, or founders building AI MVPs..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-gray-400 font-normal text-gray-800 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-appBlue hover:bg-appBlue-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Add Topic to Staging Canvas ➔
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Instant Trend Sparks Button */}
                <button
                  type="button"
                  onClick={onLoadTrendSparks}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  ⚡ Load AI Trend Sparks (5 Samples)
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Database & Quick Links Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenContentDb}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-appGreen-border bg-white text-appGreen-text font-bold text-xs hover:bg-appGreen-hover transition-colors shadow-sm"
            >
              <Database className="w-4 h-4 text-appGreen-border" />
              Go to Content DB Inspector
            </button>

            <a
              href={DEFAULT_GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              Open Live Google Sheet ↗
            </a>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Sheet ID: <span className="font-mono text-gray-700 font-bold">1BauHyRepxXE...AhvQ</span>
          </div>
        </div>
      </main>
    </div>
  );
}
