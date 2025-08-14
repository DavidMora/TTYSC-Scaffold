import React, { useEffect, useRef, useState } from "react";
import { Button } from "@ui5/webcomponents-react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "javascript",
  showLineNumbers = true,
}: Readonly<CodeBlockProps>) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getLineNumbers = () => {
    const lines = code.endsWith("\n")
      ? code.split("\n").concat("")
      : code.split("\n");
    return lines.map((_, index) => (
      <span
        key={`${code}-${index}`}
        style={{
          display: "block",
          color: "#717680",
          fontSize: "var(--sapFontSmallSize)",
          textAlign: "right",
          paddingRight: "1rem",
          userSelect: "none",
          minWidth: "3rem",
          fontWeight: "700",
        }}
      >
        {index + 1}
      </span>
    ));
  };

  return (
    <div
      style={{
        border: "1px solid var(--sapList_BorderColor)",
        borderRadius: "0.5rem",
        maxHeight: "500px",
        backgroundColor: "var(--sapList_Background)",
        margin: "1rem 0",
        position: "relative",
        overflow: "auto",
      }}
    >
      {/* Copy Button */}
      <div
        style={{
          position: "sticky",
          top: "5px",
          right: "5px",
          zIndex: 1,
          width: "100%",
          height: "0px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleCopy}
          style={{
            fontSize: "var(--sapFontSmallSize)",
          }}
          design="Transparent"
          icon={copied ? "accept" : "copy"}
        >
          {copied ? "Copied!" : "Copy Code"}
        </Button>
      </div>

      {/* Code Container */}
      <div
        style={{
          display: "flex",
          position: "relative",
        }}
      >
        {showLineNumbers && (
          <div
            style={{
              backgroundColor: "#FAFAFA",
              borderRight: "1px solid #E9EAEB",
              padding: "1rem 0",
              fontFamily: "monospace",
              lineHeight: "1.5",
            }}
          >
            {getLineNumbers()}
          </div>
        )}

        <pre
          style={{
            margin: 0,
            padding: "1rem",
            overflow: "auto",
            flex: 1,
            backgroundColor: "var(--sapList_Background)",
            fontFamily: "monospace",
            fontSize: "var(--sapFontSmallSize)",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <code
            ref={codeRef}
            className={`language-${language}`}
            style={{
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
            }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
