import { ParsedContentItem } from '../types/chatContent';

const showTableRegex = /\[SHOW_TABLE\]/gi;
// Regex updated to capture optional UUID: [SHOW_CHART] or [SHOW_CHART:uuid]
const showChartRegex =
  /\[SHOW_CHART(?::([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}))?\]/gi;

function parseCodeBlock(
  text: string,
  startIndex: number
): ParsedContentItem | null {
  const endIndex = text.indexOf('```', startIndex + 3);
  if (endIndex === -1) return null;

  const blockContent = text.substring(startIndex + 3, endIndex);
  const lines = blockContent.split('\n');

  let language = '';
  let codeContent = blockContent;

  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine && /^\w+$/.test(firstLine)) {
      language = firstLine;
      codeContent = lines.slice(1).join('\n');
    }
  }

  return {
    type: 'code',
    language: language,
    content: codeContent,
    index: startIndex,
    matchLength: endIndex - startIndex + 3,
  };
}

function parseCodeBlocks(text: string): ParsedContentItem[] {
  const results: ParsedContentItem[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const startIndex = text.indexOf('```', currentIndex);
    if (startIndex === -1) break;

    const codeBlock = parseCodeBlock(text, startIndex);
    if (codeBlock) {
      results.push(codeBlock);
      currentIndex = codeBlock.index + (codeBlock.matchLength || 0);
    } else {
      currentIndex = startIndex + 3;
    }
  }

  return results;
}

function parseRegexMatches(text: string): ParsedContentItem[] {
  const results: ParsedContentItem[] = [];

  showTableRegex.lastIndex = 0;
  let match;
  while ((match = showTableRegex.exec(text)) !== null) {
    if (match.index === showTableRegex.lastIndex) {
      showTableRegex.lastIndex++;
    }

    results.push({
      type: 'table',
      index: match.index,
      matchLength: match[0].length,
    });
  }

  showChartRegex.lastIndex = 0;
  while ((match = showChartRegex.exec(text)) !== null) {
    if (match.index === showChartRegex.lastIndex) {
      showChartRegex.lastIndex++;
    }

    results.push({
      type: 'chart',
      index: match.index,
      matchLength: match[0].length,
      chartId: match[1],
    });
  }

  return results;
}

export function parseContent(text: string): ParsedContentItem[] {
  const MAX_CONTENT_LENGTH = 1000000;
  if (text.length > MAX_CONTENT_LENGTH) {
    console.warn('Content too long, truncating to prevent performance issues');
    text = text.substring(0, MAX_CONTENT_LENGTH);
  }

  const codeBlocks = parseCodeBlocks(text);
  const regexMatches = parseRegexMatches(text);

  return [...codeBlocks, ...regexMatches].sort((a, b) => a.index - b.index);
}
