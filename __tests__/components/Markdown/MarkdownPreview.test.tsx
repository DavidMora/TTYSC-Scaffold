import React from "react";
import { render } from "@testing-library/react";
import MarkdownPreview from "@/components/Markdown/MarkdownPreview";
import type { SafeHtml } from "@/lib/utils/markdown";

describe("MarkdownPreview", () => {
  it("renders provided html via dangerouslySetInnerHTML and applies className", () => {
    const html = "<p>Hello <strong>World</strong></p>" as unknown as SafeHtml;
    const { container } = render(
      <MarkdownPreview className="preview" html={html} />
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("preview");
    expect(root.querySelector("p")).not.toBeNull();
    expect(root.querySelector("strong")?.textContent).toBe("World");
  });
});


