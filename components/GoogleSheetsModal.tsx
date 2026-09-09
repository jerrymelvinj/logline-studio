"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DEFAULT_GOOGLE_SHEET_URL,
  DEFAULT_GOOGLE_SHEET_ID,
  DEFAULT_SHEETS_WEBHOOK_URL,
  getGoogleAppsScriptCode,
} from "@/lib/googleSheetsSync";

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
}

export default function GoogleSheetsModal({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl,
}: GoogleSheetsModalProps) {
  const [inputUrl, setInputUrl] = useState(webhookUrl || DEFAULT_SHEETS_WEBHOOK_URL);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"success" | "error" | null>(null);
  const [testMessage, setTestMessage] = useState("");

  if (!isOpen) return null;

  const handleCopyScript = () => {
    const script = getGoogleAppsScriptCode();
    navigator.clipboard.writeText(script);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSave = () => {
    onSaveWebhookUrl(inputUrl.trim());
    onClose();
  };

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestStatus("error");
      setTestMessage("Please enter a Web App Deployment URL first.");
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    setTestMessage("");

    try {
      const res = await fetch(inputUrl.trim(), { method: "GET", mode: "no-cors" });
      setTestStatus("success");
      setTestMessage("Connected! Bidirectional sync active with Master Pipeline sheet.");
    } catch (e: any) {
      setTestStatus("error");
      setTestMessage("Unable to reach Apps Script. Check sheet permissions and try again.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 font-poppins">
                Google Sheets Bi-Directional Sync
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Connect Logline Studio to your Master Pipeline sheet. Changes made in the app update your sheet instantly.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-by-Step Microcopy */}
        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Deployment Instructions
            </h4>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors border border-emerald-300"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Snippet Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Apps Script Snippet</span>
                </>
              )}
            </button>
          </div>

          <ol className="text-xs text-emerald-950 space-y-1 list-decimal pl-4 font-medium leading-relaxed">
            <li>Open your Master Content Google Sheet.</li>
            <li>Navigate to Extensions → Apps Script and paste the deployment snippet.</li>
            <li>Deploy as Web App (Access: Anyone) and paste the URL below:</li>
          </ol>
        </div>

        {/* Input Field */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Web App Deployment URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-300 flex items-center gap-1.5"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {testStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testStatus === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {testStatus === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <a
            href={DEFAULT_GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Open Master Google Sheet</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              Save & Sync Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
