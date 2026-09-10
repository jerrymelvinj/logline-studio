"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Lightbulb,
  Check,
  Copy,
  ChevronRight,
  Flame,
  HelpCircle,
  Eye,
  Tv,
} from "lucide-react";
import { LOGLINE_STORY_PRINCIPLES, StoryPrinciple } from "@/lib/inspirationPrinciples";

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectSkeleton?: (skeletonText: string) => void;
}

export default function InspirationModal({
  isOpen,
  onClose,
  onInjectSkeleton,
}: InspirationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = LOGLINE_STORY_PRINCIPLES.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl border border-gray-200 h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-950 font-poppins flex items-center gap-2">
                Creator Inspiration Vault
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                  Educated Storytelling Intelligence
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Storytelling skeletons, narrative data patterns & YouTube principles
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 overflow-x-auto">
          {["all", "narrative", "neurochemical", "production"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {cat === "all" ? "All Principles (7)" : cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filtered.map((principle) => (
            <div
              key={principle.id}
              className="bg-white rounded-xl border border-gray-200/90 hover:border-amber-300 p-5 shadow-sm hover:shadow transition-all flex flex-col space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {principle.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1.5">
                    {principle.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(principle.mentalShortcut, principle.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
                  title="Copy Mental Shortcut"
                >
                  {copiedId === principle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Shortcut</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mental Shortcut */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-950 font-semibold font-mono">
                ⚡ {principle.mentalShortcut}
              </div>

              {/* Core Rule */}
              <p className="text-xs text-gray-700 leading-relaxed font-normal">
                <strong>Core Rule:</strong> {principle.coreRule}
              </p>

              {/* Actionable Example */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800">
                <span className="font-bold text-gray-900 block mb-0.5">Applied Example:</span>
                <span className="italic text-gray-700">{principle.actionableExample}</span>
              </div>

              {/* Modern Evaluation */}
              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex items-center justify-between">
                <span>{principle.modernEvaluation}</span>
                {onInjectSkeleton && principle.id === "five-question-pattern" && (
                  <button
                    onClick={() => {
                      onInjectSkeleton(
                        `Where am I: [Scene]\nWhat am I doing: [Action]\nWhat am I thinking: [Internal thought]\nWhat am I feeling: [Sensory emotion]\nWhat was said: [Spoken line]`
                      );
                      onClose();
                    }}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-0.5 ml-2 whitespace-nowrap"
                  >
                    <span>Use in Draft Studio</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            "Creativity is telling a story from your perspective, with the stolen idea called inspiration."
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-300"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
