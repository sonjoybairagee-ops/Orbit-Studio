/**
 * Client-side Developer Tools Utilities
 * 100% in-browser processing: private, fast, and zero server upload.
 */

// 1. JSON Formatter & Validator
export interface JsonValidationResult {
  isValid: boolean;
  formatted?: string;
  minified?: string;
  error?: string;
  byteSize?: number;
}

export function processJson(input: string, indent = 2): JsonValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: true, formatted: "", minified: "" };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const formatted = JSON.stringify(parsed, null, indent);
    const minified = JSON.stringify(parsed);
    return {
      isValid: true,
      formatted,
      minified,
      byteSize: new Blob([formatted]).size,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || "Invalid JSON syntax",
    };
  }
}

// 2. JSON to CSV Converter
export function jsonToCsv(jsonStr: string): { csv: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr.trim());
    const array = Array.isArray(data) ? data : [data];

    if (array.length === 0) return { csv: "" };

    // Extract all unique keys from all objects
    const headersSet = new Set<string>();
    array.forEach((row) => {
      if (typeof row === "object" && row !== null) {
        Object.keys(row).forEach((k) => headersSet.add(k));
      }
    });

    const headers = Array.from(headersSet);
    if (headers.length === 0) return { csv: "" };

    const csvRows: string[] = [];
    // Header row
    csvRows.push(headers.map((h) => escapeCsvValue(h)).join(","));

    // Data rows
    array.forEach((row) => {
      const values = headers.map((header) => {
        const val = row && typeof row === "object" ? row[header] : "";
        if (val === undefined || val === null) return '""';
        if (typeof val === "object") return escapeCsvValue(JSON.stringify(val));
        return escapeCsvValue(String(val));
      });
      csvRows.push(values.join(","));
    });

    return { csv: csvRows.join("\n") };
  } catch (err: any) {
    return { csv: "", error: err?.message || "Failed to convert JSON to CSV." };
  }
}

function escapeCsvValue(val: string): string {
  const needsQuotes = val.includes(",") || val.includes('"') || val.includes("\n");
  if (needsQuotes) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`;
}

// 3. HTML Entity Encoder/Decoder
export function encodeHtmlEntities(str: string): string {
  return str.replace(/[<>&"'\u00A0-\u9999]/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function decodeHtmlEntities(str: string): string {
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<!doctype html><body>${str}`, "text/html");
  return dom.body.textContent || "";
}

// 4. URL Encoder/Decoder
export function encodeUrl(str: string, componentMode = true): string {
  return componentMode ? encodeURIComponent(str) : encodeURI(str);
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return decodeURI(str);
  }
}

// 5. Base64 Encoder/Decoder with UTF-8 support
export function encodeBase64(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(b64: string): string {
  const binary = atob(b64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

// 6. Regex Tester
export interface RegexMatchItem {
  index: number;
  fullMatch: string;
  groups: string[];
}

export function testRegex(
  pattern: string,
  flags: string,
  testStr: string
): { isValid: boolean; matches: RegexMatchItem[]; error?: string } {
  if (!pattern) return { isValid: true, matches: [] };

  try {
    const rx = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const matches: RegexMatchItem[] = [];
    let match: RegExpExecArray | null;

    let iterations = 0;
    while ((match = rx.exec(testStr)) !== null && iterations < 500) {
      matches.push({
        index: match.index,
        fullMatch: match[0],
        groups: match.slice(1),
      });
      if (match[0].length === 0) rx.lastIndex++;
      iterations++;
    }

    return { isValid: true, matches };
  } catch (err: any) {
    return { isValid: false, matches: [], error: err?.message };
  }
}

// 7. XML Formatter & Minifier
export function formatXml(xmlStr: string, indent = "  "): { formatted: string; minified: string; error?: string } {
  const trimmed = xmlStr.trim();
  if (!trimmed) return { formatted: "", minified: "" };

  try {
    let formatted = "";
    let pad = 0;

    // Normalize spacing between tags
    const normalized = trimmed.replace(/>\s*</g, "><");
    const nodes = normalized.split(/(<[^>]+>)/g).filter((n) => n.trim().length > 0);

    nodes.forEach((node) => {
      if (node.startsWith("</")) {
        // Closing tag
        pad = Math.max(0, pad - 1);
        formatted += indent.repeat(pad) + node + "\n";
      } else if (node.startsWith("<") && !node.endsWith("/>") && !node.startsWith("<?") && !node.startsWith("<!")) {
        // Opening tag
        formatted += indent.repeat(pad) + node + "\n";
        pad++;
      } else if (node.startsWith("<")) {
        // Self-closing or declaration
        formatted += indent.repeat(pad) + node + "\n";
      } else {
        // Text node
        formatted += indent.repeat(pad) + node.trim() + "\n";
      }
    });

    const minified = trimmed
      .replace(/>\s*</g, "><")
      .replace(/\s+/g, " ")
      .trim();

    return { formatted: formatted.trim(), minified };
  } catch (err: any) {
    return { formatted: "", minified: "", error: err?.message || "Invalid XML format." };
  }
}

// 8. CSS Minifier
export function minifyCss(css: string): { minified: string; originalSize: number; minifiedSize: number; savedPercentage: number } {
  const originalSize = new Blob([css]).size;

  let min = css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove whitespace around selectors & braces
    .replace(/\s*([\{\}:;,>~+])\s*/g, "$1")
    // Remove trailing semicolons before closing brace
    .replace(/;}/g, "}")
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    .trim();

  const minifiedSize = new Blob([min]).size;
  const savedPercentage = originalSize > 0 ? Math.max(0, Math.round(((originalSize - minifiedSize) / originalSize) * 100)) : 0;

  return {
    minified: min,
    originalSize,
    minifiedSize,
    savedPercentage,
  };
}
