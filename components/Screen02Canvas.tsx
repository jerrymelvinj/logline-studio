"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Video,
  Zap,
  Radio,
  FileText,
  Loader2,
  Trash2,
  Check,
  Send,
  Clapperboard,
  Sliders,
  Layers,
  Plus,
} from "lucide-react";
import { DraftContentItem, ContentRecord, ContentStatus, ChannelTemplate } from "@/lib/types";

interface Screen02CanvasProps {
  items: DraftContentItem[];
  onAddItem: (item: DraftContentItem) => void;
  onRemoveItem: (id: string) => void;
  onPushToPipeline: (records: ContentRecord[]) => void;
  onCurateWithAi: () => void;
  isCurating: boolean;
  onBackToDraft: () => void;
  channelTemplate: ChannelTemplate;
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

export default function Screen02Canvas({
  items,
  onAddItem,
  onRemoveItem,
  onPushToPipeline,
  onCurateWithAi,
  isCurating,
  onBackToDraft,
  channelTemplate,
}: Screen02CanvasProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Local editable canvas state for active item
  const [activeTitle, setActiveTitle] = useState("");
  const [activeBeats, setActiveBeats] = useState("");
  const [activeThumbnail, setActiveThumbnail] = useState("");
  const [activeDescription, setActiveDescription] = useState("");
  const [activeTags, setActiveTags] = useState("");
  const [activeChannel, setActiveChannel] = useState(channelTemplate.name);
  const [activeStage, setActiveStage] = useState<ContentStatus>("Scripting");

  // Keep in sync when switching between queued items
  useEffect(() => {
    if (items.length > 0 && items[selectedIndex]) {
      const current = items[selectedIndex];
      setActiveTitle(current.title);
      setActiveChannel(current.targetChannel || channelTemplate.name);
      // If rawNotes has structured parts, preload
      if (!activeBeats) {
        setActiveBeats(
          `0:00 Hook & Cold Open\n0:45 The Core Tension\n2:30 Step-by-Step Breakdown\n${current.rawNotes || ""}`
        );
      }
      if (!activeThumbnail) {
        setActiveThumbnail(
          `High-contrast visual of ${current.title.slice(0, 30)}. Creator with focused expression. Text badge: "${current.title.split(" ").slice(0, 3).join(" ").toUpperCase()}".`
        );
      }
      if (!activeTags) {
        setActiveTags(`${current.pillar.toLowerCase()}, ${current.format.toLowerCase().replace(" ", "-")}, youtube, coding`);
      }
      if (!activeDescription) {
        setActiveDescription(
          `${current.title}\n\n📌 Summary:\n${current.rawNotes || "Actionable video walkthrough."}\n\n---\n${channelTemplate.defaultOutro}\n\n🔗 ${channelTemplate.socialLinks}`
        );
      }
    }
  }, [selectedIndex, items]);

  const activeItem = items[selectedIndex] || items[0];

  const handlePushCurrentToPipeline = () => {
    if (!activeItem) return;
    const now = new Date();
    const scheduleDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const scheduleTime = `${String(scheduleDate.getDate()).padStart(2, "0")}/${String(
      scheduleDate.getMonth() + 1
    ).padStart(2, "0")}/${scheduleDate.getFullYear()}, 06:00 PM`;

    const record: ContentRecord = {
      sNo: 1,
      title: activeTitle || activeItem.title,
      format: activeItem.format,
      pillar: activeItem.pillar,
      hook: activeBeats.split("\n")[0] || "Hook line",
      scriptOutline: activeBeats,
      thumbnailBrief: activeThumbnail,
      description: activeDescription,
      seoTags: activeTags,
      targetChannel: activeChannel,
      scheduleTime,
      status: activeStage,
      notes: activeItem.rawNotes || "Prepared in Production Canvas",
      addedTimestamp: new Date().toISOString(),
    };

    onPushToPipeline([record]);
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <Clapperboard className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Canvas is empty</h2>
        <p className="text-xs text-gray-500 mb-4 max-w-sm">
          Draft a video concept in Screen 01 or load trend sparks to start expanding narrative beats and packaging.
        </p>
        <button
          onClick={onBackToDraft}
          className="px-5 py-2.5 bg-appBlue hover:bg-appBlue-dark text-white rounded-xl text-xs font-bold shadow transition-all"
        >
          Go to Draft Studio ➔
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 font-sans">
      {/* Header & Subheading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Screen 02 • Script & Production Canvas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight font-poppins">
            Production Canvas
          </h1>
          <p className="text-xs md:text-sm text-gray-600">
            Structure your narrative beats, visual assets, and packaging.
          </p>
        </div>

        {/* AI Action CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCurateWithAi}
            disabled={isCurating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {isCurating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Flesh with Gemini AI ➔</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Queued Concepts List */}
        <div className="w-full lg:w-72 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Queued Pieces ({items.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between relative group ${
                  selectedIndex === idx
                    ? "bg-white border-blue-600 shadow-md ring-1 ring-blue-600"
                    : "bg-white/80 hover:bg-white border-gray-200"
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">
                      {item.format}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h4>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="text-gray-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Canvas Sections */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Active Title Banner */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                {activeItem.format}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                {activeItem.pillar}
              </span>
            </div>
            <input
              type="text"
              value={activeTitle}
              onChange={(e) => setActiveTitle(e.target.value)}
              className="w-full text-lg md:text-xl font-extrabold text-gray-950 border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-gray-50/50 px-2 py-1 rounded outline-none transition-all"
            />
          </div>

          {/* Section A: Narrative & Beats */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Script & Storyboard Beats
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">Timeline Outline</span>
            </div>
            <textarea
              value={activeBeats}
              onChange={(e) => setActiveBeats(e.target.value)}
              rows={5}
              placeholder="Map out your timeline: 0:00 Hook, 0:45 Conflict, 2:30 Resolution..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed text-gray-800"
            />
          </div>

          {/* Section B: Packaging & Visuals */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Section B: Packaging & Visuals
            </h3>

            {/* Thumbnail Visual Brief */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Thumbnail Visual Brief
              </label>
              <textarea
                value={activeThumbnail}
                onChange={(e) => setActiveThumbnail(e.target.value)}
                rows={2}
                placeholder="Subject focus, contrast colors, text badge (max 3 words), facial emotion..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 resize-none"
              />
            </div>

            {/* Video Description & Chapters */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Video Description & Chapters
              </label>
              <textarea
                value={activeDescription}
                onChange={(e) => setActiveDescription(e.target.value)}
                rows={4}
                placeholder="Summary, resources mentioned, gear links, and chapter breakdown."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 font-sans"
              />
            </div>
          </div>

          {/* Section C: Metadata & Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Section C: Metadata & Distribution
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Search Tags & Keywords
                </label>
                <input
                  type="text"
                  value={activeTags}
                  onChange={(e) => setActiveTags(e.target.value)}
                  placeholder="ui design, portfolio review, product design workflow..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800"
                />
              </div>

              {/* Publishing Channel */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Publishing Channel
                </label>
                <input
                  type="text"
                  value={activeChannel}
                  onChange={(e) => setActiveChannel(e.target.value)}
                  placeholder="Channel name..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Status Action Bar */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                Current Stage:
              </span>
              <select
                value={activeStage}
                onChange={(e) => setActiveStage(e.target.value as ContentStatus)}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
              >
                {STAGE_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Action: Push to Pipeline Table */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePushCurrentToPipeline}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-appBlue hover:bg-appBlue-dark text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <span>Push to Pipeline Table</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
