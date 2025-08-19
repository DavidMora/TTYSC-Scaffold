'use client';

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function escapeMarkdownCell(value: unknown): string {
  const raw = toStringValue(value);
  return raw.replace(/\|/g, '\\|').replace(/\n/g, '<br/>');
}

export function recordsToMarkdownTable(
  records: Array<Record<string, unknown>>,
  preferredHeaderOrder?: string[]
): string {
  const rows = Array.isArray(records) ? records : [];
  const headerSet = new Set<string>();
  for (const row of rows) {
    Object.keys(row || {}).forEach((k) => headerSet.add(k));
  }

  const preferred = (preferredHeaderOrder || []).filter((h) =>
    headerSet.has(h)
  );
  const remaining = Array.from(headerSet)
    .filter((h) => !preferred.includes(h))
    .sort((a, b) => a.localeCompare(b));
  const headers =
    preferred.length > 0 ? [...preferred, ...remaining] : [...remaining];

  if (headers.length === 0) return '| |\n|---|';

  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `|${headers.map(() => '---').join('|')}|`;
  const bodyLines = rows.map((row) => {
    return `| ${headers.map((h) => escapeMarkdownCell((row || {})[h])).join(' | ')} |`;
  });

  return [headerLine, separatorLine, ...bodyLines].join('\n');
}
