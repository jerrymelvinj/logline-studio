/**
 * Logline Studio Storytelling & Media Inspiration Principles
 * Codified from creator media consumption and storytelling frameworks.
 */

export interface StoryPrinciple {
  id: string;
  category: "narrative" | "neurochemical" | "packaging" | "production";
  title: string;
  mentalShortcut: string;
  coreRule: string;
  actionableExample: string;
  modernEvaluation: string;
}

export const LOGLINE_STORY_PRINCIPLES: StoryPrinciple[] = [
  {
    id: "five-question-pattern",
    category: "narrative",
    title: "The 5-Question Narrative Data Pattern",
    mentalShortcut: "Where am I? What am I doing? What am I thinking? What am I feeling? What was said?",
    coreRule: "Ground abstract advice in a specific lived scene with action, internal monologue, emotional shift, and spoken dialogue.",
    actionableExample: "Instead of 'I was nervous presenting to a client', use 'My hands were sweating as I opened the Figma file in front of the VP of Product.'",
    modernEvaluation: "Concrete sensory details make ideas tangible; viewers connect to lived human experiences rather than abstract theory.",
  },
  {
    id: "three-ingredients",
    category: "narrative",
    title: "The 3 Story Ingredients: Specificity, Reliving, Meaning",
    mentalShortcut: "Be Specific ➔ Relive in Present Tense ➔ Answer 'Why am I telling you this?'",
    coreRule: "1. Specificity (sensory details). 2. Reliving (embodiment and present pacing). 3. Meaning (the universal lesson for the viewer's life).",
    actionableExample: "A story without a takeaway feels entertaining but empty. Every personal struggle must deliver actionable clarity to the audience.",
    modernEvaluation: "Essential for educational content. Reliving builds emotional investment; meaning delivers long-term audience trust.",
  },
  {
    id: "story-perceived-value",
    category: "narrative",
    title: "Story Creates Perceived Value (The 5-Beat Arc)",
    mentalShortcut: "Problem ➔ Failed Solution ➔ Unexpected Discovery ➔ Personal Consequence ➔ Viewer Lesson",
    coreRule: "A subject is never enough by itself. Wrap tools, code, or ideas in conflict and consequence.",
    actionableExample: "'I tested 5 AI tools' is flat. 'I used AI to redesign a client flow, but the first version made the product worse' hooks curiosity immediately.",
    modernEvaluation: "Conflict and human stakes increase watch-time and retention far more than informational lists.",
  },
  {
    id: "open-loops-dopamine",
    category: "neurochemical",
    title: "Anticipation & Open Loops (Ethical Curiosity)",
    mentalShortcut: "Open a loop with genuine stakes ➔ Deliver the promised reveal.",
    coreRule: "Withhold the conclusion slightly to create suspense, but NEVER manipulate with empty clickbait. Open a genuine question, then close it with proof.",
    actionableExample: "'I thought this would solve the bottleneck, but it created a bigger one. Here is the one architecture detail that saved the launch.'",
    modernEvaluation: "Modern viewers have high sensitivity to clickbait. Curiosity must always be paired with credible, fulfilled payoff.",
  },
  {
    id: "empathy-oxytocin",
    category: "neurochemical",
    title: "Relatable Empathy over Hero Arrogance",
    mentalShortcut: "Vulnerability in ordinary struggles builds emotional closeness.",
    coreRule: "Share relatable creator moments: getting rejected, feeling overwhelmed by tools, making a coding bug, feeling impostor syndrome.",
    actionableExample: "Speak as a fellow builder in the arena, not an untouchable guru. Authentic vulnerability builds loyal community.",
    modernEvaluation: "Audience trust beats aggressive persuasion in the modern creator economy.",
  },
  {
    id: "cognitive-load-devil-cocktail",
    category: "production",
    title: "Reduce Cognitive Resistance (Clarity over Chaos)",
    mentalShortcut: "Clear audio + Simple visual hierarchy + Short sections + Calm pacing.",
    coreRule: "Viewers watch while multitasking or mentally tired. Cut unnecessary noise, chaotic memes, and overloaded slides.",
    actionableExample: "Direct explanations, clear on-screen code text, and crisp microphone audio matter more than expensive 4K camera gear.",
    modernEvaluation: "High-energy works only when intentional. Prioritize audio clarity and topic comprehension.",
  },
  {
    id: "creator-production-rules",
    category: "production",
    title: "Start Messy & Prioritize Audio over Camera",
    mentalShortcut: "Phone camera + Natural window light + Eye-level framing + Great audio.",
    coreRule: "Don't hide behind gear perfectionism. Master storytelling, composition, and clean sound first before buying complex setups.",
    actionableExample: "Avoid lengthy logos, generic intros, and 30-second outro plugs. End with a concise bridge to a genuinely relevant next video.",
    modernEvaluation: "Overcomes creator inertia. The best video is the one that gets produced and published.",
  },
];
