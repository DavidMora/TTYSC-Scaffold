import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { marked } from "marked";
import { SANITIZER_CONFIG } from "@/lib/utils/sanitizer.config";

// Configure Marked for GFM (no server-side syntax highlighting)
marked.setOptions({ gfm: true });

// Singleton JSDOM/DOMPurify for performance
type SharedWindow = Window & typeof globalThis;
let sharedWindow: SharedWindow | null = null;
let DOMPurifyInstance: ReturnType<typeof createDOMPurify> | null = null;

type SanitizerAttributeHookEvent = {
  attrName?: string;
  keepAttr?: boolean;
  forceRemove?: boolean;
};

// Branded type to indicate content has been sanitized.
// This helps ensure only sanitized HTML flows into rendering sinks.
export type SafeHtml = string & { __brand: "SafeHtml" };

function getDOMPurify(): ReturnType<typeof createDOMPurify> {
  if (!sharedWindow) {
    const dom = new JSDOM(
      "<!DOCTYPE html><html><head></head><body></body></html>"
    );
    sharedWindow = dom.window as unknown as SharedWindow;
  }
  if (!DOMPurifyInstance) {
    const purifier = createDOMPurify(sharedWindow as unknown as SharedWindow);
    // Configure once
    purifier.setConfig({
      ALLOWED_TAGS: SANITIZER_CONFIG.ALLOWED_TAGS,
      ALLOWED_ATTR: SANITIZER_CONFIG.ALLOWED_ATTR,
      FORBID_ATTR: SANITIZER_CONFIG.FORBID_ATTR,
      ALLOWED_URI_REGEXP: SANITIZER_CONFIG.ALLOWED_URI_REGEXP,
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_TEMPLATES: true,
      FORBID_TAGS: SANITIZER_CONFIG.FORBID_TAGS,
    } as unknown as Record<string, unknown>);

    // Forbid any event handlers
    purifier.addHook(
      "uponSanitizeAttribute",
      (_node: Element, data: SanitizerAttributeHookEvent) => {
        if (data.attrName && /^on/i.test(data.attrName)) {
          data.keepAttr = false;
          data.forceRemove = true;
        }
      }
    );

    // Enforce anchor target/rel
    purifier.addHook("afterSanitizeAttributes", (node: Element) => {
      if (node.tagName === "A" && node.getAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });

    DOMPurifyInstance = purifier;
  }
  return DOMPurifyInstance;
}

export async function renderMarkdownToSafeHtml(
  markdown: string
): Promise<SafeHtml> {
  const rawHtml = await marked.parse(markdown ?? "");
  const purifier = getDOMPurify();

  const sanitized = purifier.sanitize(rawHtml, { RETURN_TRUSTED_TYPE: false });
  return sanitized as SafeHtml;
}
