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

export interface TitleOption {
  style: "Curiosity" | "Direct / How-To" | "High-Stakes";
  title: string;
}

export interface HookOption {
  archetype: "The Contrast Opening" | "The Hard Truth" | "The Before/After";
  hook: string;
}

export interface UnpackedIdeaResult {
  titles: TitleOption[];
  hooks: HookOption[];
  suggestedPillar?: string;
  suggestedFormat?: ContentFormat;
  targetAudienceAngle?: string;
}

export interface TrendSource {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  score?: number;
}

export interface TrendValidationResult {
  query: string;
  answer: string;
  saturationLevel: "Low" | "Moderate" | "High";
  saturationScore: number;
  saturationRationale: string;
  opportunityVerdict: string;
  recommendedAngle: string;
  newsHooks: string[];
  sources: TrendSource[];
  responseTime?: number;
}

