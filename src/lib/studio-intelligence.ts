import { inputHash, runOpenAIJson } from "@/lib/video-intelligence";

export const STUDIO_VERSION = "studio-v1";
export const DAILY_UNITS = 80;

const stringArray = (minItems: number, maxItems: number, maxLen: number) => ({
  type: "array",
  minItems,
  maxItems,
  items: { type: "string", maxLength: maxLen },
});

export const STUDIO_SCHEMAS: Record<string, object> = {
  project_intel: {
    type: "object", additionalProperties: false,
    required: ["patterns", "formats", "audience", "caveats"],
    properties: {
      patterns: { type: "string" },
      formats: { type: "string" },
      audience: { type: "string" },
      caveats: { type: "string" },
    },
  },
  gaps: {
    type: "object", additionalProperties: false,
    required: ["gaps", "caveats"],
    properties: {
      gaps: {
        type: "array", minItems: 1, maxItems: 5,
        items: {
          type: "object", additionalProperties: false,
          required: ["question", "evidence"],
          properties: { question: { type: "string" }, evidence: { type: "string" } },
        },
      },
      caveats: { type: "string" },
    },
  },
  concepts: {
    type: "object", additionalProperties: false,
    required: ["concepts", "caveats"],
    properties: {
      concepts: {
        type: "array", minItems: 1, maxItems: 3,
        items: {
          type: "object", additionalProperties: false,
          required: ["title", "premise", "promise"],
          properties: { title: { type: "string" }, premise: { type: "string" }, promise: { type: "string" } },
        },
      },
      caveats: { type: "string" },
    },
  },
  hooks: {
    type: "object", additionalProperties: false,
    required: ["hooks", "caveats"],
    properties: { hooks: stringArray(3, 5, 280), caveats: { type: "string" } },
  },
  titles: {
    type: "object", additionalProperties: false,
    required: ["titles", "caveats"],
    properties: { titles: stringArray(3, 6, 100), caveats: { type: "string" } },
  },
  blueprint: {
    type: "object", additionalProperties: false,
    required: ["title", "hook", "sections", "cta", "caveats"],
    properties: {
      title: { type: "string" },
      hook: { type: "string" },
      sections: stringArray(4, 8, 240),
      cta: { type: "string" },
      caveats: { type: "string" },
    },
  },
  edit_plan: {
    type: "object", additionalProperties: false,
    required: ["steps", "caveats"],
    properties: { steps: stringArray(4, 8, 240), caveats: { type: "string" } },
  },
};

const INSTRUCTIONS: Record<string, string> = {
  project_intel: "Summarize recurring patterns across the listed research videos. Use only the provided titles and analyses. Do not invent transcripts. Do not recommend copying a source.",
  gaps: "List unanswered audience questions evidenced by the provided titles/analyses. Each evidence field must cite a provided title. Do not invent videos.",
  concepts: "Propose original video concepts that are not rewrites. Titles must not closely mimic a source title. No virality or copyright-clearance claims.",
  hooks: "Write original spoken openings for the creator's concept, not for rewriting a source video. One sentence each.",
  titles: "Write original titles for the creator's concept. Do not imitate source titles closely.",
  blueprint: "Outline an original video. Sections are the creator's structure, not a copy of a source outline.",
  edit_plan: "Give an optional editing checklist for the original blueprint. No guaranteed retention claims.",
};

export function studioHash(kind: string, source: string) {
  return inputHash({ version: STUDIO_VERSION, kind, source });
}

export function titleOverlap(a: string, b: string) {
  const tokens = (value: string) => new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2));
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size) return 0;
  let hits = 0;
  for (const token of left) if (right.has(token)) hits += 1;
  return hits / left.size;
}

export function tooSimilar(candidate: string, sources: string[]) {
  return sources.some((source) => titleOverlap(candidate, source) >= 0.72);
}

export function applySimilarityGuard(kind: string, result: Record<string, unknown>, sources: string[]) {
  if (kind === "concepts" && Array.isArray(result.concepts)) {
    const concepts = result.concepts.filter((item) => item && typeof item === "object") as { title?: string }[];
    const flagged = concepts.filter((item) => typeof item.title === "string" && tooSimilar(item.title, sources));
    if (flagged.length === concepts.length && concepts.length) {
      return { ok: false as const, error: "Those concepts were too close to source titles. Try again with a more original angle." };
    }
    result.concepts = concepts.filter((item) => typeof item.title !== "string" || !tooSimilar(item.title, sources));
    result.similarityChecked = true;
  }
  if (kind === "titles" && Array.isArray(result.titles)) {
    result.titles = (result.titles as unknown[]).filter((title) => typeof title === "string" && !tooSimilar(title, sources));
    if (!(result.titles as unknown[]).length) return { ok: false as const, error: "Generated titles were too similar to sources. Retry." };
    result.similarityChecked = true;
  }
  return { ok: true as const, result };
}

export async function generateStudio(kind: string, source: string) {
  const schema = STUDIO_SCHEMAS[kind];
  const instructions = INSTRUCTIONS[kind];
  if (!schema || !instructions) return { ok: false as const, status: 400, error: "Unknown studio task." };
  const generated = await runOpenAIJson(kind, schema, `${instructions} Return only JSON. Never claim views, copyright clearance or that research may be copied.`, source);
  if (!generated.ok) return generated;
  if (!generated.json || typeof generated.json !== "object") return { ok: false as const, status: 502, error: "The model returned an unusable result. Retry." };
  return { ok: true as const, model: generated.model, json: generated.json as Record<string, unknown> };
}
