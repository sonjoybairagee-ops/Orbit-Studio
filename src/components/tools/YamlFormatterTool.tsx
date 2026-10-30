"use client";

import { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const SAMPLES = {
  docker: `version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    environment:
      NODE_ENV: production
      PORT: 80
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: always

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://user:secret@db:5432/appdb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`,
  k8s: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: toolhub-deployment
  labels:
    app: toolhub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: toolhub
  template:
    metadata:
      labels:
        app: toolhub
    spec:
      containers:
        - name: web
          image: toolhub/app:latest
          ports:
            - containerPort: 3000
          resources:
            limits:
              cpu: "500m"
              memory: "512Mi"
            requests:
              cpu: "100m"
              memory: "128Mi"
`,
  workflow: `name: CI/CD Pipeline
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Build Next.js app
        run: npm run build
`,
};

// Helper: Convert JS object to YAML string with customizable indent
function objectToYaml(obj: any, indentLevel = 0, indentSize = 2): string {
  const indent = " ".repeat(indentLevel * indentSize);

  if (obj === null || obj === undefined) return "null\n";
  if (typeof obj === "boolean") return `${obj}\n`;
  if (typeof obj === "number") return `${obj}\n`;
  if (typeof obj === "string") {
    if (obj.includes("\n")) {
      const lines = obj.split("\n").map((l) => `${indent}  ${l}`).join("\n");
      return `|\n${lines}\n`;
    }
    if (
      obj.includes(":") ||
      obj.includes("#") ||
      obj.includes("[") ||
      obj.includes("{") ||
      obj === "" ||
      !isNaN(Number(obj)) ||
      obj.toLowerCase() === "true" ||
      obj.toLowerCase() === "false"
    ) {
      return `"${obj.replace(/"/g, '\\"')}"\n`;
    }
    return `${obj}\n`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]\n";
    let res = "\n";
    obj.forEach((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const itemYaml = objectToYaml(item, indentLevel + 1, indentSize);
        const trimmed = itemYaml.trimStart();
        res += `${indent}- ${trimmed}`;
      } else {
        const itemVal = objectToYaml(item, indentLevel + 1, indentSize).trimStart();
        res += `${indent}- ${itemVal}`;
      }
    });
    return res;
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}\n";
    let res = indentLevel > 0 ? "\n" : "";
    keys.forEach((k) => {
      const val = obj[k];
      const keyFormatted = k.includes(":") ? `"${k}"` : k;
      if (typeof val === "object" && val !== null) {
        res += `${indent}${keyFormatted}:${objectToYaml(val, indentLevel + 1, indentSize)}`;
      } else {
        res += `${indent}${keyFormatted}: ${objectToYaml(val, indentLevel + 1, indentSize).trimStart()}`;
      }
    });
    return res;
  }

  return `${String(obj)}\n`;
}

// Simple YAML Parser handling standard hierarchical structures
function parseYamlSimple(yamlStr: string): any {
  const lines = yamlStr.split(/\r?\n/);
  let lineIdx = 0;

  function parseBlock(currentIndent: number): any {
    let resultObj: Record<string, any> | null = null;
    let resultArray: any[] | null = null;

    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      // Skip empty lines or pure comment lines
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        lineIdx++;
        continue;
      }

      // Determine indentation
      const matchIndent = line.match(/^(\s*)/);
      const indent = matchIndent ? matchIndent[1].length : 0;

      if (indent < currentIndent) {
        // Dedent: return to parent block
        break;
      }

      // Check if list item
      const isListItem = /^\s*-\s+/.test(line);

      if (isListItem) {
        if (!resultArray) resultArray = [];
        const contentAfterDash = line.replace(/^\s*-\s+/, "");

        // Check if list item is key-value object start (e.g. "- name: John")
        const kvMatch = contentAfterDash.match(/^([^:]+):\s*(.*)$/);
        if (kvMatch) {
          const key = kvMatch[1].trim().replace(/^["']|["']$/g, "");
          const rawVal = kvMatch[2].trim();
          lineIdx++;
          const innerObj: Record<string, any> = {};
          if (rawVal === "" || rawVal.startsWith("#")) {
            innerObj[key] = parseBlock(indent + 2);
          } else {
            innerObj[key] = parseScalar(rawVal);
          }
          resultArray.push(innerObj);
        } else if (contentAfterDash === "" || contentAfterDash.startsWith("#")) {
          lineIdx++;
          resultArray.push(parseBlock(indent + 2));
        } else {
          lineIdx++;
          resultArray.push(parseScalar(contentAfterDash));
        }
      } else {
        // Key-Value pair
        const kvMatch = line.match(/^\s*([^:]+):\s*(.*)$/);
        if (kvMatch) {
          if (!resultObj) resultObj = {};
          const key = kvMatch[1].trim().replace(/^["']|["']$/g, "");
          const rawVal = kvMatch[2].trim();

          lineIdx++;
          if (rawVal === "" || rawVal.startsWith("#")) {
            // Nested object or list
            resultObj[key] = parseBlock(indent + 2);
          } else if (rawVal === "|") {
            // Multiline literal block
            let blockText = "";
            while (lineIdx < lines.length) {
              const subLine = lines[lineIdx];
              const subIndent = (subLine.match(/^(\s*)/) || ["", ""])[1].length;
              if (subLine.trim() && subIndent <= indent) break;
              blockText += subLine.trim() ? subLine.slice(indent + 2) + "\n" : "\n";
              lineIdx++;
            }
            resultObj[key] = blockText.trimEnd();
          } else {
            resultObj[key] = parseScalar(rawVal);
          }
        } else {
          lineIdx++;
        }
      }
    }

    if (resultArray !== null) return resultArray;
    return resultObj || {};
  }

  function parseScalar(val: string): any {
    const clean = val.replace(/\s*#.*$/, "").trim(); // strip inline comments
    if (clean === "true" || clean === "True") return true;
    if (clean === "false" || clean === "False") return false;
    if (clean === "null" || clean === "Null" || clean === "~") return null;
    if (/^-?\d+$/.test(clean)) return parseInt(clean, 10);
    if (/^-?\d+\.\d+$/.test(clean)) return parseFloat(clean);
    // Remove surrounding quotes if present
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      return clean.slice(1, -1);
    }
    return clean;
  }

  return parseBlock(0);
}

export default function YamlFormatterTool() {
  const [direction, setDirection] = useState<"yaml2json" | "json2yaml">("yaml2json");
  const [input, setInput] = useState<string>(SAMPLES.docker);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion process
  const conversionResult = useMemo(() => {
    if (!input.trim()) return { output: "", isValid: true, error: "" };

    try {
      if (direction === "yaml2json") {
        const parsed = parseYamlSimple(input);
        const jsonFormatted = JSON.stringify(parsed, null, indentSize);
        return { output: jsonFormatted, isValid: true, error: "" };
      } else {
        const parsed = JSON.parse(input);
        const yamlFormatted = objectToYaml(parsed, 0, indentSize);
        return { output: yamlFormatted, isValid: true, error: "" };
      }
    } catch (err: any) {
      return { output: "", isValid: false, error: err?.message || "Invalid syntax." };
    }
  }, [input, direction, indentSize]);

  const handleCopy = () => {
    if (!conversionResult.output) return;
    navigator.clipboard.writeText(conversionResult.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!conversionResult.output) return;
    const isJson = direction === "yaml2json";
    const ext = isJson ? "json" : "yaml";
    const mime = isJson ? "application/json" : "text/yaml";
    const blob = new Blob([conversionResult.output], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwapDirection = () => {
    if (direction === "yaml2json") {
      setDirection("json2yaml");
      if (conversionResult.output) {
        setInput(conversionResult.output);
      }
    } else {
      setDirection("yaml2json");
      if (conversionResult.output) {
        setInput(conversionResult.output);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FileCode className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                YAML Formatter & JSON Converter
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Format, validate, and convert YAML ↔ JSON seamlessly with zero server upload.
              </p>
            </div>
          </div>

          {/* Preset Samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Templates:</span>
            <button
              type="button"
              onClick={() => {
                setDirection("yaml2json");
                setInput(SAMPLES.docker);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Docker Compose
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("yaml2json");
                setInput(SAMPLES.k8s);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Kubernetes
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("yaml2json");
                setInput(SAMPLES.workflow);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              GitHub Action
            </button>
          </div>
        </div>

        {/* Mode Switcher & Indent */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDirection("yaml2json")}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  direction === "yaml2json" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                YAML → JSON
              </button>
              <button
                type="button"
                onClick={() => setDirection("json2yaml")}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  direction === "json2yaml" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                JSON → YAML
              </button>
            </div>

            <button
              type="button"
              onClick={handleSwapDirection}
              title="Swap converter direction"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span>Indent:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value) as 2 | 4)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-bold text-slate-800 focus:outline-none"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Result"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Output Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Pane */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Input {direction === "yaml2json" ? "YAML" : "JSON"}
            </span>
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${direction === "yaml2json" ? "YAML" : "JSON"} content here...`}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Output Pane */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Converted {direction === "yaml2json" ? "JSON" : "YAML"}
            </span>
            {conversionResult.isValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Valid Syntax
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3 w-3" /> Syntax Error
              </span>
            )}
          </div>

          {conversionResult.error ? (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-mono">
              <strong>Error:</strong> {conversionResult.error}
            </div>
          ) : (
            <textarea
              readOnly
              rows={18}
              value={conversionResult.output}
              placeholder="Output will appear here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-800 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
