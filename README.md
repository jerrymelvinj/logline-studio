# YouTube Content Curation & Execution Studio (Web App)

A high-productivity content curation, script ideation, and execution pipeline built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Google Gemini AI**, directly integrated with **Google Sheets**.

Modeled after the robust 3-screen workflow architecture of the candidate extraction system (`hr-resume-extractor-web`), adapted for YouTube creators and video production workflows.

---

## 📸 3-Screen Creator Pipeline Architecture

### Screen 01: Ideation & Studio Intake
- **Zero Document Uploads**: Fast, direct drafting of video ideas, working titles, and raw thoughts.
- **Format Selection**: `Long-form Video`, `YouTube Short`, `Community Post`, `Live Stream`, `Podcast / Interview`.
- **Content Pillar Selector**: Categorize by `Tutorial & How-To`, `Deep Dive & Breakdown`, `Industry Trends & AI`, `Project Build`, `Productivity & Career`, `Opinion & Tech News`.
- **⚡ AI Trend Sparks**: Instant one-click loader that populates 5 realistic trending video concepts with pre-configured angles for rapid testing.
- **Direct Database Link**: Emerald-bordered button to inspect existing records or open your connected Google Sheet.

### Screen 02: Staging & AI Curation Canvas
- **Visual Card Staging**: Interactive cards displaying queued concepts with format icons, pillar tags, and audience angles.
- **Right-Docked Management Sidebar**:
  - Live queued item counter badge (`3 +`).
  - Solid deep blue cards (`#0057B7`) with format pills and individual delete (`×`) controls.
  - Sticky bottom CTA: **"Curate Data with AI ➔"** in deep royal blue (`#00529B`).
- **Gemini AI Curation Engine**:
  - Automatically enriches each idea into a comprehensive YouTube production blueprint:
    - 3 Catchy High-CTR Title Variations.
    - Pattern-Interrupt Hook (Opening 10-15s).
    - Structured, Timestamped Script Outline.
    - SEO Tags & Targeted Keywords.
    - Full YouTube Description with channel outro and links.
    - Detailed Thumbnail Concept Brief (subject framing, expression, bold text overlay).

### Screen 03: Execution Table & Google Sheets Sync
- Centered header: `"Content Pipeline Ready for Execution!"`.
- **Full Inline-Editable Table** across all 14 columns:
  1. `S.No`
  2. `Content Title` (with drawer to view AI title variations)
  3. `Format` (Dropdown)
  4. `Pillar`
  5. `Hook / Opening 10s`
  6. `Script Outline`
  7. `SEO Tags`
  8. `Thumbnail Brief`
  9. `Target Channel`
  10. `Schedule Date & Time` (Calendar & time picker: `DD/MM/YYYY, HH:MM AM/PM`)
  11. `Status` (Dropdown: `Idea / Draft`, `Scripting`, `Ready to Record`, `In Editing`, `Scheduled`, `Published`, `On Hold`)
  12. `Execution Notes` (Raw footage or Drive links)
  13. `Inspect` (Modal popup for full formatted script and copyable sections)
- **Dynamic Status Row Coloring**:
  - `Published` ➔ Soft Emerald Green
  - `Scheduled` ➔ Soft Amber
  - `In Editing` ➔ Soft Purple
  - `Ready to Record` ➔ Soft Sky Blue
  - `Scripting` ➔ Soft Blue
  - `On Hold` ➔ Soft Red
- **Actions Row**:
  - Circular dark back button (`←`).
  - **"Go to Content DB Inspector"** (opens multi-tab database modal).
  - **"Sync to Google Sheets ➔"** (triggers live cloud sync with deduplication).
  - **"Download Excel Backup (.xlsx)"** (multi-sheet formatted workbook).

---

## 📊 Google Sheets Live Synchronization

Connected Google Sheet:
[View Connected Google Sheet](https://docs.google.com/spreadsheets/d/1BauHyRepxXE5m5CFGwmh6EQJfsjog4lCSLqalI6AhvQ/edit?usp=sharing)
- **Spreadsheet ID**: `1BauHyRepxXE5m5CFGwmh6EQJfsjog4lCSLqalI6AhvQ`

### 1-Minute Webhook Setup for Real-Time Writing:
1. Open the [Google Sheet](https://docs.google.com/spreadsheets/d/1BauHyRepxXE5m5CFGwmh6EQJfsjog4lCSLqalI6AhvQ/edit?usp=sharing).
2. Click **Extensions ➔ Apps Script**.
3. In the web app, click **Google Sheets Sync** at top right and click **Copy Apps Script**.
4. Paste into Apps Script, click **Deploy ➔ New deployment**.
5. Select type **Web app**, set *Execute as: Me* and *Who has access: Anyone*.
6. Paste the resulting Web App URL into the app's settings.

---

## 🔑 Google Gemini API Setup (Optional)

The tool includes a built-in heuristic/template generation engine that works completely offline without any API key. To enable full contextual generative AI via Gemini:
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and create a free key (`AIzaSy...`).
3. In the web app, click **Gemini AI** in the top navigation bar and paste your key.

---

## 💻 Running Locally

```bash
# Navigate to the project directory
cd /Users/akoigd/.gemini/antigravity/scratch/youtube-content-curator-web

# Install dependencies (already prepared)
npm install

# Run automated test suite
npm test

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
