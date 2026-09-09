"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Zap,
  HelpCircle,
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
      setTestMessage("Please enter an Apps Script Webhook URL first.");
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    setTestMessage("");

    try {
      const res = await fetch(inputUrl.trim(), { method: "GET", mode: "no-cors" });
      setTestStatus("success");
      setTestMessage("Webhook pinged successfully! Ready for live cloud sync.");
    } catch (e: any) {
      setTestStatus("error");
      setTestMessage("Unable to connect to the Webhook URL. Please ensure it is deployed with 'Who has access: Anyone'.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Google Sheets Integration Setup</h3>
              <p className="text-xs text-gray-500">Live automatic bidirectional synchronization</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connected Sheet Details */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Target Spreadsheet
            </span>
            <a
              href={DEFAULT_GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              Open Google Sheet ↗
            </a>
          </div>
          <div className="text-xs text-gray-700 font-mono bg-white p-2 rounded-lg border border-gray-200 truncate">
            {DEFAULT_GOOGLE_SHEET_URL}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-mono">
            Sheet ID: <strong>{DEFAULT_GOOGLE_SHEET_ID}</strong>
          </div>
        </div>

        {/* Webhook Connection Form */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Google Apps Script Web App URL (For Real-Time Cloud Sync)
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
                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors border border-gray-300 flex items-center gap-1"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                Test
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Leave blank to use local staging + formatted export, or follow the 1-minute setup below for direct live cloud writing.
            </p>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* 1-Minute Copy-Paste Apps Script Instructions */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              1-Minute One-Click Sync Setup (Google Apps Script)
            </h4>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors border border-emerald-300"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Script Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Apps Script</span>
                </>
              )}
            </button>
          </div>

          <ol className="text-xs text-emerald-950 space-y-1.5 list-decimal pl-4 leading-relaxed font-medium">
            <li>
              Open your{" "}
              <a
                href={DEFAULT_GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold"
              >
                Google Sheet
              </a>
              .
            </li>
            <li>
              In the top menu, click <strong>Extensions ➔ Apps Script</strong>.
            </li>
            <li>
              Delete any default code, click <strong>Copy Apps Script</strong> above, and paste it in.
            </li>
            <li>
              Click <strong>Deploy ➔ New deployment</strong>.
            </li>
            <li>
              Select type <strong>Web app</strong>. Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.
            </li>
            <li>Copy the resulting Web App URL and paste it in the field above!</li>
          </ol>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
          >
            Save Connection Settings
          </button>
        </div>
      </div>
    </div>
  );
}
