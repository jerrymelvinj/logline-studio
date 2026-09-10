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
  Wand2,
  Image as ImageIcon,
  Clock,
  Hash,
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

interface ItemCanvasState {
  title: string;
  beats: string;
  thumbnail: string;
  description: string;
  tags: string;
  channel: string;
  stage: ContentStatus;
}

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

  // Persistent per-item state cache to guarantee auto-saving when switching between items
  const [itemsState, setItemsState] = useState<Record<string, ItemCanvasState>>({});

  // Full-piece Gemini AI fleshing state
  const [isFleshing, setIsFleshing] = useState(false);

  // Granular AI loading states
  const [isExpandingBeats, setIsExpandingBeats] = useState(false);
  const [isSuggestingThumb, setIsSuggestingThumb] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isExtractingTags, setIsExtractingTags] = useState(false);

  const activeItem = items[selectedIndex] || items[0];

  // Helper to initialize or get current item state
  const getCurrentItemState = (item: DraftContentItem): ItemCanvasState => {
    if (itemsState[item.id]) {
      return itemsState[item.id];
    }
    const defaultWords = item.title.split(" ").slice(0, 3).join(" ").toUpperCase();
    return {
      title: item.title,
      beats:
        item.rawNotes ||
        `0:00 [Hook & Lived Scene]: Cold open with sensory detail\n0:45 [The Core Tension]: Why the standard advice failed\n2:15 [The Turning Point]: Unexpected discovery\n4:30 [The Blueprint]: Step-by-step implementation\n7:00 [Takeaway & Bridge]: Universal viewer takeaway`,
      thumbnail: `[16:9 Contrast Packaging] Left: Preview of problem/code. Right: Creator authentic focused reaction. Bold 3-word badge overlay: "${defaultWords}".`,
      description: `${item.title}\n\n📌 Summary:\n${item.rawNotes || "Actionable engineering & creator walkthrough."}\n\n⏱️ Chapters:\n0:00 - The Problem\n0:45 - What Failed First\n2:15 - The Breakthrough\n4:30 - Step-by-Step\n7:00 - Universal Takeaway\n\n---\n${channelTemplate.defaultOutro}\n\n🔗 ${channelTemplate.socialLinks}`,
      tags: `${item.pillar.toLowerCase()}, ${item.format.toLowerCase().replace(" ", "-")}, software engineering, coding, tech career`,
      channel: item.targetChannel || channelTemplate.name,
      stage: "Scripting",
    };
  };

  const currentCanvas = activeItem
    ? itemsState[activeItem.id] || getCurrentItemState(activeItem)
    : null;

  const updateActiveField = (field: keyof ItemCanvasState, value: any) => {
    if (!activeItem) return;
    const existing = itemsState[activeItem.id] || getCurrentItemState(activeItem);
    const updated = { ...existing, [field]: value };
    setItemsState((prev) => ({
      ...prev,
      [activeItem.id]: updated,
    }));
  };

  // Thumbnail generation state
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Clear thumbnail preview when switching items
  useEffect(() => {
    setThumbnailUrl(null);
  }, [selectedIndex]);

  // Pollinations API handler
  const handleGenerateThumbnail = async () => {
    setIsGeneratingImg(true);
    try {
      const res = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: currentCanvas?.thumbnail,
          title: currentCanvas?.title,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setThumbnailUrl(data.imageUrl);
      }
    } catch (err) {
      console.error("Thumbnail preview failed:", err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Connected to /api/generate as requested
  const handleAutoFlesh = async () => {
    if (!activeItem) return;
    setIsFleshing(true);
    try {
      let startingHook = "";
      if (activeItem.rawNotes?.includes("[Hook]:")) {
        startingHook = activeItem.rawNotes.split("[Hook]:")[1]?.split("\n")[0]?.trim() || "";
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentCanvas?.title || activeItem.title,
          hook: startingHook || currentCanvas?.title || activeItem.title,
          format: activeItem.format,
          pillar: activeItem.pillar,
          rawIdea: activeItem.rawNotes || "",
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        // Update form state across Screen 02 fields
        updateActiveField("beats", result.data.scriptOutline);
        updateActiveField("thumbnail", result.data.thumbnailBrief);
        updateActiveField("description", result.data.description);
        updateActiveField("tags", result.data.seoTags);
      }
    } catch (err) {
      console.error("Failed to flesh out content with Gemini:", err);
    } finally {
      setIsFleshing(false);
    }
  };

  // Granular AI Accelerator: Expand to 5-Beat Arc
  const handleExpandBeats = async () => {
    if (!activeItem) return;
    setIsExpandingBeats(true);
    try {
      const res = await fetch("/api/granular-curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "outline",
          item: activeItem,
          currentRecord: { title: currentCanvas?.title, notes: currentCanvas?.beats },
          channelTemplate,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        updateActiveField("beats", data.result);
      }
    } catch (err) {
      console.warn("Granular beats expansion error:", err);
    } finally {
      setIsExpandingBeats(false);
    }
  };

  // Granular AI Accelerator: Suggest Visual Concept
  const handleSuggestThumbnail = async () => {
    if (!activeItem) return;
    setIsSuggestingThumb(true);
    try {
      const res = await fetch("/api/granular-curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "thumbnail",
          item: activeItem,
          currentRecord: { title: currentCanvas?.title, notes: currentCanvas?.beats },
          channelTemplate,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        updateActiveField("thumbnail", data.result);
      }
    } catch (err) {
      console.warn("Granular thumbnail error:", err);
    } finally {
      setIsSuggestingThumb(false);
    }
  };

  // Granular AI Accelerator: Generate Timestamps & Links
  const handleGenerateDescription = async () => {
    if (!activeItem) return;
    setIsGeneratingDesc(true);
    try {
      const res = await fetch("/api/granular-curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "description",
          item: activeItem,
          currentRecord: { title: currentCanvas?.title, notes: currentCanvas?.beats },
          channelTemplate,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        updateActiveField("description", data.result);
      }
    } catch (err) {
      console.warn("Granular description error:", err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Granular AI Accelerator: Extract SEO Tags
  const handleExtractTags = async () => {
    if (!activeItem) return;
    setIsExtractingTags(true);
    try {
      const res = await fetch("/api/granular-curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tags",
          item: activeItem,
          currentRecord: { title: currentCanvas?.title, notes: currentCanvas?.beats },
          channelTemplate,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        updateActiveField("tags", data.result);
      }
    } catch (err) {
      console.warn("Granular tags error:", err);
    } finally {
      setIsExtractingTags(false);
    }
  };

  const handlePushCurrentToPipeline = () => {
    if (!activeItem || !currentCanvas) return;
    const now = new Date();
    const scheduleDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const scheduleTime = `${String(scheduleDate.getDate()).padStart(2, "0")}/${String(
      scheduleDate.getMonth() + 1
    ).padStart(2, "0")}/${scheduleDate.getFullYear()}, 06:00 PM`;

    const record: ContentRecord = {
      sNo: 1,
      title: currentCanvas.title || activeItem.title,
      format: activeItem.format,
      pillar: activeItem.pillar,
      hook: currentCanvas.beats.split("\n")[0] || "Hook line",
      scriptOutline: currentCanvas.beats,
      thumbnailBrief: currentCanvas.thumbnail,
      description: currentCanvas.description,
      seoTags: currentCanvas.tags,
      targetChannel: currentCanvas.channel,
      scheduleTime,
      status: currentCanvas.stage,
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
            <span>Screen 02 • Script & Production Canvas (Phase 2 • Flesh & Structure)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight font-poppins">
            Production Canvas
          </h1>
          <p className="text-xs md:text-sm text-gray-600">
            Structure your narrative beats, visual assets, and packaging with modular AI accelerators.
          </p>
        </div>

        {/* Gemini AI Auto-Flesh Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoFlesh}
            disabled={isFleshing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            title="Auto-Flesh current piece with Google Gemini AI"
          >
            {isFleshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Auto-Fleshing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Flesh with Gemini AI ➔</span>
              </>
            )}
          </button>

          {items.length > 1 && (
            <button
              onClick={onCurateWithAi}
              disabled={isCurating}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
              title="Flesh out all pieces in pipeline at once"
            >
              <span>Batch All ({items.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Queued Concepts List (Auto-Saves State on Item Switch) */}
        <div className="w-full lg:w-72 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Queued Pieces ({items.length})
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const itemTitle = itemsState[item.id]?.title || item.title;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between relative group ${
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
                      {itemTitle}
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
              );
            })}
          </div>
        </div>

        {/* Right Canvas Sections */}
        {currentCanvas && (
          <div className="flex-1 flex flex-col space-y-5">
            {/* Active Title Banner */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                    {activeItem.format}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                    {activeItem.pillar}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    currentCanvas.title.length > 60 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {currentCanvas.title.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                value={currentCanvas.title}
                onChange={(e) => updateActiveField("title", e.target.value)}
                placeholder="Video Title..."
                className="w-full text-lg md:text-xl font-extrabold text-gray-950 border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:bg-gray-50/50 px-2 py-1 rounded outline-none transition-all"
              />
            </div>

            {/* Section A: Narrative & Script Beats */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Script & Storyboard Beats
                </h3>

                {/* Granular AI Accelerator: Expand to 5-Beat Arc */}
                <button
                  type="button"
                  onClick={handleExpandBeats}
                  disabled={isExpandingBeats}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  title="Expands raw points into Hook ➔ Conflict ➔ Pivot ➔ Action ➔ Outro"
                >
                  {isExpandingBeats ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      <span>Structuring 5-Beats...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3 text-blue-600" />
                      <span>✨ Expand to 5-Beat Arc</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={currentCanvas.beats}
                onChange={(e) => updateActiveField("beats", e.target.value)}
                rows={6}
                placeholder="Map out your timeline: 0:00 Hook, 0:45 Conflict, 2:30 Resolution..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed text-gray-800 bg-white"
              />
            </div>

            {/* Section B: Packaging & Visuals */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Packaging, Visuals & Timestamps
                </h3>
              </div>

              {/* Thumbnail Visual Brief */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                    Thumbnail Visual Brief
                  </label>

                  {/* Granular AI Accelerator: Suggest Visual Concept */}
                  <button
                    type="button"
                    onClick={handleSuggestThumbnail}
                    disabled={isSuggestingThumb}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50"
                  >
                    {isSuggestingThumb ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                        <span>Composing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>✨ Suggest Visual Concept</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={currentCanvas.thumbnail}
                  onChange={(e) => updateActiveField("thumbnail", e.target.value)}
                  rows={2}
                  placeholder="Subject focus, contrast colors, text badge (max 3 words), facial emotion..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 resize-none bg-white"
                />

                {/* Pollinations AI Thumbnail Preview */}
                <div className="mt-3">
                  <button 
                    onClick={handleGenerateThumbnail} 
                    disabled={isGeneratingImg}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {isGeneratingImg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Preview...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>🎨 Preview Thumbnail Concept</span>
                      </>
                    )}
                  </button>

                  {thumbnailUrl && (
                    <div className="mt-3 aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group bg-gray-50">
                      <img src={thumbnailUrl} alt="AI Thumbnail Concept" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">
                          Generated via Pollinations AI
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Description & Chapters */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Video Description & Chapters
                  </label>

                  {/* Granular AI Accelerator: Generate Timestamps & Links */}
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDesc}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50"
                  >
                    {isGeneratingDesc ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-700" />
                        <span>Formatting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>✨ Generate Timestamps & Links</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={currentCanvas.description}
                  onChange={(e) => updateActiveField("description", e.target.value)}
                  rows={4}
                  placeholder="Summary, resources mentioned, gear links, and chapter breakdown."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 font-sans bg-white"
                />
              </div>
            </div>

            {/* Section C: Metadata & Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Section C: Metadata & Distribution
                </h3>

                {/* Granular AI Accelerator: Extract SEO Tags */}
                <button
                  type="button"
                  onClick={handleExtractTags}
                  disabled={isExtractingTags}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50"
                >
                  {isExtractingTags ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Hash className="w-3 h-3 text-emerald-600" />
                      <span>✨ Extract SEO Tags</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Search Tags & Keywords
                  </label>
                  <input
                    type="text"
                    value={currentCanvas.tags}
                    onChange={(e) => updateActiveField("tags", e.target.value)}
                    placeholder="ui design, portfolio review, product design workflow..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Publishing Channel
                  </label>
                  <input
                    type="text"
                    value={currentCanvas.channel}
                    onChange={(e) => updateActiveField("channel", e.target.value)}
                    placeholder="Channel name..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Status Action Bar */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  Current Stage:
                </span>
                <select
                  value={currentCanvas.stage}
                  onChange={(e) =>
                    updateActiveField("stage", e.target.value as ContentStatus)
                  }
                  className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                >
                  {STAGE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

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
        )}
      </div>
    </div>
  );
}
