"use client";

import React, { useState, useEffect } from "react";
import Screen01Ideate from "@/components/Screen01Ideate";
import Screen02Canvas from "@/components/Screen02Canvas";
import Screen03ExecutionTable from "@/components/Screen03ExecutionTable";
import GoogleSheetsModal from "@/components/GoogleSheetsModal";
import ApiKeyModal from "@/components/ApiKeyModal";
import ChannelTemplateModal from "@/components/ChannelTemplateModal";
import ContentDbModal from "@/components/ContentDbModal";
import {
  ContentRecord,
  DraftContentItem,
  ChannelTemplate,
  SyncNotification,
} from "@/lib/types";
import { DEFAULT_CHANNEL_TEMPLATE, SAMPLE_TREND_SPARKS } from "@/lib/aiCurator";
import {
  mergeContentRecordsDeduplicated,
  DEFAULT_GOOGLE_SHEET_URL,
  DEFAULT_SHEETS_WEBHOOK_URL,
} from "@/lib/googleSheetsSync";
import { downloadExcelDatabase } from "@/lib/excelExport";

const DB_STORAGE_KEY = "youtube_content_curator_db";
const API_KEY_STORAGE = "gemini_api_key_curator";
const WEBHOOK_STORAGE = "google_sheets_webhook_url";
const CHANNEL_STORAGE = "youtube_channel_template";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"ideate" | "canvas" | "execution">("ideate");
  const [draftItems, setDraftItems] = useState<DraftContentItem[]>([]);
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [database, setDatabase] = useState<ContentRecord[]>([]);
  const [channelTemplate, setChannelTemplate] = useState<ChannelTemplate>(DEFAULT_CHANNEL_TEMPLATE);
  const [apiKey, setApiKey] = useState("");
  const [sheetsWebhookUrl, setSheetsWebhookUrl] = useState(DEFAULT_SHEETS_WEBHOOK_URL);

  const [isCurating, setIsCurating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<SyncNotification | null>(null);

  // Modals
  const [isContentDbOpen, setIsContentDbOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedDb = localStorage.getItem(DB_STORAGE_KEY);
      if (storedDb) {
        const parsed = JSON.parse(storedDb);
        if (Array.isArray(parsed)) {
          setDatabase(parsed.map((r, idx) => ({ ...r, sNo: idx + 1 })));
        }
      }

      const storedKey = localStorage.getItem(API_KEY_STORAGE);
      if (storedKey) setApiKey(storedKey);

      const storedWebhook = localStorage.getItem(WEBHOOK_STORAGE);
      setSheetsWebhookUrl(storedWebhook || DEFAULT_SHEETS_WEBHOOK_URL);

      const storedChannel = localStorage.getItem(CHANNEL_STORAGE);
      if (storedChannel) {
        setChannelTemplate(JSON.parse(storedChannel));
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSaveWebhookUrl = (url: string) => {
    setSheetsWebhookUrl(url);
    try {
      localStorage.setItem(WEBHOOK_STORAGE, url);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSaveChannelTemplate = (tmpl: ChannelTemplate) => {
    setChannelTemplate(tmpl);
    try {
      localStorage.setItem(CHANNEL_STORAGE, JSON.stringify(tmpl));
    } catch (e) {
      console.warn(e);
    }
  };

  // Screen 01 -> Add single draft item
  const handleAddDraftItem = (item: DraftContentItem) => {
    setDraftItems((prev) => [...prev, item]);
    setCurrentScreen("canvas");
  };

  // Screen 01 -> Load 5 realistic Trend Sparks
  const handleLoadTrendSparks = () => {
    setDraftItems(SAMPLE_TREND_SPARKS);
    setCurrentScreen("canvas");
  };

  // Screen 02 -> Add more items to staging
  const handleAddMoreItems = (item: DraftContentItem) => {
    setDraftItems((prev) => [...prev, item]);
  };

  // Screen 02 -> Remove item
  const handleRemoveItem = (id: string) => {
    setDraftItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      if (updated.length === 0) {
        setCurrentScreen("ideate");
      }
      return updated;
    });
  };

  // Screen 02 -> Curate Data with Gemini AI
  const handleCurateData = async () => {
    if (draftItems.length === 0) return;
    setIsCurating(true);

    try {
      const res = await fetch("/api/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: draftItems,
          apiKey: apiKey || undefined,
          channelTemplate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Curation failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        const reindexed = data.records.map((r: ContentRecord, idx: number) => ({
          ...r,
          sNo: idx + 1,
        }));
        setRecords(reindexed);
        setCurrentScreen("execution");
      } else {
        throw new Error("Invalid response structure from curation engine");
      }
    } catch (err: any) {
      console.error("Curation error:", err);
      alert(`Error curating content: ${err.message}`);
    } finally {
      setIsCurating(false);
    }
  };

  // Screen 03 -> Update single field in table
  const handleUpdateRecord = (
    index: number,
    field: keyof ContentRecord,
    value: any
  ) => {
    setRecords((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Screen 03 -> Sync to Google Sheets & update local DB
  const handleSyncGoogleSheets = async () => {
    if (records.length === 0) return;
    setIsSyncing(true);
    setNotification(null);

    // 1. Deduplicate against local database
    const { merged, addedCount: localAdded, duplicateCount: localDuplicates } =
      mergeContentRecordsDeduplicated(database, records);
    setDatabase(merged);
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    // 2. Call backend Google Sheets sync API
    try {
      const res = await fetch("/api/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records,
          webhookUrl: sheetsWebhookUrl || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNotification({
          type: "success",
          savedCount: data.addedRecords ?? localAdded ?? records.length,
          duplicateCount: data.duplicateRecords ?? localDuplicates ?? 0,
        });
      } else {
        setNotification({
          type: "error",
          errorMessage:
            data.error ||
            "Unable to write directly to Google Sheets. Verify Webhook URL in settings.",
        });
      }
    } catch (err: any) {
      console.warn("Cloud sync error:", err);
      setNotification({
        type: "error",
        errorMessage:
          "Sync request failed. Staged locally. Please check your network or Google Sheets setup.",
      });
    } finally {
      setIsSyncing(false);
    }

    setTimeout(() => {
      setNotification(null);
    }, 8000);
  };

  // Screen 03 -> Download Excel database
  const handleDownloadExcelBackup = () => {
    downloadExcelDatabase(records.length > 0 ? records : database);
  };

  // Clear Database
  const handleClearDatabase = () => {
    setDatabase([]);
    try {
      localStorage.removeItem(DB_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <>
      {/* Screen 01: Ideation & Studio Intake */}
      {currentScreen === "ideate" && (
        <Screen01Ideate
          onAddDraftItem={handleAddDraftItem}
          onLoadTrendSparks={handleLoadTrendSparks}
          onOpenContentDb={() => setIsContentDbOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenChannelModal={() => setIsChannelModalOpen(true)}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          hasApiKey={Boolean(apiKey)}
          channelTemplate={channelTemplate}
        />
      )}

      {/* Screen 02: Curation Canvas & Staging */}
      {currentScreen === "canvas" && (
        <Screen02Canvas
          items={draftItems}
          onAddItem={handleAddMoreItems}
          onRemoveItem={handleRemoveItem}
          onCurateData={handleCurateData}
          isCurating={isCurating}
          onBackToIdeate={() => setCurrentScreen("ideate")}
          channelTemplate={channelTemplate}
        />
      )}

      {/* Screen 03: Execution Table & Google Sheets Sync */}
      {currentScreen === "execution" && (
        <Screen03ExecutionTable
          records={records}
          onUpdateRecord={handleUpdateRecord}
          onBack={() => setCurrentScreen("canvas")}
          onOpenContentDb={() => setIsContentDbOpen(true)}
          onSyncGoogleSheets={handleSyncGoogleSheets}
          onDownloadExcelBackup={handleDownloadExcelBackup}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          hasSheetsWebhook={Boolean(sheetsWebhookUrl)}
          notification={notification}
          isSyncing={isSyncing}
        />
      )}

      {/* Modals */}
      <ContentDbModal
        isOpen={isContentDbOpen}
        onClose={() => setIsContentDbOpen(false)}
        database={database}
        onClearDb={handleClearDatabase}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <ChannelTemplateModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        template={channelTemplate}
        onSaveTemplate={handleSaveChannelTemplate}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        webhookUrl={sheetsWebhookUrl}
        onSaveWebhookUrl={handleSaveWebhookUrl}
      />
    </>
  );
}
