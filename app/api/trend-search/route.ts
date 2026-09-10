import { NextResponse } from "next/server";
import { TrendSource, TrendValidationResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query, topic = "news", searchDepth = "advanced" } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const tavilyApiKey = process.env.TAVILY_API_KEY;

    // If no Tavily key or offline mode, return synthetic heuristic validation
    if (!tavilyApiKey) {
      const fallback = generateSyntheticTrendValidation(trimmedQuery);
      return NextResponse.json({ success: true, data: fallback });
    }

    // Call Tavily Search API
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: trimmedQuery,
        topic: topic === "news" ? "news" : "general",
        search_depth: searchDepth === "basic" ? "basic" : "advanced",
        max_results: 6,
        include_answer: true,
      }),
    });

    if (!tavilyResponse.ok) {
      console.warn(`Tavily API responded with status ${tavilyResponse.status}, falling back`);
      const fallback = generateSyntheticTrendValidation(trimmedQuery);
      return NextResponse.json({ success: true, data: fallback });
    }

    const tavilyData = await tavilyResponse.json();

    const results: any[] = tavilyData.results || [];
    const answer: string = tavilyData.answer || "";
    const responseTime: number = tavilyData.response_time || 0;

    // Clean sources
    const sources: TrendSource[] = results.map((r: any) => ({
      title: r.title || "Untitled Article",
      url: r.url || "#",
      snippet: r.content ? r.content.slice(0, 240) + "..." : "",
      publishedDate: r.published_date || undefined,
      score: typeof r.score === "number" ? Math.round(r.score * 100) / 100 : undefined,
    }));

    // Saturation & Opportunity Analysis
    const {
      saturationLevel,
      saturationScore,
      saturationRationale,
      opportunityVerdict,
      recommendedAngle,
      newsHooks,
    } = analyzeTrendAndMarket(trimmedQuery, answer, results);

    const validationResult: TrendValidationResult = {
      query: trimmedQuery,
      answer: answer || `Search completed for "${trimmedQuery}". Analyzed ${results.length} recent sources across top media publications.`,
      saturationLevel,
      saturationScore,
      saturationRationale,
      opportunityVerdict,
      recommendedAngle,
      newsHooks,
      sources,
      responseTime,
    };

    return NextResponse.json({ success: true, data: validationResult });
  } catch (error: any) {
    console.error("Error in /api/trend-search:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute trend search",
      },
      { status: 500 }
    );
  }
}

/**
 * Evaluates market saturation and generates timely hooks and differentiation angles
 */
function analyzeTrendAndMarket(
  query: string,
  answer: string,
  results: any[]
): {
  saturationLevel: "Low" | "Moderate" | "High";
  saturationScore: number;
  saturationRationale: string;
  opportunityVerdict: string;
  recommendedAngle: string;
  newsHooks: string[];
} {
  const resultCount = results.length;
  const avgScore =
    results.length > 0
      ? results.reduce((acc, r) => acc + (r.score || 0.8), 0) / results.length
      : 0.5;

  // Calculate saturation index (0 to 100)
  // Higher score if many top domains already have dedicated articles with high relevance
  let baseScore = Math.min(95, Math.round(avgScore * 85 + (resultCount >= 5 ? 10 : 0)));

  // If query is broad (1-2 words), saturation is naturally higher
  const wordCount = query.split(/\s+/).length;
  if (wordCount <= 2) {
    baseScore = Math.min(95, baseScore + 10);
  } else if (wordCount >= 6) {
    baseScore = Math.max(25, baseScore - 15);
  }

  let saturationLevel: "Low" | "Moderate" | "High" = "Moderate";
  let saturationRationale = "";
  let opportunityVerdict = "";
  let recommendedAngle = "";

  if (baseScore >= 70) {
    saturationLevel = "High";
    saturationRationale = `High market saturation detected (${baseScore}% density). Major tech outlets and creators already have prominent coverage on this exact topic.`;
    opportunityVerdict = "Crowded space. Avoid broad 'introductory' tutorials. You must win on a contrarian thesis, exposing hidden downsides, or sharing verified personal benchmarks.";
    recommendedAngle = `Contrarian Deep Dive: "Why Everyone Is Wrong About ${query}" or a 30-day real-world stress test.`;
  } else if (baseScore >= 40) {
    saturationLevel = "Moderate";
    saturationRationale = `Moderate saturation (${baseScore}% density). Steady search demand exists with established guides, but significant gaps remain for up-to-date, step-by-step breakdowns.`;
    opportunityVerdict = "Healthy demand zone. High audience interest with room for superior production, clearer mental models, and practical templates.";
    recommendedAngle = `Actionable Blueprint: Pair theoretical concepts with an open-source starter repo or reproducible template.`;
  } else {
    saturationLevel = "Low";
    saturationRationale = `Low market saturation (${baseScore}% density). Emerging topic or underserved keyword angle with minimal high-authority competition.`;
    opportunityVerdict = "Prime opportunity gap! First-mover advantage allows you to define search rankings and become the canonical YouTube reference.";
    recommendedAngle = `Definitive Explainer: Establish the baseline mental model and answer the first 5 questions viewers are asking.`;
  }

  // Derive 2-3 Timely News Hooks from actual search results or answer
  const newsHooks: string[] = [];

  if (results.length > 0) {
    const topResult = results[0];
    const topTitle = topResult.title ? topResult.title.replace(/\|.*$/, "").trim() : "";
    newsHooks.push(
      `"A major shift just happened: ${topTitle || query}. Here is the exact playbook you need to know."`
    );
  }

  if (results.length > 1) {
    const secondResult = results[1];
    newsHooks.push(
      `"Everyone is talking about ${query}, but 95% of people are overlooking this one critical catch."`
    );
  }

  if (answer && answer.length > 30) {
    const firstSentence = answer.split(".")[0].trim();
    newsHooks.push(
      `"Recent reports revealed: ${firstSentence}. Here is what nobody is telling you about the real impact."`
    );
  } else {
    newsHooks.push(
      `"I tested ${query} so you don't have to make the same expensive mistakes. Here are the unvarnished results."`
    );
  }

  return {
    saturationLevel,
    saturationScore: baseScore,
    saturationRationale,
    opportunityVerdict,
    recommendedAngle,
    newsHooks: newsHooks.slice(0, 3),
  };
}

/**
 * Synthetic fallback generator when offline or no API key is provided
 */
function generateSyntheticTrendValidation(query: string): TrendValidationResult {
  const cleanWords = query.trim().split(" ");
  const shortTitle = cleanWords.slice(0, 4).join(" ");

  return {
    query,
    answer: `Simulated validation for "${query}". The topic demonstrates active interest across developer and creator communities with rising interest in workflow automation and pragmatic case studies.`,
    saturationLevel: "Moderate",
    saturationScore: 54,
    saturationRationale: `Moderate saturation (54% density). Standard tutorials cover the basics, but there is an open demand for deep architectural lessons and realistic edge cases.`,
    opportunityVerdict: `Healthy demand zone. High audience interest with room for superior production, clearer mental models, and practical templates.`,
    recommendedAngle: `Actionable Breakdown: Combine hands-on implementation with a clear checklist of what failed first.`,
    newsHooks: [
      `"Everyone is talking about ${shortTitle}, but 90% of implementations are missing this single piece."`,
      `"The industry just shifted how they approach ${shortTitle}—here is the new playbook for 2026."`,
      `"I spent 30 days analyzing ${shortTitle}. Here is the unfiltered truth they won't tell you in tutorials."`,
    ],
    sources: [
      {
        title: `${shortTitle}: Comprehensive Guide & Benchmarks 2026`,
        url: "https://example.com/trends/guide",
        snippet: `In-depth analysis of emerging patterns, practical adoption rates, and real-world performance considerations for modern creators and engineers.`,
        publishedDate: "Recent",
        score: 0.88,
      },
      {
        title: `Why Traditional Approaches to ${shortTitle} Are Breaking Down`,
        url: "https://example.com/trends/breakdown",
        snippet: `An examination of common bottlenecks, production hurdles, and why leading teams are moving toward streamlined architectural patterns.`,
        publishedDate: "Recent",
        score: 0.82,
      },
    ],
    responseTime: 0.05,
  };
}
