export type ContentStatus =
  | "Idea / Draft"
  | "Scripting"
  | "Ready to Record"
  | "In Editing"
  | "Scheduled"
  | "Published"
  | "On Hold";

export type ContentFormat =
  | "Long-form Video"
  | "YouTube Short"
  | "Community Post"
  | "Live Stream"
  | "Podcast / Interview";

export interface ContentRecord {
  sNo: number;
  title: string;
  titleVariations?: string[];
  format: ContentFormat | string;
  pillar: string;
  hook: string;
  scriptOutline: string;
  seoTags: string;
  description: string;
  thumbnailBrief: string;
  targetChannel: string;
  scheduleTime: string;
  status: ContentStatus | string;
  notes: string;
  addedTimestamp: string;
}

export interface DraftContentItem {
  id: string;
  title: string;
  format: ContentFormat;
  pillar: string;
  rawNotes: string;
  targetChannel: string;
  audienceAngle?: string;
}

export interface ChannelTemplate {
  id: string;
  name: string;
  niche: string;
  tone: string;
  defaultOutro: string;
  socialLinks: string;
  defaultTags: string[];
  contentPillars: string[];
}

export interface SyncNotification {
  type: "success" | "error" | "info";
  savedCount?: number;
  duplicateCount?: number;
  errorMessage?: string;
  details?: string;
}
