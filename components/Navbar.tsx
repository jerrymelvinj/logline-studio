"use client";

import React from "react";
import {
  Clapperboard,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  Sliders,
  Key,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";
import { ChannelTemplate } from "@/lib/types";
import { DEFAULT_GOOGLE_SHEET_URL } from "@/lib/googleSheetsSync";

interface NavbarProps {
  currentScreen: "ideate" | "canvas" | "execution";
  onNavigate: (screen: "ideate" | "canvas" | "execution") => void;
  syncState: "live" | "syncing" | "paused";
  onNewContentPiece: () => void;
  onOpenSheetsModal: () => void;
  onOpenChannelModal: () => void;
  channelTemplate: ChannelTemplate;
}

export default function Navbar({
  currentScreen,
  onNavigate,
  syncState,
  onNewContentPiece,
  onOpenSheetsModal,
  onOpenChannelModal,
  channelTemplate,
}: NavbarProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 md:px-7 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
      {/* Brand Anchor & Sub-badge */}
      <div className="flex items-center space-x-6">
        <div
          onClick={() => onNavigate("ideate")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow group-hover:bg-appBlue transition-colors">
            <Clapperboard className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-gray-950 tracking-tight font-poppins">
                Logline Studio
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                Creator Pipeline OS
              </span>
            </div>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80">
          <button
            onClick={() => onNavigate("ideate")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentScreen === "ideate"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            01 Draft
          </button>
          <button
            onClick={() => onNavigate("canvas")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentScreen === "canvas"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            02 Canvas
          </button>
          <button
            onClick={() => onNavigate("execution")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentScreen === "execution"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            03 Pipeline
          </button>
        </nav>
      </div>

      {/* Right Controls & Status Indicators */}
      <div className="flex items-center space-x-3">
        {/* Utility Status Indicator */}
        <div
          onClick={onOpenSheetsModal}
          className="cursor-pointer group flex items-center"
          title="Google Sheets Bidirectional sync status"
        >
          {syncState === "syncing" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>⟳ Syncing changes...</span>
            </span>
          )}

          {syncState === "live" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold">● Sheets Live</span>
            </span>
          )}

          {syncState === "paused" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 group-hover:bg-rose-100 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold">▲ Sync Paused</span>
            </span>
          )}
        </div>

        {/* Channel Settings */}
        <button
          onClick={onOpenChannelModal}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          title="Configure Channel Profile"
        >
          <Sliders className="w-3.5 h-3.5 text-gray-500" />
          <span className="truncate max-w-[120px]">{channelTemplate.name}</span>
        </button>

        {/* Primary Header CTA */}
        <button
          onClick={onNewContentPiece}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ New Content Piece</span>
        </button>
      </div>
    </header>
  );
}
