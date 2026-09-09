"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  ArrowRight,
  Database,
  RotateCcw,
  Bookmark,
  Send,
} from "lucide-react";
import { DraftContentItem, ContentFormat, ChannelTemplate } from "@/lib/types";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";

interface Screen01IdeateProps {
  onSendToCanvas: (item: DraftContentItem) => void;
  onSaveAsIdea: (item: DraftContentItem) => void;
  onLoadTrendSparks: () => void;
  onOpenContentDb: () => void;
  channelTemplate: ChannelTemplate;
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
}: Screen01IdeateProps) {
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState<ContentFormat>("Long-form Video");
  const [pillar, setPillar] = useState<string>("Tutorial");
  const [rawNotes, setRawNotes] = useState("");
  const [audienceAngle, setAudienceAngle] = useState("");

  const buildDraftItem = (): DraftContentItem => {
    return {
      id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      format,
      pillar,
      rawNotes: rawNotes.trim(),
      targetChannel: channelTemplate.name,
      audienceAngle: audienceAngle.trim(),
    };
  };

  const handleSendToCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item = buildDraftItem();
    // store hook inside rawNotes if provided
    if (hook.trim()) {
      item.rawNotes = `[Hook]: ${hook.trim()}\n${item.rawNotes}`;
    }
    onSendToCanvas(item);
  };

  const handleSaveAsIdeaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item = buildDraftItem();
    if (hook.trim()) {
      item.rawNotes = `[Hook]: ${hook.trim()}\n${item.rawNotes}`;
    }
    onSaveAsIdea(item);
    // Reset form after saving
    handleDiscard();
  };

  const handleDiscard = () => {
    setTitle("");
    setHook("");
    setRawNotes("");
    setAudienceAngle("");
    setFormat("Long-form Video");
    setPillar("Tutorial");
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto p-4 md:p-8 font-sans">
      {/* Header & Subheading */}
      <div className="text-center max-w-2xl mx-auto mb-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Screen 01 • Ideation & Hook Crafting</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight font-poppins mb-2">
          Draft Studio
        </h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Turn raw sparks into structured production outlines.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/90 p-6 md:p-8 mb-6">
        <form onSubmit={handleSendToCanvas} className="space-y-6">
          {/* Working Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How I Redesigned My Entire Workspace for $500"
              className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-semibold text-gray-900"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Aim for high clarity and emotional curiosity.
            </p>
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
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-gray-400 text-gray-800 resize-none font-normal"
            />
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Set the stakes or pose the central question in sentence one.
            </p>
          </div>

          {/* Format & Pillar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Format Dropdown */}
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

            {/* Pillar Dropdown */}
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
                Raw Talking Points / Context
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={3}
                placeholder="Key concepts, tools mentioned, real-world demos..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-gray-400 text-gray-800 resize-none font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Target Audience / Angle
              </label>
              <textarea
                value={audienceAngle}
                onChange={(e) => setAudienceAngle(e.target.value)}
                rows={3}
                placeholder="e.g. Full-stack developers, design students..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-gray-400 text-gray-800 resize-none font-normal"
              />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Ghost Button: Discard Draft */}
            <button
              type="button"
              onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Draft</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Secondary CTA: Save as Idea */}
              <button
                type="button"
                onClick={handleSaveAsIdeaClick}
                disabled={!title.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all disabled:opacity-40"
              >
                <Bookmark className="w-3.5 h-3.5 text-gray-500" />
                <span>Save as Idea</span>
              </button>

              {/* Primary CTA: Send to Canvas */}
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
        <button
          type="button"
          onClick={onLoadTrendSparks}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all shadow-sm"
        >
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>⚡ Load AI Trend Sparks (5 Samples)</span>
        </button>

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
    </div>
  );
}
