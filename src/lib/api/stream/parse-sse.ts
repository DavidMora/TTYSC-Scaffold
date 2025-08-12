import { HttpSSEEvent } from "@/lib/types/api/http-client";

/**
 * Parse a single SSE block (text up to but excluding the blank line separator) into an event object.
 * Supports multiple data: lines (joined with \n) and ignores comment lines starting with ':'.
 */
export function parseSSEBlock(block: string): HttpSSEEvent {
  const evt: HttpSSEEvent = { data: "" };
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue; // empty or comment line
    const idx = line.indexOf(":");
    if (idx === -1) continue; // malformed
    const field = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trimStart();
    switch (field) {
      case "data":
        evt.data += value + "\n";
        break;
      case "id":
        evt.id = value;
        break;
      case "event":
        evt.event = value;
        break;
      case "retry":
        evt.retry = Number(value);
        break;
    }
  }
  if (evt.data.endsWith("\n")) evt.data = evt.data.slice(0, -1);
  return evt;
}
