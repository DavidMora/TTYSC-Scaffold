import { renderMarkdownToSafeHtml } from "@/lib/utils/markdown";

describe("Markdown sanitization", () => {
  it("removes <script> tags", async () => {
    const md = "Hello<script>alert(1)</script>World";
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toContain("<script>");
    expect(html).toContain("Hello");
    expect(html).toContain("World");
  });

  it("removes on* attributes", async () => {
    const md = '<img src="data:image/png;base64,i" onerror="alert(1)" />';
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).not.toMatch(/on\w+=/i);
  });

  it("blocks javascript: URLs", async () => {
    const md = "[x](javascript:alert(1))";
    const html = await renderMarkdownToSafeHtml(md);
    // The anchor should lose href or be removed; ensure javascript: does not appear
    expect(html).not.toMatch(/javascript:/i);
  });

  it("adds target and rel to anchor tags", async () => {
    const md = "[example](https://example.com)";
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toMatch(/<a[^>]*target="_blank"/);
    expect(html).toMatch(/<a[^>]*rel="[^"]*noopener[^"]*noreferrer[^"]*nofollow[^"]*"/);
  });

  it("snapshot: tables and code blocks", async () => {
    const md = `
| h1 | h2 |
|----|----|
| a  | b  |

\`\`\`ts
const x: number = 1;
console.log(x);
\`\`\`
`;
    const html = await renderMarkdownToSafeHtml(md);
    expect(html).toMatchSnapshot();
  });

  it("blocks known tricky payloads", async () => {
    const payloads: string[] = [
      // outerHTML fragments with event handlers
      '<div onclick="alert(1)">Click</div>',
      '<img src="x" onerror="alert(1)">',
      // javascript: and mixed case variants
      '<a href="javascript:alert(1)">link</a>',
      '<a href="JaVaScRiPt:alert(1)">link</a>',
      // vbscript: (legacy)
      '<a href="vbscript:msgbox(1)">vb</a>',
      // malformed tags trying to smuggle script
      "<scr<script>ipt>alert(1)</scr</script>ipt>",
      // data:text payloads should not pass through
      "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
      // svg payloads (disallowed in URI allowlist)
      "![x](data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+)",
    ];

    for (const md of payloads) {
      const html = await renderMarkdownToSafeHtml(md);
      expect(html).not.toMatch(/<script/i);
      expect(html).not.toMatch(/\son\w+\s*=\s*/i);
      expect(html).not.toMatch(/javascript:/i);
      expect(html).not.toMatch(/vbscript:/i);
      expect(html).not.toMatch(/data:text\/html/i);
      expect(html).not.toMatch(/data:image\/svg\+xml/i);
    }
  });
});
