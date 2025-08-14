import { NextRequest, NextResponse } from "next/server";
import { renderMarkdownToSafeHtml, type SafeHtml } from "@/lib/utils/markdown";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }
  let body: unknown;
  try {
    body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const markdown =
      typeof (body as { markdown?: unknown })?.markdown === "string"
        ? ((body as { markdown: string }).markdown)
        : "";

    // Basic size guardrail
    const MAX_CHARS = 100_000;
    if (markdown.length > MAX_CHARS) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    try {
      const html: SafeHtml = await renderMarkdownToSafeHtml(markdown);
      return NextResponse.json({ html }, { status: 200 });
    } catch {
      // Rendering/sanitization failed — treat as server error
      return NextResponse.json({ error: "Failed to render markdown" }, { status: 500 });
    }
}
