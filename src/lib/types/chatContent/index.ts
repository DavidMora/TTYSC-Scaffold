export type ParsedContentItemType = "text" | "code" | "table" | "chart";

export interface ParsedContentItem {
  type: ParsedContentItemType;
  content?: string;
  language?: string;
  index: number;
  matchLength?: number;
  chartId?: string;
}
