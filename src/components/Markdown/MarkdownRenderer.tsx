"use client";

import React, { useEffect, useState } from "react";
import MarkdownPreview from "@/components/Markdown/MarkdownPreview";
import type { SafeHtml } from "@/lib/utils/markdown";

type MarkdownRendererProps = Readonly<{
  markdown: string;
  className?: string;
  onError?: (error: Error) => void;
}>;

export default function MarkdownRenderer({
  markdown,
  className,
  onError,
}: MarkdownRendererProps) {
  const [html, setHtml] = useState<SafeHtml>("" as SafeHtml);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const res = await fetch("/api/renderMarkdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as { html: SafeHtml };
        if (isActive) setHtml(data.html);
      } catch (e: unknown) {
        onError?.(e as Error);
        if (isActive) setHtml("" as SafeHtml);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [markdown, onError]);

  return <MarkdownPreview className={className} html={html} />;
}
