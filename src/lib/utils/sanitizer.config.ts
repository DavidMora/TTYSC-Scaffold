// Sanitizer configuration for DOMPurify
// - Allow a conservative set of tags/attributes suitable for Markdown output
// - Forbid any style attributes and event handlers (on*)
// - Restrict URIs to http(s), mailto, and data:image/*

export const ALLOWED_TAGS = [
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "kbd",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
  // Tables (GFM)
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

export const ALLOWED_ATTR = [
  // Global-ish
  "id",
  "title",
  "dir",
  "lang",
  "class",
  // Links
  "href",
  "name",
  "rel",
  // Images
  "src",
  "alt",
  "width",
  "height",
  // Accessibility
  "role",
  "tabindex",
  "aria-label",
  "aria-hidden",
  "aria-describedby",
  "aria-labelledby",
];

export const FORBID_TAGS = [
  "script",
  "style",
  "link",
  "meta",
  "base",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "svg",
  "math",
  "video",
  "audio",
  "source",
  "track",
];

export const FORBID_ATTR = ["style"];

// Accept only: http(s), mailto, data:image/* (excluding svg+xml)
// Disallow others including javascript:, vbscript:, data:text, etc.
// Remove svg+xml from data URI allowlist to reduce risk of embedded SVG script abuse in certain UAs
export const ALLOWED_URI_REGEXP =
  /^(?:(?:https?):\/\/|mailto:|data:image\/(?:png|jpe?g|gif|webp);base64,)[^\s]*$/i;

export type SanitizerConfig = {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
  FORBID_ATTR: string[];
  ALLOWED_URI_REGEXP: RegExp;
  FORBID_TAGS: string[];
};

export const SANITIZER_CONFIG: SanitizerConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  FORBID_ATTR,
  ALLOWED_URI_REGEXP,
  FORBID_TAGS,
};
