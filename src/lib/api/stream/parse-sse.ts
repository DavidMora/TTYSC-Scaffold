import { HttpSSEEvent } from '@/lib/types/api/http-client';

/**
 * Internal parser implementation. Wrapped in an object so tests can spy on a mutable property
 * (ESM named export live bindings are read-only and cannot be redefined by jest.spyOn).
 */
export function parseSSEBlock(block: string): HttpSSEEvent {
  const evt: HttpSSEEvent = { data: '' };
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue; // empty or comment line
    const idx = line.indexOf(':');
    if (idx === -1) continue; // malformed
    const field = line.slice(0, idx); // preserve exact field name per SSE spec
    const value = line.slice(idx + 1).trimStart();
    switch (field) {
      case 'data':
        evt.data += value + '\n';
        break;
      case 'id':
        evt.id = value;
        break;
      case 'event':
        evt.event = value;
        break;
      case 'retry': {
        if (/^\d+$/.test(value)) {
          evt.retry = Number(value);
        }
      }
    }
  }
  if (evt.data.endsWith('\n')) evt.data = evt.data.slice(0, -1);
  return evt;
}
