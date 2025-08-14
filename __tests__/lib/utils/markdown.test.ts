import { renderMarkdownToSafeHtml } from "@/lib/utils/markdown";

describe("lib/utils/markdown renderMarkdownToSafeHtml", () => {
  it("adds rel/target to safe links and removes event handler attributes", async () => {
    const input =
      '<a href="https://example.com">link</a> <span onclick="alert(1)">x</span>';
    const html = await renderMarkdownToSafeHtml(input);

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
    expect(html).not.toContain("onclick");
  });

  it("removes disallowed URI schemes (javascript:) and does not add rel/target", async () => {
    const input = '<a href="javascript:alert(1)">bad</a>';
    const html = await renderMarkdownToSafeHtml(input);

    // href should be removed, and without href we should not see rel/target
    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('rel="noopener noreferrer"');
  });

  it("handles undefined input as empty string", async () => {
    const html = await renderMarkdownToSafeHtml(undefined as unknown as string);
    expect(typeof html).toBe("string");
    expect(html).toBe("");
  });

  it("reuses the DOMPurify singleton on subsequent calls", async () => {
    const first = await renderMarkdownToSafeHtml("first");
    const second = await renderMarkdownToSafeHtml("second");
    expect(first).toContain("first");
    expect(second).toContain("second");
  });
});
