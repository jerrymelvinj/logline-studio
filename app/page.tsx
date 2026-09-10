"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Screen01Ideate from "@/components/Screen01Ideate";
import Screen02Canvas from "@/components/Screen02Canvas";
import Screen03ExecutionTable from "@/components/Screen03ExecutionTable";
import GoogleSheetsModal from "@/components/GoogleSheetsModal";
import ChannelTemplateModal from "@/components/ChannelTemplateModal";
import ContentDbModal from "@/components/ContentDbModal";
import InspirationModal from "@/components/InspirationModal";
import {
  ContentRecord,
  DraftContentItem,
  ChannelTemplate,
  SyncNotification,
} from "@/lib/types";
import {
  DEFAULT_CHANNEL_TEMPLATE,
  SAMPLE_TREND_SPARKS,
  generateOfflineContentCuration,
} from "@/lib/aiCurator";
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
  const [syncState, setSyncState] = useState<"live" | "syncing" | "paused">("live");
  const [notification, setNotification] = useState<SyncNotification | null>(null);

  // Modals
  const [isContentDbOpen, setIsContentDbOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false);
  const [injectedSkeleton, setInjectedSkeleton] = useState("");

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedDb = localStorage.getItem(DB_STORAGE_KEY);
      if (storedDb) {
        const parsed = JSON.parse(storedDb);
        if (Array.isArray(parsed)) {
          const loaded = parsed.map((r, idx) => ({ ...r, sNo: idx + 1 }));
          setDatabase(loaded);
          // Preload into records table as well if records is empty
          setRecords(loaded);
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

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setNotification({
      type,
      errorMessage: message,
    });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
    } catch (e) {
      console.warn(e);
    }
    showToast("info", "Gemini API key updated.");
  };

  const handleSaveWebhookUrl = (url: string) => {
    setSheetsWebhookUrl(url);
    try {
      localStorage.setItem(WEBHOOK_STORAGE, url);
    } catch (e) {
      console.warn(e);
    }
    setSyncState("live");
    showToast("info", "Google Sheets Webhook URL saved.");
  };

  const handleSaveChannelTemplate = (tmpl: ChannelTemplate) => {
    setChannelTemplate(tmpl);
    try {
      localStorage.setItem(CHANNEL_STORAGE, JSON.stringify(tmpl));
    } catch (e) {
      console.warn(e);
    }
    showToast("info", "Channel profile updated.");
  };

  // Screen 01 -> Send to Canvas
  const handleSendToCanvas = (item: DraftContentItem) => {
    setDraftItems((prev) => [...prev, item]);
    setCurrentScreen("canvas");
    showToast("info", "Draft sent to Production Canvas.");
  };

  // Screen 01 -> Save as Idea
  const handleSaveAsIdea = (item: DraftContentItem) => {
    const curated = generateOfflineContentCuration(item, channelTemplate, database.length);
    curated.status = "Idea / Draft";
    const { merged } = mergeContentRecordsDeduplicated(database, [curated]);
    setDatabase(merged);
    setRecords(merged);
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn(e);
    }
    showToast("success", "Draft saved to local cache.");
  };

  // Screen 01 -> Load 5 Trend Sparks
  const handleLoadTrendSparks = () => {
    setDraftItems(SAMPLE_TREND_SPARKS);
    setCurrentScreen("canvas");
    showToast("info", "Loaded 5 AI trend sparks into Production Canvas.");
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

  // Screen 02 -> Push to Pipeline Table
  const handlePushToPipeline = (newRecords: ContentRecord[]) => {
    const { merged } = mergeContentRecordsDeduplicated(database, newRecords);
    setDatabase(merged);
    setRecords(merged);
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn(e);
    }
    setCurrentScreen("execution");
    showToast("success", `Stage updated to ${newRecords[0]?.status || "Ready to Record"}.`);
  };

  // Screen 02 -> Curate with Gemini AI
  const handleCurateWithAi = async () => {
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
        const { merged } = mergeContentRecordsDeduplicated(database, reindexed);
        setDatabase(merged);
        setRecords(merged);
        try {
          localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {
          console.warn(e);
        }
        setCurrentScreen("execution");
        showToast("success", `Generated ${reindexed.length} production blueprints with AI.`);
      }
    } catch (err: any) {
      console.error("Curation error:", err);
      showToast("error", `Curation failed: ${err.message}`);
    } finally {
      setIsCurating(false);
    }
  };

  // Screen 03 -> Update single field
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
      // Auto-save changes to local database cache
      setDatabase(updated);
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (field === "status") {
      showToast("info", `Stage updated to ${value}.`);
    }
  };

  // Screen 03 -> Delete single record
  const handleDeleteRecord = (index: number) => {
    setRecords((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setDatabase(updated);
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Screen 03 -> Sync to Google Sheets
  const handleSyncGoogleSheets = async () => {
    if (records.length === 0) return;
    setIsSyncing(true);
    setSyncState("syncing");

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
        setSyncState("live");
        setNotification({
          type: "success",
          savedCount: data.addedRecords ?? records.length,
          duplicateCount: data.duplicateRecords ?? 0,
        });
      } else {
        setSyncState("paused");
        setNotification({
          type: "error",
          errorMessage: "Unable to reach Apps Script. Check sheet permissions and try again.",
        });
      }
    } catch (err: any) {
      console.warn("Cloud sync error:", err);
      setSyncState("paused");
      setNotification({
        type: "error",
        errorMessage: "Unable to reach Apps Script. Check sheet permissions and try again.",
      });
    } finally {
      setIsSyncing(false);
    }

    setTimeout(() => {
      setNotification(null);
    }, 7000);
  };

  // Clear Database
  const handleClearDatabase = () => {
    setDatabase([]);
    setRecords([]);
    try {
      localStorage.removeItem(DB_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    showToast("info", "Local database cleared.");
  };

  const handleInjectSkeleton = (skeletonText: string) => {
    setInjectedSkeleton(skeletonText);
    setCurrentScreen("ideate");
    setIsInspirationModalOpen(false);
    showToast("info", "Story skeleton injected into Draft Studio!");
  };

  return (
    <div className="min-h-screen bg-pageBg flex flex-col font-sans">
      {/* Universal Logline Studio Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        syncState={syncState}
        onNewContentPiece={() => setCurrentScreen("ideate")}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenChannelModal={() => setIsChannelModalOpen(true)}
        onOpenInspirationVault={() => setIsInspirationModalOpen(true)}
        channelTemplate={channelTemplate}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col">
        {currentScreen === "ideate" && (
          <Screen01Ideate
            onSendToCanvas={handleSendToCanvas}
            onSaveAsIdea={handleSaveAsIdea}
            onLoadTrendSparks={handleLoadTrendSparks}
            onOpenContentDb={() => setIsContentDbOpen(true)}
            channelTemplate={channelTemplate}
            onOpenInspirationVault={() => setIsInspirationModalOpen(true)}
            injectedSkeleton={injectedSkeleton}
          />
        )}

        {currentScreen === "canvas" && (
          <Screen02Canvas
            items={draftItems}
            onAddItem={handleAddMoreItems}
            onRemoveItem={handleRemoveItem}
            onPushToPipeline={handlePushToPipeline}
            onCurateWithAi={handleCurateWithAi}
            isCurating={isCurating}
            onBackToDraft={() => setCurrentScreen("ideate")}
            channelTemplate={channelTemplate}
          />
        )}

        {currentScreen === "execution" && (
          <Screen03ExecutionTable
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onBack={() => setCurrentScreen("canvas")}
            onOpenContentDb={() => setIsContentDbOpen(true)}
            onSyncGoogleSheets={handleSyncGoogleSheets}
            onDownloadExcelBackup={() => downloadExcelDatabase(records)}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            hasSheetsWebhook={Boolean(sheetsWebhookUrl)}
            notification={notification}
            isSyncing={isSyncing}
            onDraftFirstVideo={() => setCurrentScreen("ideate")}
          />
        )}
      </main>

      {/* Modals */}
      <InspirationModal
        isOpen={isInspirationModalOpen}
        onClose={() => setIsInspirationModalOpen(false)}
        onInjectSkeleton={handleInjectSkeleton}
      />

      <ContentDbModal
        isOpen={isContentDbOpen}
        onClose={() => setIsContentDbOpen(false)}
        database={database}
        onClearDb={handleClearDatabase}
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
    </div>
  );
}
