import { NextRequest, NextResponse } from "next/server";
import { renderMarkdownToSafeHtml, type SafeHtml } from "@/lib/utils/markdown";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const markdown = typeof body?.markdown === "string" ? body.markdown : "";
    const html: SafeHtml = await renderMarkdownToSafeHtml(markdown);
    return NextResponse.json({ html }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
