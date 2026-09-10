import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ContentRecord,
  DraftContentItem,
  ChannelTemplate,
  UnpackedIdeaResult,
  TitleOption,
  HookOption,
  ContentFormat,
} from "./types";
import { LOGLINE_STORY_PRINCIPLES } from "./inspirationPrinciples";

export const DEFAULT_CHANNEL_TEMPLATE: ChannelTemplate = {
  id: "primary-channel",
  name: "Jerry Melvin J",
  niche: "Software Engineering, AI Tools, & Tech Career Growth",
  tone: "Engaging, practical, high-value, punchy, authentic, and lived-experience driven",
  defaultOutro:
    "🔔 Found this breakdown actionable? Subscribe for weekly engineering blueprints.\n💬 Drop your questions below — I reply to every comment.\n🚀 Code repo & architectural diagrams in the pinned comment.",
  socialLinks:
    "GitHub: github.com/jerrymelvinj | LinkedIn: linkedin.com/in/jerrymelvinjm",
  defaultTags: ["software engineering", "coding", "web development", "ai tools", "system design", "storytelling"],
  contentPillars: [
    "Tutorial",
    "Breakdown",
    "Case Study",
    "Vlog / BTS",
    "Deep Dive",
    "Opinion / Tech News",
  ],
};

/**
 * High-stakes, narrative-driven trend sparks embodying the 5-beat story arc
 * and human-in-the-loop creative principles.
 */
export const SAMPLE_TREND_SPARKS: DraftContentItem[] = [
  {
    id: "spark-1",
    title: "I Used AI to Redesign a Client Flow, But the First Version Made It Worse",
    format: "Long-form Video",
    pillar: "Case Study",
    rawNotes:
      "Where I was: Presenting to VP of Product with sweaty hands. The problem: Over-automated AI workflow caused user friction. The discovery: Hybrid human-in-the-loop reduced errors by 80%. Lesson: Never replace creator judgment with raw automation.",
    targetChannel: "Jerry Melvin J",
    audienceAngle: "Product engineers & AI builders struggling with over-engineering",
  },
  {
    id: "spark-2",
    title: "The One Design Detail That Saved Our App (And Why I Almost Ignored It)",
    format: "YouTube Short",
    pillar: "Tutorial",
    rawNotes:
      "Quick 45s story: We spent 3 weeks optimizing database queries, but user drop-off was caused by an ambiguous 12px button label. The fix: Cognitive load reduction.",
    targetChannel: "Jerry Melvin J",
    audienceAngle: "Frontend developers and UI/UX practitioners",
  },
  {
    id: "spark-3",
    title: "Why Senior Engineers Write Less Code (And Why You Should Too)",
    format: "Long-form Video",
    pillar: "Deep Dive",
    rawNotes:
      "Opening loop: Churning out 1,000 lines of code feels productive until production breaks at 2 AM. The turning point: Thinking in systems, data contracts, and reusable primitives. Actionable blueprint for junior devs.",
    targetChannel: "Jerry Melvin J",
    audienceAngle: "Junior and mid-level developers aiming for senior promotions",
  },
  {
    id: "spark-4",
    title: "Why I Stopped Buying Expensive Gear for YouTube (And What Actually Matters)",
    format: "Long-form Video",
    pillar: "Opinion / Tech News",
    rawNotes:
      "Vulnerability: Blew $3,000 on 4K cameras and fancy lenses, yet retention stayed flat. The discovery: Crisp audio, simple visual hierarchy, and authentic storytelling mattered 10x more than cinematic glass.",
    targetChannel: "Jerry Melvin J",
    audienceAngle: "Solo creators and developer content creators battling perfectionism",
  },
  {
    id: "spark-5",
    title: "Stop Using useEffect for Everything in React 19!",
    format: "YouTube Short",
    pillar: "Tutorial",
    rawNotes:
      "Sensory pattern interrupt: Show console filled with infinite render loop errors. The conflict: useEffect misused for derived state. The 3-second fix: Server actions & state derivation.",
    targetChannel: "Jerry Melvin J",
    audienceAngle: "React engineers and full-stack builders",
  },
];

/**
 * Heuristic/Offline generator embodying the 3 Ingredients and 5-Beat Story Arc
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

  // Hook crafted with Specificity & Reliving (Present tense)
  const hook = isShort
    ? `⚠️ Stop scrolling. If you're still doing ${cleanTopic.toLowerCase().replace(/^(how to|why|stop)\s+/i, "")}, you're running into the exact trap that cost me two weeks of rebuilding. Here's the 30-second fix.`
    : `Last month, I ran into a scenario with ${cleanTopic.toLowerCase()} that almost derailed our entire project. In this video, I'm reliving exactly what failed, the unexpected turning point, and the step-by-step system you can steal for your own workflow today.`;

  // 5-Beat Story Arc Timeline Outline
  const scriptOutline = isShort
    ? `[0-3s] Pattern Interrupt & Cold Open (Stakes & Sensory Detail)\n[4-14s] The Tension: Why conventional advice failed in practice\n[15-32s] The Discovery: Concrete 3-step walkthrough with on-screen code\n[33-45s] The Meaning: Actionable rule + Check pinned comment for code`
    : `00:00 - Cold Open: The Lived Scene & Stakes (Where I was, what happened)\n01:15 - The Core Problem & The Failed Attempt\n03:30 - The Turning Point: Unexpected Discovery\n06:45 - The Practical System: Low Cognitive Load Breakdown & Demo\n11:20 - Common Edge Cases & Pitfalls to Avoid\n14:10 - The Meaning: "Why I'm telling you this" (Actionable Takeaway)\n15:30 - Concise Bridge to Next Video (No generic filler)`;

  const seoTags = Array.from(
    new Set([
      ...template.defaultTags,
      item.pillar.toLowerCase(),
      item.format.toLowerCase().replace(" ", "-"),
      cleanTopic.toLowerCase().split(" ").slice(0, 3).join(" "),
      "creator engineering",
      "practical tutorial",
    ])
  ).join(", ");

  const description = `${cleanTopic}\n\n📌 The Story & Context:\n${item.rawNotes || "A concrete, lived-experience breakdown designed to solve a genuine problem."}\n\n⏳ Story Timeline & Chapters:\n${scriptOutline}\n\n---\n${template.defaultOutro}\n\n🔗 Connect & Repo:\n${template.socialLinks}`;

  const thumbnailBrief = isShort
    ? `[Vertical 9:16] Clean high-contrast split: Top shows the red 'Problem' state, Bottom shows the green 'Fixed' code. Bold 3-word badge: "DON'T DO THIS".`
    : `[Horizontal 16:9] Clean visual hierarchy (low cognitive noise). Creator on right with authentic focused/surprised reaction. Bold 3-word badge: "${cleanTopic.split(" ").slice(0, 3).join(" ").toUpperCase()}". Subtle blurred UI/architecture in background.`;

  return {
    sNo: index + 1,
    title: cleanTopic,
    titleVariations: [
      cleanTopic,
      `I Tested ${cleanTopic} (The Unexpected Result)`,
      `The Costly Mistake Behind ${cleanTopic}`,
      `Why Nobody Tells You This About ${cleanTopic}`,
    ],
    format: item.format,
    pillar: item.pillar || "Tutorial",
    hook,
    scriptOutline,
    seoTags,
    description,
    thumbnailBrief,
    targetChannel: item.targetChannel || template.name,
    scheduleTime: formattedSchedule,
    status: "Idea / Draft",
    notes: item.rawNotes || "Drafted with Logline Story Arc",
    addedTimestamp: new Date().toISOString(),
  };
}

/**
 * Intelligent AI Curation via Google Gemini
 * Educated with the Creator Storytelling & Narrative Intelligence framework.
 */
export async function curateContentWithGemini(
  items: DraftContentItem[],
  apiKey?: string,
  channelTemplate: ChannelTemplate = DEFAULT_CHANNEL_TEMPLATE
): Promise<ContentRecord[]> {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    console.log("No Gemini API key in environment. Using intelligent heuristic storytelling engine.");
    return items.map((item, idx) => generateOfflineContentCuration(item, channelTemplate, idx));
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const modelCandidates = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
    let model = genAI.getGenerativeModel({ model: modelCandidates[0] });

    const storytellingGuidance = `
CORE STORYTELLING INTELLIGENCE & CREATOR FRAMEWORK:
1. THE 5-QUESTION NARRATIVE DATA PATTERN:
   Ground abstract concepts in lived scenes: "Where am I? What am I doing? What am I thinking? What am I feeling? What was said?"
   Use concrete sensory details (e.g., "hands sweating while opening the file") rather than abstract generalities ("I was nervous").

2. THE 3 STORY INGREDIENTS:
   - Specificity: Concrete, tangible visuals and moments over generic lists.
   - Reliving: Frame openings and anecdotes in the present tense, inside the moment, with active embodiment.
   - Meaning: Every narrative arc must answer "Why am I telling you this?" and deliver an actionable universal takeaway for the viewer's life.

3. THE 5-STAGE STORY ARC (STORY CREATES PERCEIVED VALUE):
   Structure video outlines into:
   - The Problem Faced
   - The Failed Solution (honest vulnerability / empathy)
   - The Unexpected Discovery (the turning point)
   - The Personal Consequence
   - The Actionable Lesson for the Viewer

4. ETHICAL CURIOSITY & OPEN LOOPS:
   - Open a genuine loop in the hook and close it with credible evidence and proof.
   - NEVER create manipulative clickbait or empty promises.
   - Reduce cognitive load: clean sections, direct explanations, calm pacing. Avoid cheesy outro plugs; end with a concise bridge to the next video.
`;

    const prompt = `You are the Lead Story Director and Content Strategist at Logline Studio.
Your mission is to infuse raw video ideas with human-in-the-loop storytelling principles, emotional resonance, and high-CTR packaging.

Channel Context:
- Channel: ${channelTemplate.name}
- Niche: ${channelTemplate.niche}
- Tone: ${channelTemplate.tone}
- Outro: ${channelTemplate.defaultOutro}
- Socials: ${channelTemplate.socialLinks}

${storytellingGuidance}

Draft Concepts to Elevate:
${JSON.stringify(items, null, 2)}

Return a strict JSON array of objects with EXACTLY this schema for each item:
[
  {
    "title": "High-clarity, emotional curiosity YouTube title (under 60 chars)",
    "titleVariations": ["Alt Title 1", "Alt Title 2", "Alt Title 3"],
    "format": "Matches input format",
    "pillar": "Matches input pillar",
    "hook": "Word-for-word opening 10-15s hook using sensory detail, pattern interrupt, or honest open loop",
    "scriptOutline": "Detailed timestamped outline following the 5-Stage Story Arc (Hook -> Tension/Failed Attempt -> Discovery -> Blueprint -> Meaning/Takeaway)",
    "seoTags": "Comma-separated keywords and search phrases",
    "description": "Full description with context summary, timestamped chapters, channel outro, and links",
    "thumbnailBrief": "Visual packaging direction: subject expression, contrast colors, punchy 3-word badge overlay, low cognitive noise",
    "targetChannel": "${channelTemplate.name}",
    "scheduleTime": "DD/MM/YYYY, HH:MM AM/PM",
    "status": "Idea / Draft",
    "notes": "Key execution notes or technical storytelling pointers"
  }
]

IMPORTANT: Return ONLY valid raw JSON without markdown code fences (\`\`\`json).`;

    let response;
    let success = false;
    for (const mName of modelCandidates) {
      try {
        model = genAI.getGenerativeModel({ model: mName });
        response = await model.generateContent(prompt);
        success = true;
        break;
      } catch (err: any) {
        console.warn(`Model ${mName} error: ${err.message}. Trying next candidate...`);
      }
    }

    if (!success || !response) {
      throw new Error("All Gemini model candidates encountered errors.");
    }

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
      pillar: entry.pillar || items[idx]?.pillar || "Tutorial",
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
    console.warn("Gemini API call error, falling back to storytelling heuristic engine:", err.message);
    return items.map((item, idx) => generateOfflineContentCuration(item, channelTemplate, idx));
  }
}

/**
 * Intelligent Heuristic Generator for Unpacking Raw Brain Dumps (Offline Fallback)
 */
export function generateOfflineUnpackedIdea(
  rawIdea: string,
  channelTemplate: ChannelTemplate
): UnpackedIdeaResult {
  const cleanIdea = rawIdea.trim() || "My New Video Project";
  // Extract up to 6 words for a topic slug
  const topicWords = cleanIdea
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");

  const capitalizedTopic = topicWords
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    titles: [
      {
        style: "Curiosity",
        title: `The Harsh Reality of ${capitalizedTopic}`,
      },
      {
        style: "Direct / How-To",
        title: `How to Master ${capitalizedTopic} (Step-by-Step)`,
      },
      {
        style: "High-Stakes",
        title: `Stop Doing ${capitalizedTopic} Until You Watch This`,
      },
    ],
    hooks: [
      {
        archetype: "The Contrast Opening",
        hook: `Most creators think ${topicWords.toLowerCase()} requires endless effort. But here is the exact 3-step shift that changed everything for me.`,
      },
      {
        archetype: "The Hard Truth",
        hook: `I wasted weeks struggling with this exact problem, only to realize 90% of conventional tutorials are teaching it backwards.`,
      },
      {
        archetype: "The Before/After",
        hook: `Here is what happened when I completely overhauled my approach to ${topicWords.toLowerCase()}—and why you should do it today.`,
      },
    ],
    suggestedPillar: cleanIdea.toLowerCase().includes("how") || cleanIdea.toLowerCase().includes("tutorial")
      ? "Tutorial"
      : cleanIdea.toLowerCase().includes("redesign") || cleanIdea.toLowerCase().includes("client")
      ? "Case Study"
      : "Breakdown",
    suggestedFormat: cleanIdea.length < 50 ? "YouTube Short" : "Long-form Video",
    targetAudienceAngle: `Engineers, creators, and problem-solvers facing bottlenecks with ${topicWords.toLowerCase()}`,
  };
}

/**
 * Unpacks a raw brain dump into 3 punchy titles and 3 hook archetypes using Gemini
 */
export async function unpackRawIdeaWithGemini(
  rawIdea: string,
  channelTemplate: ChannelTemplate,
  apiKey?: string
): Promise<UnpackedIdeaResult> {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    return generateOfflineUnpackedIdea(rawIdea, channelTemplate);
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const modelCandidates = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"];

    const prompt = `You are an elite YouTube Content Producer and Creative Strategist at Logline Studio.
The creator has provided a messy, raw thought or scratchpad brain dump:
"${rawIdea}"

Channel Context:
- Channel: ${channelTemplate.name}
- Niche: ${channelTemplate.niche}
- Tone: ${channelTemplate.tone}

Your goal: Eliminate the creator's "Cold Start" friction by unpacking this raw thought into high-impact packaging options:
1. 3 Clickable Title Variations (under 60 characters each, high CTR, emotional curiosity, zero spam):
   - One "Curiosity" title (intriguing question or unexpected paradox)
   - One "Direct / How-To" title (clear value proposition, search-friendly)
   - One "High-Stakes" title (urgent, mistake-avoidance, contrarian)
2. 3 Hook Archetypes (the opening 10-15s verbal script trigger that stops the scroll):
   - Archetype "The Contrast Opening" (expectation vs reality)
   - Archetype "The Hard Truth" (vulnerable admission or misconception)
   - Archetype "The Before/After" (clear transformation with proof)
3. Suggested Content Pillar (e.g. Tutorial, Case Study, Breakdown, Deep Dive, Vlog / BTS, Opinion / Tech News)
4. Suggested Format (Long-form Video or YouTube Short)
5. Target Audience Angle (1 sentence on who this is specifically for)

Return STRICT JSON matching this exact structure:
{
  "titles": [
    { "style": "Curiosity", "title": "..." },
    { "style": "Direct / How-To", "title": "..." },
    { "style": "High-Stakes", "title": "..." }
  ],
  "hooks": [
    { "archetype": "The Contrast Opening", "hook": "..." },
    { "archetype": "The Hard Truth", "hook": "..." },
    { "archetype": "The Before/After", "hook": "..." }
  ],
  "suggestedPillar": "Tutorial",
  "suggestedFormat": "Long-form Video",
  "targetAudienceAngle": "..."
}

IMPORTANT: Return ONLY valid raw JSON. No markdown code fences, no explanations.`;

    let response;
    for (const mName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        response = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        console.warn(`Model ${mName} failed in unpackRawIdea: ${err.message}. Trying next candidate...`);
      }
    }

    if (!response) {
      throw new Error("All Gemini models failed for unpackRawIdea.");
    }

    let text = response.response.text().trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(text) as UnpackedIdeaResult;
    if (!parsed.titles || !parsed.hooks) {
      throw new Error("Invalid schema from Gemini unpack");
    }

    return parsed;
  } catch (err: any) {
    console.warn("Gemini unpack error, falling back to heuristic engine:", err.message);
    return generateOfflineUnpackedIdea(rawIdea, channelTemplate);
  }
}

/**
 * Granular AI Accelerators for isolated sections in Production Canvas
 */
export async function granularFleshWithGemini({
  type,
  item,
  currentRecord,
  channelTemplate,
  apiKey,
}: {
  type: "outline" | "thumbnail" | "description" | "tags";
  item: DraftContentItem;
  currentRecord?: Partial<ContentRecord>;
  channelTemplate: ChannelTemplate;
  apiKey?: string;
}): Promise<{ result: string }> {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;
  const title = currentRecord?.title || item.title || "Untitled Video";
  const notes = item.rawNotes || currentRecord?.notes || "";

  // Offline Fallback Generators
  if (!activeKey) {
    if (type === "outline") {
      return {
        result: `0:00 Hook & Lived Scene: [Set the stakes with sensory detail]\n0:45 Conflict / Failed Attempt: [Why the common solution failed]\n2:15 The Unexpected Discovery: [The breakthrough concept or tool]\n4:30 Step-by-Step Blueprint: [Actionable implementation]\n7:00 Takeaway & Meaning: [Universal lesson & bridge to next video]`,
      };
    }
    if (type === "thumbnail") {
      const words = title.split(" ").slice(0, 3).join(" ").toUpperCase();
      return {
        result: `[Horizontal 16:9 - High Contrast] Split composition. Left: Blurred UI/problem preview. Right: Authentic expressive creator reaction. Bold 3-word badge overlay: "${words}". Low visual clutter.`,
      };
    }
    if (type === "description") {
      return {
        result: `${title}\n\n📌 In this breakdown, we explore practical solutions to overcome common bottlenecks.\n\n⏱️ Chapters:\n0:00 - The Problem\n0:45 - What Failed First\n2:15 - The Turning Point\n4:30 - Complete Blueprint\n7:00 - Key Takeaway\n\n---\n${channelTemplate.defaultOutro}\n\n🔗 ${channelTemplate.socialLinks}`,
      };
    }
    return {
      result: `${item.pillar.toLowerCase()}, ${item.format.toLowerCase().replace(" ", "-")}, software engineering, coding, tech career, workflow tips`,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const modelCandidates = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"];

    let prompt = "";
    if (type === "outline") {
      prompt = `You are an elite YouTube Script Doctor.
Title: "${title}"
Context & Notes: "${notes}"
Channel Tone: ${channelTemplate.tone}

Expand this into an actionable 5-Beat Narrative Script Outline with realistic timestamps:
- 0:00 [Hook & Lived Scene]: Cold open with sensory detail & central tension.
- [The Conflict / Failed Attempt]: Honest vulnerability; what went wrong first.
- [The Unexpected Discovery]: The pivot point / eureka moment.
- [The Step-by-Step Blueprint]: Concrete, actionable breakdown.
- [Takeaway & Concise Bridge]: Universal meaning for the viewer + fast bridge to the next video (no filler outro).

Return ONLY the plain formatted outline with timestamps. No introductory banter.`;
    } else if (type === "thumbnail") {
      prompt = `You are an expert YouTube Thumbnail Visual Director.
Title: "${title}"
Context: "${notes}"

Generate a punchy, high-CTR, low-cognitive-noise Visual Thumbnail Brief:
1. Composition & Lighting: High contrast, framing.
2. Subject Emotion / Focus: Authentic reaction.
3. Bold Text Hook: EXACTLY 2 to 3 punchy, high-contrast words for the thumbnail badge.
4. Background: Minimal clutter, clean contrast.

Return ONLY the concise visual brief.`;
    } else if (type === "description") {
      prompt = `You are a YouTube SEO and Channel Manager.
Title: "${title}"
Notes: "${notes}"
Outro: "${channelTemplate.defaultOutro}"
Socials: "${channelTemplate.socialLinks}"

Write a clean, engaging YouTube video description including:
1. High-value 2-sentence hook & summary.
2. Timestamped chapter list based on the core narrative beats.
3. Channel Outro and Social links.

Return ONLY the final ready-to-paste description.`;
    } else {
      prompt = `Generate 12-15 high-ranking, search-intent YouTube tags and comma-separated keywords for:
Title: "${title}"
Notes: "${notes}"
Niche: "${channelTemplate.niche}"

Return ONLY comma-separated tags.`;
    }

    let response;
    for (const mName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        response = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        console.warn(`Model ${mName} error in granularFlesh: ${err.message}`);
      }
    }

    if (!response) {
      throw new Error("All Gemini candidates failed in granularFlesh");
    }

    return { result: response.response.text().trim() };
  } catch (err: any) {
    console.warn("Falling back to heuristic in granularFlesh:", err.message);
    return {
      result:
        type === "outline"
          ? `0:00 Hook\n1:00 Problem & Struggle\n2:30 Discovery\n4:00 Blueprint\n6:00 Takeaway`
          : type === "thumbnail"
          ? `High contrast visual for "${title}". Bold 3-word text badge.`
          : type === "description"
          ? `${title}\n\n---\n${channelTemplate.defaultOutro}`
          : "youtube, coding, tutorial",
    };
  }
}

