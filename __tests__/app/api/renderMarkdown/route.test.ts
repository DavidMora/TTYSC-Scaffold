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
    const req = { 
      json: async () => body,
      headers: {
        get: jest.fn().mockReturnValue("application/json")
      }
    } as unknown as NextRequest;

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
      headers: {
        get: jest.fn().mockReturnValue("application/json")
      }
    } as unknown as NextRequest;
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it("rejects non-JSON content-type with 415", async () => {
    const req = {
      json: async () => ({ markdown: "Hello" }),
      headers: { get: jest.fn().mockReturnValue("text/plain") },
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(415);
  });

  it("limits payload size with 413", async () => {
          const big = "x".repeat(100_001);
    const req = {
      json: async () => ({ markdown: big }),
      headers: { get: jest.fn().mockReturnValue("application/json") },
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it("returns 500 when rendering fails", async () => {
    (renderMarkdownToSafeHtml as jest.Mock).mockRejectedValueOnce(new Error("boom"));
    const req = {
      json: async () => ({ markdown: "Hello" }),
      headers: { get: jest.fn().mockReturnValue("application/json") },
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("treats non-string markdown as empty string", async () => {
    const body = { markdown: 123 };
    const req = { 
      json: async () => body,
      headers: {
        get: jest.fn().mockReturnValue("application/json")
      }
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await (res as Response).json();

    expect(renderMarkdownToSafeHtml).toHaveBeenCalledWith("");
    expect(json).toEqual({ html: "<p></p>" });
  });
});
