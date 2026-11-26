// Client-side preview parsing until the import API exists.

export interface ImportedSentence {
  id: string;
  text: string; // sentence without separators
  tokens: string[] | null; // set when the file is already tokenized
}

/** Minimal RFC 4180 CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

function fromTokens(id: string, tokens: string[]): ImportedSentence {
  return { id, text: tokens.join(""), tokens };
}

/** CoNLL: one token per line (first column), blank line between sentences, "#" comments. */
export function parseConll(input: string): ImportedSentence[] {
  const sentences: ImportedSentence[] = [];
  let tokens: string[] = [];
  const flush = () => {
    if (tokens.length) sentences.push(fromTokens(String(sentences.length + 1), tokens));
    tokens = [];
  };
  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) flush();
    else if (!line.startsWith("#")) tokens.push(line.split(/\t|\s+/)[0]);
  }
  flush();
  return sentences;
}

/**
 * CSV: a "token" column means one token per row (grouped by a sentence id column);
 * otherwise the "text" column (or the first column) holds one sentence per row.
 * Text containing "|" is treated as already pipe-tokenized.
 */
export function parseCsvSentences(input: string): ImportedSentence[] {
  const [header, ...rows] = parseCsv(input.replace(/^﻿/, ""));
  if (!header) return [];
  const cols = header.map((h) => h.trim().toLowerCase());
  const tokenCol = cols.indexOf("token");

  if (tokenCol >= 0) {
    const idCol = cols.findIndex((c) => c === "sentence_id" || c === "sentence" || c === "sent_id");
    const groups = new Map<string, string[]>();
    rows.forEach((r, i) => {
      const id = idCol >= 0 ? r[idCol] : String(i + 1);
      const token = (r[tokenCol] ?? "").trim();
      if (!token) return;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id)!.push(token);
    });
    return [...groups].map(([id, tokens]) => fromTokens(id, tokens));
  }

  const textCol = Math.max(cols.indexOf("text"), 0);
  const idCol = cols.findIndex((c) => c === "sentence_id" || c === "id");
  return rows
    .map((r, i) => {
      const id = idCol >= 0 && idCol !== textCol ? r[idCol] : String(i + 1);
      const text = (r[textCol] ?? "").trim();
      if (!text) return null;
      if (text.includes("|")) return fromTokens(id, text.split("|").map((t) => t.trim()).filter(Boolean));
      return { id, text, tokens: null };
    })
    .filter((s): s is ImportedSentence => s !== null);
}

export interface ImportedTable {
  columns: string[];
  rows: string[][];
}

/** Column view of the file for Column Map (CoNLL has no header, so columns are numbered). */
export function parseTable(input: string, isConll: boolean): ImportedTable {
  if (isConll) {
    const rows = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.split(/\t/));
    const width = Math.max(0, ...rows.map((r) => r.length));
    return { columns: Array.from({ length: width }, (_, i) => `column_${i + 1}`), rows };
  }
  const [header = [], ...rows] = parseCsv(input.replace(/^﻿/, ""));
  return { columns: header.map((h) => h.trim()), rows };
}

export async function readImport(file: File): Promise<{ sentences: ImportedSentence[]; table: ImportedTable }> {
  const text = await file.text();
  const isConll = file.name.toLowerCase().endsWith(".conll");
  return {
    sentences: isConll ? parseConll(text) : parseCsvSentences(text),
    table: parseTable(text, isConll),
  };
}

const BIOES_RE = /^(O|[BIES]-\S+)$/;

/** True when most non-empty values look like BIOES tags (spec §5 tag detection). */
export function looksLikeBioes(values: string[], threshold = 0.8): boolean {
  const filled = values.map((v) => v.trim()).filter(Boolean);
  if (filled.length === 0) return false;
  return filled.filter((v) => BIOES_RE.test(v)).length / filled.length >= threshold;
}
