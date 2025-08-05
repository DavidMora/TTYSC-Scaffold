export interface ParsedContentItem {
  type: "text" | "code" | "table";
  content?: string;
  language?: string;
  index: number;
  matchLength?: number;
}

const showTableRegex = /\[SHOW_TABLE\]/gi;

export function parseContent(text: string): ParsedContentItem[] {
  const results: ParsedContentItem[] = [];

  const MAX_CONTENT_LENGTH = 1000000;
  if (text.length > MAX_CONTENT_LENGTH) {
    console.warn("Content too long, truncating to prevent performance issues");
    text = text.substring(0, MAX_CONTENT_LENGTH);
  }

  let currentIndex = 0;
  while (currentIndex < text.length) {
    const startIndex = text.indexOf("```", currentIndex);
    if (startIndex === -1) break;

    const endIndex = text.indexOf("```", startIndex + 3);
    if (endIndex === -1) break;

    const blockContent = text.substring(startIndex + 3, endIndex);
    const lines = blockContent.split("\n");

    let language = "";
    let codeContent = blockContent;

    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine && /^\w+$/.test(firstLine)) {
        language = firstLine;
        codeContent = lines.slice(1).join("\n");
      }
    }

    results.push({
      type: "code",
      language: language,
      content: codeContent,
      index: startIndex,
      matchLength: endIndex - startIndex + 3,
    });

    currentIndex = endIndex + 3;
  }

  let match;
  showTableRegex.lastIndex = 0;

  while ((match = showTableRegex.exec(text)) !== null) {
    if (match.index === showTableRegex.lastIndex) {
      showTableRegex.lastIndex++;
    }

    results.push({
      type: "table",
      index: match.index,
      matchLength: match[0].length,
    });
  }

  return results.sort((a, b) => a.index - b.index);
}
