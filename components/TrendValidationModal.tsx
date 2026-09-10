"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  Compass,
  Search,
  ExternalLink,
  Check,
  Loader2,
  AlertTriangle,
  Zap,
  Flame,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  Globe,
  Newspaper,
  BookOpen,
} from "lucide-react";
import { TrendValidationResult, TrendSource } from "@/lib/types";

interface TrendValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectHook?: (hook: string) => void;
  onSelectAngle?: (angle: string) => void;
  onValidationComplete?: (result: TrendValidationResult) => void;
}

export default function TrendValidationModal({
  isOpen,
  onClose,
  initialQuery = "",
  onSelectHook,
  onSelectAngle,
  onValidationComplete,
}: TrendValidationModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState<"news" | "general">("news");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrendValidationResult | null>(null);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [appliedHookIdx, setAppliedHookIdx] = useState<number | null>(null);
  const [appliedAngle, setAppliedAngle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen && initialQuery && !query) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/trend-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: cleanQuery,
          topic,
          searchDepth: "advanced",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
        if (onValidationComplete) onValidationComplete(data.data);
      } else {
        setErrorMessage(data.error || "Failed to retrieve trend intelligence");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while connecting to trend engine");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyHook = (hookText: string, idx: number) => {
    // Strip surrounding quotes if present for clean insertion
    const clean = hookText.replace(/^"|"$/g, "");
    if (onSelectHook) {
      onSelectHook(clean);
      setAppliedHookIdx(idx);
      setTimeout(() => setAppliedHookIdx(null), 2500);
    }
  };

  const handleApplyAngle = (angleText: string) => {
    if (onSelectAngle) {
      onSelectAngle(angleText);
      setAppliedAngle(true);
      setTimeout(() => setAppliedAngle(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl border border-gray-200 h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-950 font-poppins flex items-center gap-2">
                Trend & Market Saturation Inspector
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-300 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Tavily Real-Time Search
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Validate market demand, diagnose saturation, and harvest fresh news hooks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input & Scope Controls */}
        <div className="p-5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a topic, headline, or video idea (e.g. AI video editing trends 2026)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-gray-900 placeholder:text-gray-400 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-40 flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Web...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Inspect Trend</span>
                  </>
                )}
              </button>
            </div>

            {/* Scope & Mode Bar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Search Scope:</span>
                <button
                  type="button"
                  onClick={() => setTopic("news")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                    topic === "news"
                      ? "bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Recent News & Press</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopic("general")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                    topic === "general"
                      ? "bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>General Web (All Time)</span>
                </button>
              </div>

              {initialQuery && query !== initialQuery && (
                <button
                  type="button"
                  onClick={() => setQuery(initialQuery)}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Reset to Scratchpad
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!result && !isLoading && !errorMessage && (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Real-Time Validation & Market Intel
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed mb-4">
                Enter your premise or scratch thought above to check live YouTube/web competition, calculate market saturation, and extract timely 2026 news hooks.
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-gray-400 font-medium">Try searching:</span>
                <button
                  onClick={() => {
                    setQuery("AI video editing trends 2026");
                    setTopic("news");
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
                >
                  AI video editing trends 2026
                </button>
                <button
                  onClick={() => {
                    setQuery("Why senior developers write less code");
                    setTopic("general");
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
                >
                  Why senior developers write less code
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800">Querying Tavily Web Radar...</p>
                <p className="text-xs text-gray-500">
                  Scanning recent publications, measuring competitor density, and extracting hook angles.
                </p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              {/* SATURATION GAUGE CARD */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      Market Competition & Demand
                    </span>
                    <h3 className="text-lg font-extrabold text-gray-950 font-poppins flex items-center gap-2.5 mt-0.5">
                      Saturation Level:
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                          result.saturationLevel === "High"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : result.saturationLevel === "Moderate"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {result.saturationLevel === "High" && <ShieldAlert className="w-3.5 h-3.5" />}
                        {result.saturationLevel === "Moderate" && <Zap className="w-3.5 h-3.5" />}
                        {result.saturationLevel === "Low" && <Sparkles className="w-3.5 h-3.5" />}
                        {result.saturationLevel} Saturation ({result.saturationScore}%)
                      </span>
                    </h3>
                  </div>

                  {result.responseTime && (
                    <span className="text-[11px] text-gray-400 font-mono">
                      Latency: {result.responseTime.toFixed(2)}s
                    </span>
                  )}
                </div>

                {/* Visual Progress / Density Meter */}
                <div className="space-y-1.5 mb-4">
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        result.saturationScore >= 70
                          ? "bg-gradient-to-r from-amber-500 to-rose-600"
                          : result.saturationScore >= 40
                          ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${result.saturationScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span className="text-emerald-700">0% Low (Prime Gap)</span>
                    <span className="text-amber-700">50% Moderate (Healthy Demand)</span>
                    <span className="text-rose-700">100% High (Crowded)</span>
                  </div>
                </div>

                {/* Rationale & Opportunity Verdict */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3 border-t border-gray-100">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 block mb-1">
                      Saturation Rationale
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {result.saturationRationale}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 block mb-1">
                      Strategic Opportunity Verdict
                    </span>
                    <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                      {result.opportunityVerdict}
                    </p>
                  </div>
                </div>
              </div>

              {/* RECOMMENDED DIFFERENTIATION ANGLE */}
              {result.recommendedAngle && (
                <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">
                        Recommended Differentiation Angle
                      </span>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">
                        {result.recommendedAngle}
                      </p>
                    </div>
                  </div>

                  {onSelectAngle && (
                    <button
                      type="button"
                      onClick={() => handleApplyAngle(result.recommendedAngle)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 shadow-xs ${
                        appliedAngle
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {appliedAngle ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Angle Applied!</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Angle</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* TIMELY NEWS HOOKS */}
              {result.newsHooks && result.newsHooks.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                        Fresh News Hooks
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-950">
                        Timely 2026 Angles to Hook Viewers Immediately
                      </h4>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">Click to use as Hook</span>
                  </div>

                  <div className="space-y-2.5">
                    {result.newsHooks.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <p className="text-xs text-gray-800 font-medium leading-relaxed italic">
                          {h}
                        </p>
                        {onSelectHook && (
                          <button
                            type="button"
                            onClick={() => handleApplyHook(h, idx)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                              appliedHookIdx === idx
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-white border border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-600"
                            }`}
                          >
                            {appliedHookIdx === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Injected!</span>
                              </>
                            ) : (
                              <>
                                <span>Use as Hook</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAVILY AI SYNTHESIS / ANSWER */}
              {result.answer && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Web Synthesis & Context
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                    {result.answer}
                  </p>
                </div>
              )}

              {/* VERIFIED LIVE SOURCES & CITATIONS */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-gray-500" />
                      Live Verified Sources & Citations ({result.sources.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h5 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                              {src.title}
                            </h5>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 flex-shrink-0 mt-0.5" />
                          </div>
                          {src.snippet && (
                            <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                              {src.snippet}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
                          <span>{src.publishedDate || "Recent Web"}</span>
                          {src.score && <span>Relevance: {Math.round(src.score * 100)}%</span>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            {result ? `Validated query: "${result.query}"` : "Real-time verification powered by Tavily Search API"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
