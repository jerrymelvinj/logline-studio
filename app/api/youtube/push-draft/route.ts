import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const { title, description, tags, scheduledTime, accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "Missing YouTube OAuth token" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Create a private placeholder draft on your channel
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title ? title.slice(0, 100) : "Untitled Draft",
          description: description || "Auto-generated draft from Logline Studio",
          tags: typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : tags,
          categoryId: "28", // Science & Technology
        },
        status: {
          privacyStatus: "private", // Always private initially for creator review
          publishAt: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: "", // Empty body to initiate metadata container
      },
    });

    return NextResponse.json({ success: true, videoId: response.data.id });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
