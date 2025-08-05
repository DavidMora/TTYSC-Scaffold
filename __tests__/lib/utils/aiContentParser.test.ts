import { parseContent } from "@/lib/utils/aiContentParser";

describe("parseContent", () => {
  test("should parse code blocks with language", () => {
    const input =
      "Here is some text\n```javascript\nconsole.log('hello');\n```\nMore text";
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: "code",
      language: "javascript",
      content: "console.log('hello');\n",
      index: 18,
      matchLength: 39,
    });
  });

  test("should parse table markers", () => {
    const input = "Here is some text [SHOW_TABLE] and more text";
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: "table",
      index: 18,
      matchLength: 12,
    });
  });

  test("should handle very long content and truncate it", () => {
    const longText = "a".repeat(1000001);
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const result = parseContent(longText);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Content too long, truncating to prevent performance issues"
    );
    expect(result).toHaveLength(0);

    consoleSpy.mockRestore();
  });
});
