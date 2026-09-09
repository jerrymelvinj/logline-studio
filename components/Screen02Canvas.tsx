"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  Trash2,
  Plus,
  Video,
  Zap,
  Radio,
  FileText,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { DraftContentItem, ContentFormat, ChannelTemplate } from "@/lib/types";

interface Screen02CanvasProps {
  items: DraftContentItem[];
  onAddItem: (item: DraftContentItem) => void;
  onRemoveItem: (id: string) => void;
  onCurateData: () => void;
  isCurating: boolean;
  onBackToIdeate: () => void;
  channelTemplate: ChannelTemplate;
}

export default function Screen02Canvas({
  items,
  onAddItem,
  onRemoveItem,
  onCurateData,
  isCurating,
  onBackToIdeate,
  channelTemplate,
}: Screen02CanvasProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickFormat, setQuickFormat] = useState<ContentFormat>("Long-form Video");
  const [quickPillar, setQuickPillar] = useState(channelTemplate.contentPillars[0] || "Tutorial & How-To");
  const [quickNotes, setQuickNotes] = useState("");

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddItem({
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: quickTitle.trim(),
      format: quickFormat,
      pillar: quickPillar,
      rawNotes: quickNotes.trim(),
      targetChannel: channelTemplate.name,
    });

    setQuickTitle("");
    setQuickNotes("");
    setIsQuickAddOpen(false);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "YouTube Short":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "Live Stream":
        return <Radio className="w-4 h-4 text-red-500" />;
      case "Community Post":
        return <FileText className="w-4 h-4 text-emerald-500" />;
      default:
        return <Video className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-pageBg flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToIdeate}
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Studio
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
              Staging & Curation Canvas
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "concept" : "concepts"} queued
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 font-medium">Channel: {channelTemplate.name}</span>
        </div>
      </header>

      {/* Main Staging Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Left Side: Staging Cards Grid */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
              Queued Content Concepts
            </h2>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Quick Add Another
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
              <Layers className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700 mb-1">No concepts in staging</p>
              <p className="text-xs text-gray-500 mb-4">Add your first video idea or load trend sparks.</p>
              <button
                onClick={onBackToIdeate}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Go to Ideate Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200/90 hover:border-blue-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Format and Pillar Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
                          {getFormatIcon(item.format)}
                          {item.format}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          {item.pillar}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-400 font-bold">#{idx + 1}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Notes preview */}
                    {item.rawNotes && (
                      <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3 font-normal">
                        {item.rawNotes}
                      </p>
                    )}

                    {item.audienceAngle && (
                      <p className="text-xs text-gray-500 italic mb-2">
                        Target: {item.audienceAngle}
                      </p>
                    )}
                  </div>

                  {/* Card Footer with Delete */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">
                      Channel: {item.targetChannel}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove concept"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Docked Management Sidebar (Matches previous project Screen02) */}
        <div className="w-full lg:w-80 flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 flex flex-col h-full sticky top-20">
            {/* Header with Sky-Blue floating + button and live counter */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Execution Queue</h3>
                <p className="text-xs text-gray-500">Ready for AI enrichment</p>
              </div>

              {/* Sky-Blue pill counter badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-appSky/10 border border-appSky text-appSky-dark rounded-full text-xs font-bold shadow-sm">
                <span>{items.length}</span>
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* List of items in solid deep blue cards (Matches previous project #0057B7) */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[420px] pr-1 mb-5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-appBlue-card text-white rounded-xl p-3 flex items-start justify-between shadow-sm relative group"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] bg-white/20 text-white font-semibold px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">
                        {item.format}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-white/70 hover:text-white hover:bg-white/20 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sticky Bottom CTA: Curate & Polish with AI */}
            <div className="pt-2">
              <button
                onClick={onCurateData}
                disabled={items.length === 0 || isCurating}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  items.length === 0 || isCurating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-appBlue hover:bg-appBlue-dark hover:shadow-lg active:scale-[0.99]"
                }`}
              >
                {isCurating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Curating with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Curate Data with AI ➔</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-gray-500 mt-2 font-medium">
                Generates high-CTR hooks, SEO tags, outlines & descriptions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add Another Video Concept</h3>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Topic / Title
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="e.g. 10 Productivity Hacks in VS Code"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Format
                  </label>
                  <select
                    value={quickFormat}
                    onChange={(e) => setQuickFormat(e.target.value as ContentFormat)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Long-form Video">Long-form Video</option>
                    <option value="YouTube Short">YouTube Short</option>
                    <option value="Community Post">Community Post</option>
                    <option value="Live Stream">Live Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Pillar
                  </label>
                  <select
                    value={quickPillar}
                    onChange={(e) => setQuickPillar(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {channelTemplate.contentPillars.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Brief Notes / Points
                </label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  rows={3}
                  placeholder="Talking points, key takeaways, tools..."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Add to Staging
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
