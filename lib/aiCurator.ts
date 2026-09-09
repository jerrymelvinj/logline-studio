import { GoogleGenerativeAI } from "@google/generative-ai";
import { ContentRecord, DraftContentItem, ChannelTemplate } from "./types";

export const DEFAULT_CHANNEL_TEMPLATE: ChannelTemplate = {
  id: "primary-channel",
  name: "Tech & Creator Hub",
  niche: "Software Engineering, AI Tools, & Tech Career Growth",
  tone: "Engaging, practical, high-value, punchy and clear",
  defaultOutro:
    "🔔 Subscribe for weekly breakdowns on cutting-edge software and AI development!\n💬 Drop your questions below — I reply to every comment.\n🚀 Project links & code in the pinned comment.",
  socialLinks:
    "GitHub: github.com/jerrymelvinj | LinkedIn: linkedin.com/in/jerrymelvin",
  defaultTags: ["tech", "coding", "software engineer", "developer", "ai tools", "tutorial"],
  contentPillars: [
    "Tutorial & How-To",
    "Deep Dive & Breakdown",
    "Industry Trends & AI",
    "Project Build & Code Along",
    "Productivity & Career",
    "Opinion & Tech News",
  ],
};

export const SAMPLE_TREND_SPARKS: DraftContentItem[] = [
  {
    id: "spark-1",
    title: "Why Senior Engineers Write Less Code (And Why You Should Too)",
    format: "Long-form Video",
    pillar: "Deep Dive & Breakdown",
    rawNotes:
      "Explaining how leverage, system design, and choosing the right architecture 10x developer productivity compared to churning out raw lines of code. Mention real world examples.",
    targetChannel: "Tech & Creator Hub",
    audienceAngle: "Junior & mid-level software developers aiming for senior promotion",
  },
  {
    id: "spark-2",
    title: "Stop Using useEffect For Everything In React 19!",
    format: "YouTube Short",
    pillar: "Tutorial & How-To",
    rawNotes:
      "Quick 45s pattern interrupt showing the most common useEffect anti-patterns and the modern React 19 alternatives (Actions, Server Components, useActionState).",
    targetChannel: "Tech & Creator Hub",
    audienceAngle: "Frontend developers and React practitioners",
  },
  {
    id: "spark-3",
    title: "How I Built an Autonomous AI Agent in 24 Hours",
    format: "Long-form Video",
    pillar: "Project Build & Code Along",
    rawNotes:
      "Walkthrough of an AI agent using Next.js, Gemini API, and automated workflows. Show live demo, architecture diagram, prompt engineering, and GitHub repo release.",
    targetChannel: "Tech & Creator Hub",
    audienceAngle: "AI enthusiasts, indie hackers, and full-stack builders",
  },
  {
    id: "spark-4",
    title: "The 3 Coding Habits That Landed Me Offers at Top Tech Companies",
    format: "YouTube Short",
    pillar: "Productivity & Career",
    rawNotes:
      "Habit 1: Reading documentation first. Habit 2: Building public portfolio projects. Habit 3: Writing clean git commits and clear architectural decisions.",
    targetChannel: "Tech & Creator Hub",
    audienceAngle: "Aspiring engineers preparing for tech interviews",
  },
  {
    id: "spark-5",
    title: "Is Next.js Still Worth Learning in 2026? Honest Breakdown",
    format: "Long-form Video",
    pillar: "Opinion & Tech News",
    rawNotes:
      "Comprehensive benchmark and developer experience review of Next.js App Router vs Vite/Remix/Astro. Address caching changes, server actions, and enterprise adoption.",
    targetChannel: "Tech & Creator Hub",
    audienceAngle: "Web developers deciding on their 2026 tech stack",
  },
];

/**
 * Heuristic/Offline generator if Gemini API key is missing or offline
 */
export function generateOfflineContentCuration(
  item: DraftContentItem,
  template: ChannelTemplate = DEFAULT_CHANNEL_TEMPLATE,
  index: number = 0
): ContentRecord {
  const isShort = item.format === "YouTube Short";
  const now = new Date();
  const scheduleDate = new Date(now.getTime() + (index + 2) * 24 * 60 * 60 * 1000);
  const formattedSchedule = `${String(scheduleDate.getDate()).padStart(2, "0")}/${String(
    scheduleDate.getMonth() + 1
  ).padStart(2, "0")}/${scheduleDate.getFullYear()}, 06:00 PM`;

  const cleanTopic = item.title.trim() || "Untitled Video";

  const hook = isShort
    ? `⚠️ Wait, stop scrolling! If you are still doing ${cleanTopic.toLowerCase().replace(/^(how to|why|stop)\s+/i, "")}, you're wasting hours.`
    : `In this video, I'm breaking down exactly what most creators never tell you about ${cleanTopic.toLowerCase()}. By the end, you'll have an actionable system you can implement today.`;

  const scriptOutline = isShort
    ? `[0-3s] Pattern Interrupt Hook\n[4-15s] The Problem: Why conventional advice fails\n[16-35s] The Fix: Step-by-step 3-point walkthrough with screen overlay\n[36-45s] Actionable CTA: Like & check comments for code repo`
    : `00:00 - Introduction & Hook\n01:15 - The Core Problem & Industry Context\n03:40 - Architectural Breakdown & Live Demo\n08:20 - Common Pitfalls to Avoid\n12:15 - Step-by-Step Implementation Blueprint\n15:30 - Final Verdict & Key Takeaways\n16:45 - Outro & Recommended Next Watch`;

  const seoTags = Array.from(
    new Set([
      ...template.defaultTags,
      item.pillar.toLowerCase(),
      item.format.toLowerCase().replace(" ", "-"),
      cleanTopic.toLowerCase().split(" ").slice(0, 3).join(" "),
      "tech tutorial",
      "coding guide 2026",
    ])
  ).join(", ");

  const description = `${cleanTopic}\n\n📌 Summary:\n${item.rawNotes || "A comprehensive breakdown tailored for high impact."}\n\n⏳ Timestamps:\n${scriptOutline}\n\n---\n${template.defaultOutro}\n\n🔗 Connect:\n${template.socialLinks}`;

  const thumbnailBrief = isShort
    ? `[Vertical 9:16] Split screen: Top shows the red 'Don't do this' warning, Bottom shows glowing green solution. Text: "STOP DOING THIS!"`
    : `[Horizontal 16:9] High contrast navy/cyan background. Creator on right pointing left with surprised/focused expression. Big bold text (3 words max): "${cleanTopic.split(" ").slice(0, 3).join(" ").toUpperCase()}". Subtle code/architecture graphic in blur background.`;

  return {
    sNo: index + 1,
    title: cleanTopic,
    titleVariations: [
      cleanTopic,
      `How I Mastered ${cleanTopic} (Step-by-Step)`,
      `The Harsh Truth About ${cleanTopic}`,
      `Why Nobody Tells You This About ${cleanTopic}`,
    ],
    format: item.format,
    pillar: item.pillar || "Tutorial & How-To",
    hook,
    scriptOutline,
    seoTags,
    description,
    thumbnailBrief,
    targetChannel: item.targetChannel || template.name,
    scheduleTime: formattedSchedule,
    status: "Idea / Draft",
    notes: item.rawNotes || "Drafted in Studio Canvas",
    addedTimestamp: new Date().toISOString(),
  };
}

/**
 * Intelligent AI Curation via Google Gemini
 */
export async function curateContentWithGemini(
  items: DraftContentItem[],
  apiKey?: string,
  channelTemplate: ChannelTemplate = DEFAULT_CHANNEL_TEMPLATE
): Promise<ContentRecord[]> {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    console.log("No Gemini API key provided. Using intelligent heuristic curation engine.");
    return items.map((item, idx) => generateOfflineContentCuration(item, channelTemplate, idx));
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an elite YouTube Content Strategist, Producer, and Script Director.
Your task is to take draft video concepts and transform them into viral, high-CTR, actionable YouTube content blueprints.

Channel Context:
- Channel Name: ${channelTemplate.name}
- Niche: ${channelTemplate.niche}
- Tone: ${channelTemplate.tone}
- Default Outro: ${channelTemplate.defaultOutro}
- Social Links: ${channelTemplate.socialLinks}

Here are the draft content ideas:
${JSON.stringify(items, null, 2)}

Return a strict JSON array of objects with EXACTLY the following schema for each item:
[
  {
    "title": "Main punchy, high-CTR YouTube title (under 60 chars)",
    "titleVariations": ["Alt Title 1", "Alt Title 2", "Alt Title 3"],
    "format": "Matches input format (e.g. Long-form Video, YouTube Short)",
    "pillar": "Matches input pillar",
    "hook": "Word-for-word opening 10-15s hook or pattern interrupt",
    "scriptOutline": "Detailed timestamped script outline with key talking points",
    "seoTags": "Comma-separated high ranking tags and keywords",
    "description": "Full YouTube description with summary, timestamps, outro, and links",
    "thumbnailBrief": "Visual direction for thumbnail: subject expression, background, bold text overlay (max 3-4 words)",
    "targetChannel": "${channelTemplate.name}",
    "scheduleTime": "DD/MM/YYYY, HH:MM AM/PM",
    "status": "Idea / Draft",
    "notes": "Key execution notes or technical tips"
  }
]

IMPORTANT:
- Output ONLY valid raw JSON. No markdown code fences (\`\`\`json), no preamble, no postscript.`;

    const response = await model.generateContent(prompt);
    let text = response.response.text().trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini response is not an array");
    }

    return parsed.map((entry, idx) => ({
      sNo: idx + 1,
      title: entry.title || items[idx]?.title || "Untitled Video",
      titleVariations: entry.titleVariations || [entry.title],
      format: entry.format || items[idx]?.format || "Long-form Video",
      pillar: entry.pillar || items[idx]?.pillar || "Tutorial & How-To",
      hook: entry.hook || "",
      scriptOutline: entry.scriptOutline || "",
      seoTags: entry.seoTags || "",
      description: entry.description || "",
      thumbnailBrief: entry.thumbnailBrief || "",
      targetChannel: entry.targetChannel || channelTemplate.name,
      scheduleTime:
        entry.scheduleTime ||
        generateOfflineContentCuration(items[idx] || ({} as any), channelTemplate, idx).scheduleTime,
      status: "Idea / Draft",
      notes: entry.notes || items[idx]?.rawNotes || "",
      addedTimestamp: new Date().toISOString(),
    }));
  } catch (err: any) {
    console.warn("Gemini API call encountered an error, falling back to heuristic engine:", err.message);
    return items.map((item, idx) => generateOfflineContentCuration(item, channelTemplate, idx));
  }
}
