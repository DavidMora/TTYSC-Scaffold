'use client';

import React from 'react';
import type { SafeHtml } from '@/lib/utils/markdown';

type MarkdownPreviewProps = Readonly<{
  html: SafeHtml;
  className?: string;
}>;

export default function MarkdownPreview({
  html,
  className,
}: MarkdownPreviewProps) {
  return (
    // `html` is sanitized via DOMPurify in renderMarkdownToSafeHtml and branded as SafeHtml
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
