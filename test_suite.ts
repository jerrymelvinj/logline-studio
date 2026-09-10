import assert from "assert";
import fs from "fs";
import {
  mergeContentRecordsDeduplicated,
  getGoogleAppsScriptCode,
  DEFAULT_GOOGLE_SHEET_ID,
} from "./lib/googleSheetsSync";
import {
  generateOfflineContentCuration,
  DEFAULT_CHANNEL_TEMPLATE,
  SAMPLE_TREND_SPARKS,
} from "./lib/aiCurator";
import { buildStyledExcelWorkbook } from "./lib/excelExport";
import { ContentRecord, DraftContentItem } from "./lib/types";

// Load .env.local for test runner if needed
if (!process.env.GEMINI_API_KEY && fs.existsSync(".env.local")) {
  const envFile = fs.readFileSync(".env.local", "utf8");
  const match = envFile.match(/GEMINI_API_KEY=([^\r\n]+)/);
  if (match) process.env.GEMINI_API_KEY = match[1].trim();
}

async function runTestSuite() {
  console.log("🚀 Starting Test Suite for YouTube Content Curation Studio...");

  // Test 1: Deduplication Logic
  console.log("\n🧪 Test 1: Content Deduplication & Merge");
  const existing: ContentRecord[] = [
    {
      sNo: 1,
      title: "Why Senior Engineers Write Less Code",
      format: "Long-form Video",
      pillar: "Deep Dive",
      hook: "Original hook",
      scriptOutline: "Outline 1",
      seoTags: "senior engineer",
      description: "Description 1",
      thumbnailBrief: "Thumbnail 1",
      targetChannel: "Tech & Creator Hub",
      scheduleTime: "12/09/2026, 06:00 PM",
      status: "Idea / Draft",
      notes: "First note",
      addedTimestamp: new Date().toISOString(),
    },
  ];

  const incoming: ContentRecord[] = [
    {
      sNo: 1,
      title: "why senior engineers write less code ", // same title with whitespace/casing
      format: "Long-form Video",
      pillar: "Deep Dive",
      hook: "Updated hook",
      scriptOutline: "Updated Outline",
      seoTags: "senior engineer, coding",
      description: "Updated Description",
      thumbnailBrief: "Updated Thumbnail",
      targetChannel: "Tech & Creator Hub",
      scheduleTime: "14/09/2026, 06:00 PM",
      status: "Scripting",
      notes: "Updated note",
      addedTimestamp: new Date().toISOString(),
    },
    {
      sNo: 2,
      title: "How I Built an Autonomous AI Agent in 24 Hours",
      format: "Long-form Video",
      pillar: "Project Build",
      hook: "Hook 2",
      scriptOutline: "Outline 2",
      seoTags: "ai, nextjs",
      description: "Desc 2",
      thumbnailBrief: "Thumb 2",
      targetChannel: "Tech & Creator Hub",
      scheduleTime: "15/09/2026, 06:00 PM",
      status: "Ready to Record",
      notes: "Second note",
      addedTimestamp: new Date().toISOString(),
    },
  ];

  const { merged, addedCount, duplicateCount } = mergeContentRecordsDeduplicated(existing, incoming);
  assert.strictEqual(merged.length, 2, "Merged should have 2 unique records");
  assert.strictEqual(addedCount, 1, "Added count should be 1");
  assert.strictEqual(duplicateCount, 1, "Duplicate count should be 1");
  assert.strictEqual(merged[0].status, "Scripting", "Duplicate entry should update with incoming status");
  console.log("✅ Test 1 Passed: Deduplication works flawlessly.");

  // Test 2: Heuristic Content Curation Generation
  console.log("\n🧪 Test 2: Offline Curation Generator");
  const draft: DraftContentItem = {
    id: "test-draft-1",
    title: "10 React Performance Pitfalls You Must Avoid",
    format: "YouTube Short",
    pillar: "Tutorial & How-To",
    rawNotes: "Mention memoization, context re-renders, and lazy loading",
    targetChannel: "Tech & Creator Hub",
  };

  const curated = generateOfflineContentCuration(draft, DEFAULT_CHANNEL_TEMPLATE, 0);
  assert.strictEqual(curated.title, "10 React Performance Pitfalls You Must Avoid");
  assert.ok(curated.hook.length > 20, "Hook should be generated");
  assert.ok(curated.scriptOutline.includes("Pattern Interrupt"), "Short outline should have short structure");
  assert.ok(curated.seoTags.includes("tutorial"), "SEO tags should include pillar");
  assert.ok(curated.thumbnailBrief.includes("Vertical 9:16"), "Shorts thumbnail should be 9:16");
  assert.ok(curated.description.includes(DEFAULT_CHANNEL_TEMPLATE.defaultOutro), "Description should include outro");
  console.log("✅ Test 2 Passed: Curation generator creates complete YouTube blueprints.");

  // Test 3: Sample Trend Sparks
  console.log("\n🧪 Test 3: Sample Trend Sparks Integrity");
  assert.strictEqual(SAMPLE_TREND_SPARKS.length, 5, "Should have 5 trend sparks");
  SAMPLE_TREND_SPARKS.forEach((s, idx) => {
    assert.ok(s.title.length > 5, `Spark ${idx} title valid`);
    assert.ok(s.format, `Spark ${idx} format valid`);
  });
  console.log("✅ Test 3 Passed: 5 Trend Sparks loaded correctly.");

  // Test 4: Excel Workbook Generation
  console.log("\n🧪 Test 4: Multi-sheet Excel Workbook Builder");
  const testRecords: ContentRecord[] = [
    curated,
    {
      sNo: 2,
      title: "System Design for Real-Time Notification Engines",
      format: "Long-form Video",
      pillar: "Deep Dive",
      hook: "Scaling to 1M requests per second...",
      scriptOutline: "00:00 Intro\n05:00 Architecture",
      seoTags: "system design, redis",
      description: "Architecture review",
      thumbnailBrief: "Diagram in background",
      targetChannel: "Tech & Creator Hub",
      scheduleTime: "20/09/2026, 06:00 PM",
      status: "Published",
      notes: "Slides linked",
      addedTimestamp: new Date().toISOString(),
    },
  ];

  const workbook = await buildStyledExcelWorkbook(testRecords);
  assert.ok(workbook.getWorksheet("Master Content Pipeline"), "Master sheet should exist");
  assert.ok(workbook.getWorksheet("YouTube Short"), "YouTube Short sub-sheet should exist");
  assert.ok(workbook.getWorksheet("Long-form Video"), "Long-form Video sub-sheet should exist");
  const master = workbook.getWorksheet("Master Content Pipeline")!;
  assert.strictEqual(master.rowCount, 3, "Master sheet should have header + 2 data rows");
  console.log("✅ Test 4 Passed: Excel partitions records into segregated worksheets.");

  // Test 5: Google Apps Script Generator
  console.log("\n🧪 Test 5: Google Apps Script Template Validation");
  const scriptCode = getGoogleAppsScriptCode();
  assert.ok(scriptCode.includes(DEFAULT_GOOGLE_SHEET_ID), "Script contains Sheet ID");
  assert.ok(scriptCode.includes("doPost"), "Script defines doPost handler");
  assert.ok(scriptCode.includes("Master Content Pipeline"), "Script targets Master sheet");
  assert.ok(scriptCode.includes("#00529B"), "Script styles header with Royal Blue");
  console.log("✅ Test 5 Passed: Google Apps Script helper is complete & correct.");

  // Test 6: Cold-Start Unpack & Frame Engine
  console.log("\n🧪 Test 6: Cold-Start Raw Idea Unpacking (Phase 1)");
  const { generateOfflineUnpackedIdea, granularFleshWithGemini } = await import("./lib/aiCurator");
  const rawBrainDump = "I spent two weeks redesigning my workflow in Framer and realized 90% of tutorials overcomplicate responsiveness.";
  const unpacked = generateOfflineUnpackedIdea(rawBrainDump, DEFAULT_CHANNEL_TEMPLATE);
  assert.strictEqual(unpacked.titles.length, 3, "Should return 3 title options");
  assert.ok(unpacked.titles.some((t) => t.style === "Curiosity"), "Contains Curiosity style");
  assert.ok(unpacked.titles.some((t) => t.style === "Direct / How-To"), "Contains Direct / How-To style");
  assert.ok(unpacked.titles.some((t) => t.style === "High-Stakes"), "Contains High-Stakes style");
  assert.strictEqual(unpacked.hooks.length, 3, "Should return 3 hook archetypes");
  assert.ok(unpacked.hooks.some((h) => h.archetype === "The Contrast Opening"), "Contains Contrast Opening");
  assert.ok(unpacked.hooks.some((h) => h.archetype === "The Hard Truth"), "Contains Hard Truth");
  assert.ok(unpacked.hooks.some((h) => h.archetype === "The Before/After"), "Contains Before/After");
  console.log("✅ Test 6 Passed: Raw brain dump unpacked into 3 title options & 3 hook archetypes.");

  // Test 7: Granular AI Accelerators (Phase 2 Modular Flesh)
  console.log("\n🧪 Test 7: Granular AI Accelerators (Outline, Thumbnail, Description)");
  const sampleItem: DraftContentItem = {
    id: "test-item-1",
    title: "How to Build Production-Ready Next.js Apps",
    format: "Long-form Video",
    pillar: "Tutorial",
    rawNotes: "Key points: Server actions, cache revalidation, streaming suspense.",
    targetChannel: DEFAULT_CHANNEL_TEMPLATE.name,
  };
  const outlineRes = await granularFleshWithGemini({
    type: "outline",
    item: sampleItem,
    channelTemplate: DEFAULT_CHANNEL_TEMPLATE,
  });
  assert.ok(outlineRes.result.includes("0:00"), "Outline contains timestamped beats");

  const thumbRes = await granularFleshWithGemini({
    type: "thumbnail",
    item: sampleItem,
    channelTemplate: DEFAULT_CHANNEL_TEMPLATE,
  });
  assert.ok(thumbRes.result && thumbRes.result.length > 15, "Thumbnail brief is generated with visual directions");

  // Test 8: Backend Generation Route (/api/generate)
  console.log("\n🧪 Test 8: Backend Generation Route (/api/generate)");
  const { POST: generateHandler } = await import("./app/api/generate/route");
  const generateReq = new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Why Dribbble Designs Fail in Real Production",
      hook: "90% of designs on Dribbble are mathematically impossible to build in CSS.",
      format: "Long-form Video",
      pillar: "Case Study",
      rawIdea: "Figma auto-layout and responsive design versus static dribbble shots.",
    }),
  });
  const generateRes = await generateHandler(generateReq);
  const generateData = await generateRes.json();
  assert.strictEqual(generateData.success, true, "Generation route should succeed");
  assert.ok(generateData.data.scriptOutline, "Contains scriptOutline");
  assert.ok(generateData.data.thumbnailBrief, "Contains thumbnailBrief");
  assert.ok(generateData.data.description, "Contains description");
  assert.ok(generateData.data.seoTags, "Contains seoTags");
  console.log("✅ Test 8 Passed: /api/generate successfully returns complete production assets.");

  console.log("\n🎉 ALL 8 TESTS PASSED SUCCESSFULLY!");
}

runTestSuite().catch((err) => {
  console.error("❌ Test Suite Failed:", err);
  process.exit(1);
});
