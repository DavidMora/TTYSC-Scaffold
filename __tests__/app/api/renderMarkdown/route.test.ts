// Mock Next.js server exports to avoid depending on global Request/Response
jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      ({
        status: init?.status ?? 200,
        json: async () => body,
      } as unknown as Response),
  },
}));

// Mock renderer to avoid pulling in marked/jsdom in this unit test
jest.mock("@/lib/utils/markdown", () => ({
  renderMarkdownToSafeHtml: jest.fn(async (md: string) => `<p>${md}</p>`),
}));

import { POST } from "@/app/api/renderMarkdown/route";
import { renderMarkdownToSafeHtml } from "@/lib/utils/markdown";
import type { NextRequest } from "next/server";

describe("/api/renderMarkdown POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns sanitized html for valid markdown", async () => {
    const body = { markdown: "Hello" };
    const req = { json: async () => body } as unknown as NextRequest;

    const res = await POST(req);
    const json = await (res as Response).json();

    expect(renderMarkdownToSafeHtml).toHaveBeenCalledWith("Hello");
    expect(json).toEqual({ html: "<p>Hello</p>" });
  });

  it("handles invalid request with 400", async () => {
    const badReq = {
      json: async () => {
        throw new Error("bad");
      },
    } as unknown as NextRequest;
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it("treats non-string markdown as empty string", async () => {
    const body = { markdown: 123 };
    const req = { json: async () => body } as unknown as NextRequest;

    const res = await POST(req);
    const json = await (res as Response).json();

    expect(renderMarkdownToSafeHtml).toHaveBeenCalledWith("");
    expect(json).toEqual({ html: "<p></p>" });
  });
});
