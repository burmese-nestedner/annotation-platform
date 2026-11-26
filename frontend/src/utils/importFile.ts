// Client-side preview parsing until the import API exists.

export interface ImportedSentence {
  id: string;
  text: string; // sentence without separators
  tokens: string[] | null; // set when the file is already tokenized
}

/** Column names that hold one whole sentence per row (shared with Column Map). */
export const TEXT_COLUMN_NAMES = ["text", "raw_text", "sentence"];

const ID_COLUMN = /(^|_)id$/;

/**
 * Minimal RFC 4180 CSV parser (quotes, escaped quotes, CRLF).
 * Blank lines are dropped unless keepBlank is set (then they come back as []).
 */
export function parseCsv(input: string, keepBlank = false): string[][] {
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
  const isBlank = (r: string[]) => r.every((f) => f.trim() === "");
  return keepBlank ? rows.map((r) => (isBlank(r) ? [] : r)) : rows.filter((r) => !isBlank(r));
}

/** Same id twice (e.g. a repeated sentence_id) would merge pipe edits and React keys. */
function withUniqueIds(sentences: ImportedSentence[]): ImportedSentence[] {
  const seen = new Map<string, number>();
  return sentences.map((s) => {
    const n = (seen.get(s.id) ?? 0) + 1;
    seen.set(s.id, n);
    return n === 1 ? s : { ...s, id: `${s.id}#${n}` };
  });
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
  const [header, ...rows] = parseCsv(input.replace(/^\uFEFF/, ""), true);
  if (!header) return [];
  const cols = header.map((h) => h.trim().toLowerCase());
  const tokenCol = cols.indexOf("token");

  if (tokenCol >= 0) {
    const idCol = cols.findIndex((c) => c === "sentence_id" || c === "sentence" || c === "sent_id");
    if (idCol < 0) {
      // no sentence id column: a blank row ends a sentence (like CoNLL)
      const sentences: ImportedSentence[] = [];
      let tokens: string[] = [];
      const flush = () => {
        if (tokens.length) sentences.push(fromTokens(String(sentences.length + 1), tokens));
        tokens = [];
      };
      for (const r of rows) {
        const token = (r[tokenCol] ?? "").trim();
        if (r.length === 0) flush();
        else if (token) tokens.push(token);
      }
      flush();
      return sentences;
    }
    const groups = new Map<string, string[]>();
    for (const r of rows) {
      const token = (r[tokenCol] ?? "").trim();
      if (r.length === 0 || !token) continue;
      const id = r[idCol];
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id)!.push(token);
    }
    return [...groups].map(([id, tokens]) => fromTokens(id, tokens));
  }

  // text column by name; otherwise the first column that is not an id
  const named = cols.findIndex((c) => TEXT_COLUMN_NAMES.includes(c));
  const textCol = named >= 0 ? named : Math.max(cols.findIndex((c) => !ID_COLUMN.test(c)), 0);
  const idCol = cols.findIndex((c) => c === "sentence_id" || c === "id");
  const sentences = rows
    .filter((r) => r.length > 0)
    .map((r, i) => {
      const id = idCol >= 0 && idCol !== textCol ? r[idCol] : String(i + 1);
      const text = (r[textCol] ?? "").trim();
      if (!text) return null;
      if (text.includes("|")) return fromTokens(id, text.split("|").map((t) => t.trim()).filter(Boolean));
      return { id, text, tokens: null };
    })
    .filter((s): s is ImportedSentence => s !== null);
  return withUniqueIds(sentences);
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
  const [header = [], ...rows] = parseCsv(input.replace(/^\uFEFF/, ""));
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
