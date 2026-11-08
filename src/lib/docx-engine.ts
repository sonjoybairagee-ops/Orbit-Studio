/**
 * CompX Orbit — Word (.docx) Engine
 * 100% Client-Side In-Browser OpenXML Parser & Serializer via JSZip
 *
 * Capabilities:
 * 1. Unpacks .docx ZIP files and parses word/document.xml into semantic HTML.
 * 2. Serializes formatted HTML content back into a valid OpenXML .docx ZIP archive.
 * 3. Exports to HTML, Markdown, and Plain Text.
 * 4. Provides rich sample documents for instant testing.
 */

import JSZip from "jszip";

export interface DocxParseResult {
  html: string;
  text: string;
  wordCount: number;
  characterCount: number;
  title?: string;
  filename?: string;
}

// XML entity escaping
function escapeXml(unsafe: string): string {
  return (unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* ────────────────────────────────────────────────────────────────────────────
   1. DOCX PARSER (word/document.xml -> HTML)
   ──────────────────────────────────────────────────────────────────────────── */

export async function parseDocxFile(file: File): Promise<DocxParseResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const documentXmlFile = loadedZip.file("word/document.xml");
  if (!documentXmlFile) {
    throw new Error("Invalid DOCX file: word/document.xml not found inside package.");
  }

  const xmlContent = await documentXmlFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

  // Check for XML parse errors
  const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    throw new Error("Failed to parse Word document XML structure.");
  }

  const body = xmlDoc.getElementsByTagName("w:body")[0];
  if (!body) {
    return {
      html: "<p></p>",
      text: "",
      wordCount: 0,
      characterCount: 0,
      title: file.name.replace(/\.[^/.]+$/, ""),
      filename: file.name,
    };
  }

  const htmlParts: string[] = [];
  const textParts: string[] = [];

  // Parse all top-level elements (paragraphs, tables)
  const children = Array.from(body.childNodes);
  for (const node of children) {
    if (node.nodeName === "w:p") {
      const { html, text } = parseParagraph(node as Element);
      if (html) htmlParts.push(html);
      if (text) textParts.push(text);
    } else if (node.nodeName === "w:tbl") {
      const { html, text } = parseTable(node as Element);
      if (html) htmlParts.push(html);
      if (text) textParts.push(text);
    }
  }

  const finalHtml = htmlParts.length > 0 ? htmlParts.join("\n") : "<p>Empty document</p>";
  const rawText = textParts.join("\n");
  const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;

  return {
    html: finalHtml,
    text: rawText,
    wordCount: words,
    characterCount: rawText.length,
    title: file.name.replace(/\.[^/.]+$/, ""),
    filename: file.name,
  };
}

function parseParagraph(pNode: Element): { html: string; text: string } {
  const pPr = pNode.getElementsByTagName("w:pPr")[0];
  let pStyle = "";
  let align = "";
  let isBullet = false;
  let isNumbered = false;

  if (pPr) {
    const styleEl = pPr.getElementsByTagName("w:pStyle")[0];
    if (styleEl) pStyle = styleEl.getAttribute("w:val") || "";

    const jcEl = pPr.getElementsByTagName("w:jc")[0];
    if (jcEl) {
      const val = jcEl.getAttribute("w:val");
      if (val === "center") align = "center";
      else if (val === "right") align = "right";
      else if (val === "both") align = "justify";
    }

    const numPr = pPr.getElementsByTagName("w:numPr")[0];
    if (numPr || pStyle.toLowerCase().includes("bullet")) {
      isBullet = true;
    } else if (pStyle.toLowerCase().includes("number")) {
      isNumbered = true;
    }
  }

  const runs = Array.from(pNode.getElementsByTagName("w:r"));
  const runHtmls: string[] = [];
  const runTexts: string[] = [];

  for (const r of runs) {
    const { html, text } = parseRun(r);
    if (html) runHtmls.push(html);
    if (text) runTexts.push(text);
  }

  const innerHtml = runHtmls.join("") || "&nbsp;";
  const innerText = runTexts.join("");

  const alignStyle = align ? ` style="text-align: ${align};"` : "";

  // Headings
  const styleLower = pStyle.toLowerCase();
  if (styleLower.includes("heading1") || styleLower === "title") {
    return { html: `<h1${alignStyle}>${innerHtml}</h1>`, text: innerText };
  } else if (styleLower.includes("heading2") || styleLower === "subtitle") {
    return { html: `<h2${alignStyle}>${innerHtml}</h2>`, text: innerText };
  } else if (styleLower.includes("heading3")) {
    return { html: `<h3${alignStyle}>${innerHtml}</h3>`, text: innerText };
  } else if (styleLower.includes("quote") || styleLower.includes("blockquote")) {
    return { html: `<blockquote${alignStyle}>${innerHtml}</blockquote>`, text: innerText };
  } else if (isBullet) {
    return { html: `<li${alignStyle}>${innerHtml}</li>`, text: `• ${innerText}` };
  } else if (isNumbered) {
    return { html: `<li${alignStyle}>${innerHtml}</li>`, text: `1. ${innerText}` };
  }

  return { html: `<p${alignStyle}>${innerHtml}</p>`, text: innerText };
}

function parseRun(rNode: Element): { html: string; text: string } {
  const rPr = rNode.getElementsByTagName("w:rPr")[0];
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isStrike = false;
  let color = "";
  let highlight = "";
  let fontSize = "";

  if (rPr) {
    isBold = rPr.getElementsByTagName("w:b").length > 0;
    isItalic = rPr.getElementsByTagName("w:i").length > 0;
    isUnderline = rPr.getElementsByTagName("w:u").length > 0;
    isStrike = rPr.getElementsByTagName("w:strike").length > 0 || rPr.getElementsByTagName("w:dstrike").length > 0;

    const colorEl = rPr.getElementsByTagName("w:color")[0];
    if (colorEl) {
      const val = colorEl.getAttribute("w:val");
      if (val && val !== "auto") color = `#${val}`;
    }

    const hlEl = rPr.getElementsByTagName("w:highlight")[0];
    if (hlEl) {
      highlight = hlEl.getAttribute("w:val") || "yellow";
    }

    const szEl = rPr.getElementsByTagName("w:sz")[0];
    if (szEl) {
      const halfPoints = parseInt(szEl.getAttribute("w:val") || "0", 10);
      if (halfPoints > 0) {
        fontSize = `${Math.round(halfPoints / 2)}pt`;
      }
    }
  }

  const textNodes = Array.from(rNode.getElementsByTagName("w:t"));
  const rawText = textNodes.map((t) => t.textContent || "").join("");

  if (!rawText) return { html: "", text: "" };

  let formatted = escapeXml(rawText);
  if (isBold) formatted = `<strong>${formatted}</strong>`;
  if (isItalic) formatted = `<em>${formatted}</em>`;
  if (isUnderline) formatted = `<u>${formatted}</u>`;
  if (isStrike) formatted = `<s>${formatted}</s>`;

  const styles: string[] = [];
  if (color) styles.push(`color: ${color}`);
  if (highlight) styles.push(`background-color: ${highlight}`);
  if (fontSize) styles.push(`font-size: ${fontSize}`);

  if (styles.length > 0) {
    formatted = `<span style="${styles.join("; ")}">${formatted}</span>`;
  }

  return { html: formatted, text: rawText };
}

function parseTable(tblNode: Element): { html: string; text: string } {
  const rows = Array.from(tblNode.getElementsByTagName("w:tr"));
  const rowHtmls: string[] = [];
  const rowTexts: string[] = [];

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const tr = rows[rIdx];
    const cells = Array.from(tr.getElementsByTagName("w:tc"));
    const cellHtmls: string[] = [];
    const cellTexts: string[] = [];

    const isHeaderRow = rIdx === 0;
    const tag = isHeaderRow ? "th" : "td";

    for (const tc of cells) {
      const pElements = Array.from(tc.getElementsByTagName("w:p"));
      const pTexts = pElements.map((p) => {
        const runs = Array.from(p.getElementsByTagName("w:t"));
        return runs.map((t) => t.textContent || "").join("");
      });
      const cellContent = pTexts.join("<br/>") || "&nbsp;";
      cellHtmls.push(`<${tag}>${cellContent}</${tag}>`);
      cellTexts.push(pTexts.join(" "));
    }

    rowHtmls.push(`<tr>${cellHtmls.join("")}</tr>`);
    rowTexts.push(cellTexts.join(" | "));
  }

  const html = `<table class="word-table" border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0;"><tbody>${rowHtmls.join("")}</tbody></table>`;
  const text = rowTexts.join("\n");
  return { html, text };
}

/* ────────────────────────────────────────────────────────────────────────────
   2. DOCX BUILDER (HTML -> OpenXML .docx ZIP Archive)
   ──────────────────────────────────────────────────────────────────────────── */

export async function exportToDocx(htmlContent: string, title: string = "Document"): Promise<Blob> {
  const zip = new JSZip();

  // Parse HTML string in browser DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const body = doc.body;

  const openXmlParagraphs: string[] = [];

  const children = Array.from(body.childNodes);
  for (const node of children) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "h1") {
        openXmlParagraphs.push(buildHeadingOpenXml(el, "Heading1", 48, true));
      } else if (tag === "h2") {
        openXmlParagraphs.push(buildHeadingOpenXml(el, "Heading2", 36, true));
      } else if (tag === "h3") {
        openXmlParagraphs.push(buildHeadingOpenXml(el, "Heading3", 28, true));
      } else if (tag === "blockquote") {
        openXmlParagraphs.push(buildParagraphOpenXml(el, "Quote", true));
      } else if (tag === "ul" || tag === "ol") {
        const lis = Array.from(el.querySelectorAll("li"));
        const isNum = tag === "ol";
        lis.forEach((li, idx) => {
          openXmlParagraphs.push(buildListOpenXml(li, isNum ? `${idx + 1}. ` : "• "));
        });
      } else if (tag === "table") {
        openXmlParagraphs.push(buildTableOpenXml(el as HTMLTableElement));
      } else if (tag === "hr") {
        openXmlParagraphs.push(
          `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr></w:p>`
        );
      } else {
        openXmlParagraphs.push(buildParagraphOpenXml(el));
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      openXmlParagraphs.push(
        `<w:p><w:r><w:t xml:space="preserve">${escapeXml(node.textContent)}</w:t></w:r></w:p>`
      );
    }
  }

  // word/document.xml
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${openXmlParagraphs.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  // [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  // _rels/.rels
  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  // word/_rels/document.xml.rels
  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // word/styles.xml
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Inter" w:hAnsi="Inter" w:cs="Inter"/>
        <w:sz w:val="24"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="280" w:after="140"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="0F172A"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:spacing w:before="240" w:after="100"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="0F172A"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:pPr><w:spacing w:before="180" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="334155"/></w:rPr>
  </w:style>
</w:styles>`;

  // Pack into zip
  zip.file("[Content_Types].xml", contentTypesXml);
  zip.file("_rels/.rels", relsXml);
  zip.file("word/_rels/document.xml.rels", docRelsXml);
  zip.file("word/styles.xml", stylesXml);
  zip.file("word/document.xml", documentXml);

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

function buildHeadingOpenXml(el: HTMLElement, styleId: string, sizeHalfPts: number, bold: boolean): string {
  const runs = extractRuns(el);
  const pPr = `<w:pPr><w:pStyle w:val="${styleId}"/><w:spacing w:before="240" w:after="120"/></w:pPr>`;
  const runXml = runs.map((r) => {
    return `<w:r><w:rPr>${bold ? "<w:b/>" : ""}<w:sz w:val="${sizeHalfPts}"/></w:rPr><w:t xml:space="preserve">${escapeXml(
      r.text
    )}</w:t></w:r>`;
  }).join("");
  return `<w:p>${pPr}${runXml}</w:p>`;
}

function buildListOpenXml(li: HTMLElement, prefix: string): string {
  const runs = extractRuns(li);
  const pPr = `<w:pPr><w:ind w:left="720"/><w:spacing w:after="60"/></w:pPr>`;
  const prefixRun = `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(prefix)}</w:t></w:r>`;
  const runsXml = runs.map((r) => formatRunToOpenXml(r)).join("");
  return `<w:p>${pPr}${prefixRun}${runsXml}</w:p>`;
}

function buildParagraphOpenXml(el: HTMLElement, styleId?: string, isBlockquote?: boolean): string {
  const runs = extractRuns(el);
  const align = el.style.textAlign;
  let jcXml = "";
  if (align === "center") jcXml = `<w:jc w:val="center"/>`;
  else if (align === "right") jcXml = `<w:jc w:val="right"/>`;
  else if (align === "justify") jcXml = `<w:jc w:val="both"/>`;

  let quotePr = "";
  if (isBlockquote) {
    quotePr = `<w:pBdr><w:left w:val="single" w:sz="24" w:space="12" w:color="3CFF5F"/></w:pBdr><w:ind w:left="480"/>`;
  }

  const pPr = `<w:pPr>${styleId ? `<w:pStyle w:val="${styleId}"/>` : ""}${jcXml}${quotePr}<w:spacing w:after="120"/></w:pPr>`;
  const runsXml = runs.map((r) => formatRunToOpenXml(r)).join("");
  return `<w:p>${pPr}${runsXml}</w:p>`;
}

function buildTableOpenXml(table: HTMLTableElement): string {
  const rows = Array.from(table.rows);
  const trXmls = rows.map((tr) => {
    const cells = Array.from(tr.cells);
    const tcXmls = cells.map((cell) => {
      const text = cell.textContent || "";
      const isHeader = cell.tagName.toLowerCase() === "th";
      return `<w:tc>
        <w:tcPr>
          <w:tcBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          </w:tcBorders>
          ${isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : ""}
        </w:tcPr>
        <w:p>
          <w:r>
            <w:rPr>${isHeader ? "<w:b/>" : ""}<w:sz w:val="20"/></w:rPr>
            <w:t xml:space="preserve">${escapeXml(text)}</w:t>
          </w:r>
        </w:p>
      </w:tc>`;
    });
    return `<w:tr>${tcXmls.join("")}</w:tr>`;
  });

  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
      </w:tblBorders>
    </w:tblPr>
    ${trXmls.join("")}
  </w:tbl>`;
}

interface TextRunMeta {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
}

function extractRuns(element: HTMLElement): TextRunMeta[] {
  const runs: TextRunMeta[] = [];

  function walk(node: Node, currentMeta: TextRunMeta) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text) {
        runs.push({ ...currentMeta, text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const meta = { ...currentMeta };

      if (tag === "b" || tag === "strong" || el.style.fontWeight === "bold") meta.bold = true;
      if (tag === "i" || tag === "em" || el.style.fontStyle === "italic") meta.italic = true;
      if (tag === "u" || el.style.textDecoration?.includes("underline")) meta.underline = true;
      if (tag === "s" || tag === "strike" || tag === "del" || el.style.textDecoration?.includes("line-through")) {
        meta.strike = true;
      }

      if (el.style.color) {
        meta.color = el.style.color;
      }
      if (el.style.backgroundColor) {
        meta.highlight = el.style.backgroundColor;
      }

      Array.from(el.childNodes).forEach((child) => walk(child, meta));
    }
  }

  walk(element, { text: "" });
  return runs.length > 0 ? runs : [{ text: element.textContent || "" }];
}

function formatRunToOpenXml(r: TextRunMeta): string {
  const rPrParts: string[] = [];
  if (r.bold) rPrParts.push("<w:b/>");
  if (r.italic) rPrParts.push("<w:i/>");
  if (r.underline) rPrParts.push('<w:u w:val="single"/>');
  if (r.strike) rPrParts.push("<w:strike/>");

  if (r.color) {
    const hex = rgbToHex(r.color);
    if (hex) rPrParts.push(`<w:color w:val="${hex}"/>`);
  }

  const rPr = rPrParts.length > 0 ? `<w:rPr>${rPrParts.join("")}</w:rPr>` : "";
  return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(r.text)}</w:t></w:r>`;
}

function rgbToHex(colorStr: string): string | null {
  if (colorStr.startsWith("#")) return colorStr.replace("#", "").toUpperCase();
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    const r = parseInt(match[1], 10).toString(16).padStart(2, "0");
    const g = parseInt(match[2], 10).toString(16).padStart(2, "0");
    const b = parseInt(match[3], 10).toString(16).padStart(2, "0");
    return `${r}${g}${b}`.toUpperCase();
  }
  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
   3. EXPORT HELPERS (HTML, Markdown, Plain Text)
   ──────────────────────────────────────────────────────────────────────────── */

export function exportToHtml(htmlContent: string, title: string = "Document"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.65;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 24px;
      background: #ffffff;
    }
    h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h2 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1.25rem; }
    p { margin: 0.75rem 0; }
    ul, ol { padding-left: 1.5rem; margin: 0.75rem 0; }
    li { margin-bottom: 0.35rem; }
    blockquote { border-left: 4px solid #3cff5f; padding-left: 1rem; margin: 1rem 0; color: #475569; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.9rem; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 700; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

export function exportToMarkdown(htmlContent: string): string {
  if (typeof window === "undefined") return htmlContent;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(processNode).join("");

    switch (tag) {
      case "h1":
        return `# ${inner.trim()}\n\n`;
      case "h2":
        return `## ${inner.trim()}\n\n`;
      case "h3":
        return `### ${inner.trim()}\n\n`;
      case "p":
        return `${inner.trim()}\n\n`;
      case "strong":
      case "b":
        return `**${inner}**`;
      case "em":
      case "i":
        return `*${inner}*`;
      case "u":
        return `<u>${inner}</u>`;
      case "s":
      case "strike":
      case "del":
        return `~~${inner}~~`;
      case "blockquote":
        return `> ${inner.trim()}\n\n`;
      case "li":
        return `- ${inner.trim()}\n`;
      case "ul":
      case "ol":
        return `${inner}\n`;
      case "hr":
        return `---\n\n`;
      case "table": {
        const rows = Array.from(el.querySelectorAll("tr"));
        if (!rows.length) return "";
        const lines: string[] = [];
        rows.forEach((r, idx) => {
          const cells = Array.from(r.querySelectorAll("th, td")).map((c) => c.textContent?.trim() || "");
          lines.push(`| ${cells.join(" | ")} |`);
          if (idx === 0) {
            lines.push(`| ${cells.map(() => "---").join(" | ")} |`);
          }
        });
        return `${lines.join("\n")}\n\n`;
      }
      default:
        return inner;
    }
  }

  return processNode(doc.body).trim();
}

export function exportToText(htmlContent: string): string {
  if (typeof window === "undefined") return htmlContent;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  return (doc.body.textContent || "").trim();
}

/* ────────────────────────────────────────────────────────────────────────────
   4. RICH SAMPLE TEMPLATE
   ──────────────────────────────────────────────────────────────────────────── */

export const SAMPLE_WORD_DOCUMENT = `
<h1>CompX Orbit Creative Suite — Project Roadmap &amp; Specification</h1>

<p>Welcome to the <strong>CompX Orbit Word Document Viewer &amp; Editor</strong>. Open existing <code>.docx</code> Word documents, edit rich content directly in the browser, and export back to <strong>Microsoft Word (.docx)</strong>, <strong>PDF</strong>, <strong>HTML</strong>, or <strong>Markdown</strong> with 100% privacy and zero server uploads.</p>

<hr/>

<h2>1. Executive Summary &amp; Mission</h2>
<p>Modern video editors and post-production studios waste dozens of hours every month converting media assets, calculating timecodes, and manually transcribing voiceovers. CompX Orbit bridges the gap with professional Adobe panels and 80+ in-browser creator utilities.</p>

<blockquote>
  "The goal of CompX Orbit is zero-lag creative flow — empowering video editors to focus on storytelling without leaving their timeline."
</blockquote>

<h2>2. Core System Features</h2>
<ul>
  <li><strong>Native Adobe Integration:</strong> Seamless panel dock inside After Effects &amp; Premiere Pro.</li>
  <li><strong>Zero-Upload Privacy:</strong> All file conversions and Word document processing occur strictly in local client memory.</li>
  <li><strong>Comprehensive Export Engine:</strong> Download as authentic OpenXML .docx, high-res PDF, formatted HTML, or Markdown.</li>
  <li><strong>Real-time Live Analytics:</strong> Track word count, reading time, speaking speed, and estimated printed pages.</li>
</ul>

<h2>3. Performance Benchmarks</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th>Tool Module</th>
      <th>Processing Speed</th>
      <th>Server Uploads</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Word Document Viewer</td>
      <td>&lt; 50ms instant</td>
      <td>0 KB (100% Local)</td>
      <td>Active v1.0</td>
    </tr>
    <tr>
      <td>CSV Data Grid Editor</td>
      <td>100,000+ rows/sec</td>
      <td>0 KB (100% Local)</td>
      <td>Active</td>
    </tr>
    <tr>
      <td>4K Image Upscaler</td>
      <td>WebGL Accelerated</td>
      <td>0 KB (Client Neural)</td>
      <td>Active</td>
    </tr>
    <tr>
      <td>AI Silence Remover</td>
      <td>Real-time Waveform</td>
      <td>0 KB (Web Audio)</td>
      <td>Active</td>
    </tr>
  </tbody>
</table>

<h2>4. Implementation Next Steps</h2>
<ol>
  <li>Test document formatting, text highlights, custom font sizes, and table editing.</li>
  <li>Export as <strong>Microsoft Word (.docx)</strong> to verify desktop Office 365 / Google Docs compatibility.</li>
  <li>Utilize <strong>1-Click Copy</strong> to paste rich formatted content into email or documentation portals.</li>
</ol>
`;

