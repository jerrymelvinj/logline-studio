"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  Database,
  RotateCcw,
  Bookmark,
  Lightbulb,
  BookOpen,
  Plus,
  Loader2,
  Check,
  Wand2,
  Compass,
} from "lucide-react";
import {
  DraftContentItem,
  ContentFormat,
  ChannelTemplate,
  UnpackedIdeaResult,
  TrendValidationResult,
} from "@/lib/types";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";
import TrendValidationModal from "@/components/TrendValidationModal";

interface Screen01IdeateProps {
  onSendToCanvas: (item: DraftContentItem) => void;
  onSaveAsIdea: (item: DraftContentItem) => void;
  onLoadTrendSparks: () => void;
  onOpenContentDb: () => void;
  channelTemplate: ChannelTemplate;
  onOpenInspirationVault?: () => void;
  injectedSkeleton?: string;
}

const FORMAT_OPTIONS: ContentFormat[] = [
  "Long-form Video",
  "YouTube Short",
  "Community Post",
  "Live Stream",
  "Podcast / Interview",
];

const PILLAR_OPTIONS = [
  "Tutorial",
  "Breakdown",
  "Case Study",
  "Vlog / BTS",
  "Deep Dive",
  "Opinion / Tech News",
];

export default function Screen01Ideate({
  onSendToCanvas,
  onSaveAsIdea,
  onLoadTrendSparks,
  onOpenContentDb,
  channelTemplate,
  onOpenInspirationVault,
  injectedSkeleton,
}: Screen01IdeateProps) {
  // Core Form Fields
  const [rawIdea, setRawIdea] = useState("");
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState<ContentFormat>("Long-form Video");
  const [pillar, setPillar] = useState<string>("Tutorial");
  const [rawNotes, setRawNotes] = useState("");
  const [audienceAngle, setAudienceAngle] = useState("");

  // AI Unpacking State
  const [isUnpacking, setIsUnpacking] = useState(false);
  const [unpackedResult, setUnpackedResult] = useState<UnpackedIdeaResult | null>(null);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState<number | null>(null);
  const [selectedHookIdx, setSelectedHookIdx] = useState<number | null>(null);

  // Trend & Saturation Validation State
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [lastTrendValidation, setLastTrendValidation] = useState<TrendValidationResult | null>(null);

  useEffect(() => {
    if (injectedSkeleton) {
      setRawNotes((prev) => (prev ? `${prev}\n\n${injectedSkeleton}` : injectedSkeleton));
      // Also seed rawIdea if empty
      if (!rawIdea) {
        setRawIdea("A real lived scene based on the 5-question pattern...");
      }
    }
  }, [injectedSkeleton]);

  // AI Trigger: Unpack & Frame
  const handleGenerateAnglesAndHooks = async () => {
    const inputSeed = rawIdea.trim() || rawNotes.trim() || title.trim();
    if (!inputSeed) return;

    setIsUnpacking(true);
    try {
      const res = await fetch("/api/unpack-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawIdea: inputSeed,
          channelTemplate,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const resData: UnpackedIdeaResult = data.data;
        setUnpackedResult(resData);

        // Auto-select first options if inputs are currently blank
        if (!title.trim() && resData.titles && resData.titles.length > 0) {
          setTitle(resData.titles[0].title);
          setSelectedTitleIdx(0);
        }
        if (!hook.trim() && resData.hooks && resData.hooks.length > 0) {
          setHook(resData.hooks[0].hook);
          setSelectedHookIdx(0);
        }
        if (resData.suggestedPillar) {
          setPillar(resData.suggestedPillar);
        }
        if (resData.suggestedFormat) {
          setFormat(resData.suggestedFormat);
        }
        if (resData.targetAudienceAngle && !audienceAngle.trim()) {
          setAudienceAngle(resData.targetAudienceAngle);
        }
      }
    } catch (err) {
      console.warn("Error unpacking idea:", err);
    } finally {
      setIsUnpacking(false);
    }
  };

  const handleSelectTitleOption = (newTitle: string, index: number) => {
    setTitle(newTitle);
    setSelectedTitleIdx(index);
  };

  const handleSelectHookOption = (newHook: string, index: number) => {
    setHook(newHook);
    setSelectedHookIdx(index);
  };

  const handleInsert5QuestionSkeleton = () => {
    const skeleton = `[Story Beat 1 - Lived Scene & Hook]:\n- Where am I: \n- What am I doing: \n- What am I thinking & feeling: \n- What was said:\n\n[Story Beat 2 - The Failed Attempt / Conflict]:\n- The struggle or misconception: \n\n[Story Beat 3 - Unexpected Discovery & Viewer Takeaway]:\n- The breakthrough: \n- Actionable viewer takeaway: `;
    setRawNotes((prev) => (prev ? `${prev}\n\n${skeleton}` : skeleton));
    if (!rawIdea.trim()) {
      setRawIdea("Lived struggle & turning point (5-question narrative data pattern)");
    }
  };

  const buildDraftItem = (): DraftContentItem => {
    let combinedNotes = rawNotes.trim();
    if (rawIdea.trim()) {
      combinedNotes = `[Raw Premise]: ${rawIdea.trim()}\n${combinedNotes}`;
    }
    if (hook.trim()) {
      combinedNotes = `[Hook]: ${hook.trim()}\n${combinedNotes}`;
    }

    return {
      id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      format,
      pillar,
      rawNotes: combinedNotes,
      targetChannel: channelTemplate.name,
      audienceAngle: audienceAngle.trim(),
    };
  };

  const handleSendToCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item = buildDraftItem();
    onSendToCanvas(item);
  };

  const handleSaveAsIdeaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item = buildDraftItem();
    onSaveAsIdea(item);
    handleDiscard();
  };

  const handleDiscard = () => {
    setRawIdea("");
    setTitle("");
    setHook("");
    setRawNotes("");
    setAudienceAngle("");
    setFormat("Long-form Video");
    setPillar("Tutorial");
    setUnpackedResult(null);
    setSelectedTitleIdx(null);
    setSelectedHookIdx(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto p-4 md:p-8 font-sans">
      {/* Header & Subheading */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Screen 01 • Ideation & Hook Crafting</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight font-poppins mb-2">
          Draft Studio
        </h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Start with a rough scratch thought. AI unpacks clickable titles, hook archetypes, and angles.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/90 p-6 md:p-8 mb-6">
        <form onSubmit={handleSendToCanvas} className="space-y-6">
          {/* TOP SECTION: The Raw Idea / Brain Dump (Scratchpad Input) */}
          <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-amber-50/30 rounded-2xl border border-blue-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-blue-600" />
                <span>The Raw Idea / Brain Dump</span>
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                Phase 1 • Unpack & Frame
              </span>
            </div>

            <textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              rows={3}
              placeholder='e.g., "I spent two weeks redesigning my workflow in Framer and realized 90% of tutorials overcomplicate responsiveness."'
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-gray-400 text-gray-900 bg-white font-normal resize-none shadow-inner"
            />
            <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
              Have a messy spark or rough premise? Dump it here. AI will unpack 3 clickable title angles and 3 hook styles.
            </p>

            {/* Trigger CTA & Quick Helpers */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-gray-200/70">
              <button
                type="button"
                onClick={handleGenerateAnglesAndHooks}
                disabled={isUnpacking || (!rawIdea.trim() && !rawNotes.trim())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-40"
              >
                {isUnpacking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Unpacking Premise...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>✨ Generate Angles & Hooks</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrendModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all shadow-xs"
                  title="Validate market saturation & discover 2026 news hooks"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Validate Trend & Saturation</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsert5QuestionSkeleton}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-bold transition-all shadow-xs"
                  title="Insert 5-question narrative data pattern"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ 5-Question Story Skeleton</span>
                </button>

                {onOpenInspirationVault && (
                  <button
                    type="button"
                    onClick={onOpenInspirationVault}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                    <span>Vault</span>
                  </button>
                )}
              </div>
            </div>

            {/* In-line Saturation Summary (if validated) */}
            {lastTrendValidation && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between text-xs shadow-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase text-[10px] text-indigo-700 tracking-wider">Market Saturation:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                    lastTrendValidation.saturationLevel === "High" ? "bg-rose-50 text-rose-800 border-rose-200" :
                    lastTrendValidation.saturationLevel === "Moderate" ? "bg-amber-50 text-amber-800 border-amber-200" :
                    "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}>
                    {lastTrendValidation.saturationLevel} ({lastTrendValidation.saturationScore}%)
                  </span>
                  <span className="text-gray-600 font-medium truncate max-w-sm hidden md:inline">
                    {lastTrendValidation.opportunityVerdict}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTrendModalOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <span>View Full Intel</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* AI HANDOFF SECTION: Interactive Title & Hook Chips */}
          {unpackedResult && (
            <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              {/* Title Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Suggested Titles (Click to Populate)
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">3 Packaging Styles</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {unpackedResult.titles.map((tOpt, idx) => {
                    const isSelected = selectedTitleIdx === idx || title === tOpt.title;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectTitleOption(tOpt.title, idx)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 text-blue-950 font-bold ring-1 ring-blue-500 shadow-xs"
                            : "bg-gray-50/70 hover:bg-gray-100/80 border-gray-200 text-gray-800 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              tOpt.style === "Curiosity"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : tOpt.style === "High-Stakes"
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            }`}
                          >
                            {tOpt.style}
                          </span>
                          <span className="leading-snug">{tOpt.title}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hook Archetypes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Hook Archetypes (Click to Populate)
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Opening 10-15s</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {unpackedResult.hooks.map((hOpt, idx) => {
                    const isSelected = selectedHookIdx === idx || hook === hOpt.hook;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectHookOption(hOpt.hook, idx)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-500 text-indigo-950 font-medium ring-1 ring-indigo-500 shadow-xs"
                            : "bg-gray-50/70 hover:bg-gray-100/80 border-gray-200 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                            {hOpt.archetype}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[11px] leading-relaxed text-gray-800 italic">
                          "{hOpt.hook}"
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Working Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                Video Title <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono font-bold ${
                  title.length > 60 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {title.length}/60 chars {title.length > 60 && "• warning: may truncate on mobile"}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How I Redesigned My Entire Workspace for $500"
              className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-semibold text-gray-900 bg-white"
              required
            />
          </div>

          {/* The Logline / Hook */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
              Hook / First 10 Seconds
            </label>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              rows={2}
              placeholder="What visual or verbal trigger stops the scroll immediately?"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-gray-400 text-gray-800 resize-none font-normal bg-white"
            />
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Set the stakes or pose the central question in sentence one.
            </p>
          </div>

          {/* Format & Pillar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                Select Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white text-gray-800 font-medium cursor-pointer"
              >
                {FORMAT_OPTIONS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                Select Content Pillar
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white text-gray-800 font-medium cursor-pointer"
              >
                {PILLAR_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supporting Notes & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Raw Talking Points / Story Beats
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={4}
                placeholder="Key concepts, tools mentioned, real-world demos or story skeleton..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-gray-400 text-gray-800 resize-none font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Target Audience / Angle
              </label>
              <textarea
                value={audienceAngle}
                onChange={(e) => setAudienceAngle(e.target.value)}
                rows={4}
                placeholder="e.g. Full-stack developers who struggle with over-engineered animations..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-gray-400 text-gray-800 resize-none font-normal bg-white"
              />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Draft</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveAsIdeaClick}
                disabled={!title.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all disabled:opacity-40"
              >
                <Bookmark className="w-3.5 h-3.5 text-gray-500" />
                <span>Save as Idea</span>
              </button>

              <button
                type="submit"
                disabled={!title.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-appBlue hover:bg-appBlue-dark text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40"
              >
                <span>Send to Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Sparks & DB Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadTrendSparks}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>⚡ Load AI Trend Sparks (5 Samples)</span>
          </button>

          {onOpenInspirationVault && (
            <button
              type="button"
              onClick={onOpenInspirationVault}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Story Vault (7 Principles)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenContentDb}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Pipeline Inspector</span>
          </button>

          <a
            href={DEFAULT_GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-600 font-medium text-xs hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            <span>Sheet ↗</span>
          </a>
        </div>
      </div>

      <TrendValidationModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        initialQuery={rawIdea.trim() || title.trim()}
        onSelectHook={(selectedHook) => {
          setHook(selectedHook);
          // Optional visual feedback handled in modal
        }}
        onSelectAngle={(selectedAngle) => {
          setAudienceAngle(selectedAngle);
          setRawNotes((prev) => prev ? `${prev}\n\n[Angle]: ${selectedAngle}` : `[Angle]: ${selectedAngle}`);
        }}
        onValidationComplete={(result) => {
          setLastTrendValidation(result);
        }}
      />
    </div>
  );
}
