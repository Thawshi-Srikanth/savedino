"use client";

import React from "react";

interface ChatMessageContentProps {
  content: string;
  isCustomer?: boolean;
}

/**
 * Validates and sanitizes a URL to ensure safe protocols.
 */
function sanitizeUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // If not a full URL, try prepending https:// if it looks like a domain
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      return `https://${trimmed}`;
    }
  }
  return null;
}

/**
 * Normalizes backslash-escaped characters that come from backend/AI/bot/PostHog systems
 * (e.g. "\ Hello\!", "\*\*bold\*\*", "\.", "\-", "\[link\]\(url\)") while preserving code blocks.
 */
function preprocessMarkdown(text: string): string {
  if (!text) return "";

  // 1. Protect code blocks and inline code from unescaping
  const codeSnippets: string[] = [];
  let cleanText = text.replace(/```[\s\S]*?```|`[^`]+`/g, (match) => {
    codeSnippets.push(match);
    return `___CODE_SLOT_${codeSnippets.length - 1}___`;
  });

  // 2. Unescape common markdown & punctuation backslash escapes:
  // e.g. \*, \_, \~, \!, \., \-, \+, \=, \#, \[, \], \(, \), \{, \}, \>, \<, \|, \ , \:, \", \'
  cleanText = cleanText.replace(/\\([*~_!.\-+=\#\[\](){}<>| :"',`\\])/g, "$1");

  // 3. Remove stray leading backslashes at start of line or before whitespace (e.g. "\ Hello")
  cleanText = cleanText.replace(/^\\([A-Za-z0-9])/gm, "$1").replace(/(^|\s)\\\s+/g, "$1 ");

  // 4. Restore preserved code blocks
  cleanText = cleanText.replace(
    /___CODE_SLOT_(\d+)___/g,
    (_, idx) => codeSnippets[Number(idx)] || ""
  );

  return cleanText;
}

/**
 * Renders inline markdown: bold, italic, bold-italic, inline-code, strikethrough, markdown links, and bare URLs.
 */
function renderInlineContent(
  text: string,
  isCustomer: boolean,
  keyPrefix = "inline"
): React.ReactNode[] {
  if (!text) return [];

  // Regex to match inline patterns:
  // 1: `code`
  // 2-4: [text](url) -> match[2] full, match[3] text, match[4] url
  // 5: https://... or http://...
  // 6: ***bold italic***
  // 7: ___bold italic___
  // 8: **bold**
  // 9: __bold__
  // 10: *italic*
  // 11: _italic_
  // 12: ~~strikethrough~~
  const INLINE_REGEX =
    /(`[^`]+`)|(\[([^\]]+)\]\(([^)]+)\))|((?:https?:\/\/)[^\s<]+[^<.,:;"')\]\s])|(\*\*\*[^*]+\*\*\*)|(___[^_]+___)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(_[^_]+_)|(~~[^~]+~~)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let counter = 0;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const key = `${keyPrefix}-${counter++}`;

    if (fullMatch.startsWith("`") && fullMatch.endsWith("`")) {
      const code = fullMatch.slice(1, -1);
      elements.push(
        <code
          key={key}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono break-all ${
            isCustomer
              ? "bg-white/20 text-white font-medium"
              : "bg-muted/80 text-foreground border border-border/50 font-medium"
          }`}
        >
          {code}
        </code>
      );
    } else if (match[2] && match[3] && match[4]) {
      // Markdown link [text](url)
      const linkText = match[3];
      const linkUrl = sanitizeUrl(match[4]);
      if (linkUrl) {
        elements.push(
          <a
            key={key}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`break-all underline underline-offset-2 transition-opacity inline-flex items-baseline font-medium cursor-pointer ${
              isCustomer
                ? "text-white hover:opacity-90 font-semibold"
                : "text-primary hover:text-primary/80 font-semibold"
            }`}
          >
            {renderInlineContent(linkText, isCustomer, `${key}-nested`)}
          </a>
        );
      } else {
        elements.push(linkText);
      }
    } else if (match[5]) {
      // Bare URL
      const rawUrl = match[5];
      const safeUrl = sanitizeUrl(rawUrl);
      if (safeUrl) {
        elements.push(
          <a
            key={key}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`break-all underline underline-offset-2 transition-opacity inline-flex items-baseline font-medium cursor-pointer ${
              isCustomer
                ? "text-white hover:opacity-90 font-semibold"
                : "text-primary hover:text-primary/80 font-semibold"
            }`}
          >
            {rawUrl}
          </a>
        );
      } else {
        elements.push(rawUrl);
      }
    } else if (
      (fullMatch.startsWith("***") && fullMatch.endsWith("***")) ||
      (fullMatch.startsWith("___") && fullMatch.endsWith("___"))
    ) {
      const boldItalicText = fullMatch.slice(3, -3);
      elements.push(
        <strong key={key} className="font-bold italic">
          {renderInlineContent(boldItalicText, isCustomer, `${key}-bi`)}
        </strong>
      );
    } else if (
      (fullMatch.startsWith("**") && fullMatch.endsWith("**")) ||
      (fullMatch.startsWith("__") && fullMatch.endsWith("__"))
    ) {
      const boldText = fullMatch.slice(2, -2);
      elements.push(
        <strong key={key} className="font-semibold tracking-tight">
          {renderInlineContent(boldText, isCustomer, `${key}-b`)}
        </strong>
      );
    } else if (
      (fullMatch.startsWith("*") && fullMatch.endsWith("*")) ||
      (fullMatch.startsWith("_") && fullMatch.endsWith("_"))
    ) {
      const italicText = fullMatch.slice(1, -1);
      elements.push(
        <em key={key} className="italic">
          {renderInlineContent(italicText, isCustomer, `${key}-i`)}
        </em>
      );
    } else if (fullMatch.startsWith("~~") && fullMatch.endsWith("~~")) {
      const strikeText = fullMatch.slice(2, -2);
      elements.push(
        <del key={key} className="line-through opacity-80">
          {renderInlineContent(strikeText, isCustomer, `${key}-s`)}
        </del>
      );
    } else {
      elements.push(fullMatch);
    }

    lastIndex = INLINE_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

export function ChatMessageContent({ content, isCustomer = false }: ChatMessageContentProps) {
  if (!content) return null;

  const normalizedContent = preprocessMarkdown(content);

  // Split content by code blocks first
  const blocks: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let blockCounter = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(normalizedContent)) !== null) {
    if (match.index > lastIndex) {
      const textSection = normalizedContent.slice(lastIndex, match.index);
      blocks.push(...renderTextBlocks(textSection, isCustomer, `section-${blockCounter++}`));
    }

    const language = match[1];
    const code = match[2];
    blocks.push(
      <div
        key={`codeblock-${blockCounter++}`}
        className={`my-2 rounded-lg border text-[11px] font-mono overflow-x-auto max-w-full ${
          isCustomer
            ? "bg-black/30 border-white/20 text-white"
            : "bg-muted/70 border-border/70 text-foreground"
        }`}
      >
        {language && (
          <div
            className={`px-2.5 py-1 text-[10px] font-semibold border-b uppercase tracking-wider ${
              isCustomer
                ? "bg-black/20 border-white/10 text-white/70"
                : "bg-muted border-border/40 text-muted-foreground"
            }`}
          >
            {language}
          </div>
        )}
        <pre className="p-2.5 leading-relaxed overflow-x-auto whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < normalizedContent.length) {
    const remainingText = normalizedContent.slice(lastIndex);
    blocks.push(...renderTextBlocks(remainingText, isCustomer, `section-${blockCounter++}`));
  }

  return <div className="space-y-1.5 break-words [overflow-wrap:anywhere]">{blocks}</div>;
}

/**
 * Parses non-code text sections into paragraphs, lists, and headings.
 */
function renderTextBlocks(text: string, isCustomer: boolean, keyPrefix: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let lineIdx = 0;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    const listKey = `${keyPrefix}-list-${lineIdx}`;
    nodes.push(
      <ListTag
        key={listKey}
        className={`my-1 pl-5 space-y-1 ${
          currentList.type === "ul" ? "list-disc" : "list-decimal"
        }`}
      >
        {currentList.items.map((item, idx) => (
          <li key={`${listKey}-item-${idx}`} className="leading-relaxed">
            {renderInlineContent(item, isCustomer, `${listKey}-li-${idx}`)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // Check for empty line
    if (!trimmed) {
      flushList();
      lineIdx++;
      continue;
    }

    // Check unordered list item (*, -, •)
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      lineIdx++;
      continue;
    }

    // Check ordered list item (1. , 2. )
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[1]);
      lineIdx++;
      continue;
    }

    // Flush any ongoing list before regular lines
    flushList();

    // Headings (###, ##, #)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2];
      nodes.push(
        <div
          key={`${keyPrefix}-h-${lineIdx}`}
          className={`font-semibold tracking-tight my-1 ${
            headingLevel <= 2 ? "text-xs font-bold" : "text-[11.5px]"
          }`}
        >
          {renderInlineContent(headingText, isCustomer, `${keyPrefix}-h-content-${lineIdx}`)}
        </div>
      );
      lineIdx++;
      continue;
    }

    // Regular line / paragraph
    nodes.push(
      <p key={`${keyPrefix}-p-${lineIdx}`} className="leading-relaxed m-0">
        {renderInlineContent(line, isCustomer, `${keyPrefix}-p-content-${lineIdx}`)}
      </p>
    );

    lineIdx++;
  }

  flushList();
  return nodes;
}
