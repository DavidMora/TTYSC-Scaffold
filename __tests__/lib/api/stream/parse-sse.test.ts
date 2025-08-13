import { parseSSEBlock } from "@/lib/api/stream/parse-sse";

describe("parseSSEBlock", () => {
  it("parses basic fields", () => {
    const evt = parseSSEBlock("id:1\nevent:message\ndata:hello");
    expect(evt).toEqual({ id: "1", event: "message", data: "hello" });
  });

  it("joins multiple data lines with newlines and trims final newline", () => {
    const evt = parseSSEBlock("data:line1\ndata:line2\n");
    expect(evt).toEqual({ data: "line1\nline2" });
  });

  it("skips comments and malformed lines", () => {
    const evt = parseSSEBlock(
      ":comment line\n:another\ninvalidLineWithoutColon\ndata:hi"
    );
    expect(evt).toEqual({ data: "hi" });
  });

  it("parses retry as number", () => {
    const evt = parseSSEBlock("retry:1500\ndata:test");
    expect(evt).toEqual({ retry: 1500, data: "test" });
  });

  it("ignores non-numeric retry values", () => {
    const evt = parseSSEBlock("retry:abc\ndata:test");
    expect(evt).toEqual({ data: "test" });
  });
});
