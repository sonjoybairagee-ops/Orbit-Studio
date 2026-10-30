/**
 * Client-side text processing utilities
 */

export interface WordStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMin: number;
  speakingTimeMin: number;
  topWords: Array<{ word: string; count: number; density: number }>;
}

export function getWordStats(text: string): WordStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMin: 0,
      speakingTimeMin: 0,
      topWords: [],
    };
  }

  // Words (split on whitespace)
  const wordArray = trimmed.match(/\b[\w'-]+\b/g) || [];
  const words = wordArray.length;

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Sentences (split on ., !, ?, or newlines with punctuation)
  const sentences = (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [1]).length;

  // Paragraphs (split on consecutive newlines)
  const paragraphs = trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length;

  // Reading time (avg 200 words per minute)
  const readingTimeMin = Math.ceil(words / 200);

  // Speaking time (avg 130 words per minute)
  const speakingTimeMin = Math.ceil(words / 130);

  // Word frequency
  const freqMap: Record<string, number> = {};
  wordArray.forEach((w) => {
    const cleanW = w.toLowerCase();
    if (cleanW.length > 2) {
      freqMap[cleanW] = (freqMap[cleanW] || 0) + 1;
    }
  });

  const topWords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({
      word,
      count,
      density: words > 0 ? parseFloat(((count / words) * 100).toFixed(1)) : 0,
    }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMin,
    speakingTimeMin,
    topWords,
  };
}

export interface CharacterStats {
  total: number;
  withoutSpaces: number;
  letters: number;
  digits: number;
  whitespace: number;
  punctuation: number;
}

export function getCharacterStats(text: string): CharacterStats {
  const total = text.length;
  const withoutSpaces = text.replace(/\s/g, "").length;
  const letters = (text.match(/[a-zA-Z\u00C0-\u024F\u0980-\u09FF]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const whitespace = (text.match(/\s/g) || []).length;
  const punctuation = (text.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g) || []).length;

  return {
    total,
    withoutSpaces,
    letters,
    digits,
    whitespace,
    punctuation,
  };
}

export type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "alternating";

export function convertCase(text: string, caseType: CaseType): string {
  if (!text) return "";

  switch (caseType) {
    case "upper":
      return text.toUpperCase();

    case "lower":
      return text.toLowerCase();

    case "title":
      return text
        .toLowerCase()
        .replace(/(?:^|\s|-|\/)\S/g, (char) => char.toUpperCase());

    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_match, prefix, char) => prefix + char.toUpperCase());

    case "camel": {
      const words = text
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/);
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
    }

    case "pascal": {
      const words = text
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/);
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    }

    case "snake":
      return text
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();

    case "kebab":
      return text
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

    case "alternating":
      return text
        .split("")
        .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join("");

    default:
      return text;
  }
}

export interface CleanSpaceOptions {
  collapseSpaces: boolean;
  trimLines: boolean;
  removeBlankLines: boolean;
  stripTabs: boolean;
}

export function cleanExtraSpaces(text: string, options: CleanSpaceOptions): string {
  let result = text;

  if (options.stripTabs) {
    result = result.replace(/\t/g, " ");
  }

  if (options.collapseSpaces) {
    // Replace 2 or more horizontal spaces with a single space
    result = result.replace(/[^\S\r\n]+/g, " ");
  }

  if (options.trimLines) {
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }

  if (options.removeBlankLines) {
    result = result
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join("\n");
  }

  return result.trim();
}
