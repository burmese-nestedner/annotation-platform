import { TEXT_COLUMN_NAMES, looksLikeBioes, type ImportedTable } from "@/utils/importFile";

export const MAX_LAYERS = 6;
export const NOT_MAPPED = "__none"; // Radix Select needs a non-empty value

/** Platform fields a file column can map to (spec §5): token + one tag column per layer. */
export function mappingTargets(mode: string): string[] {
  const layers = mode === "flat" ? 1 : MAX_LAYERS;
  return ["token", ...Array.from({ length: layers }, (_, i) => `layer${i + 1}`)];
}

/** Highest layer a file column is mapped to (0 = no tag columns mapped). */
export function mappedLayerCount(mapping: Record<string, string>, mode: string): number {
  const targets = mappingTargets(mode);
  return Object.values(mapping).reduce((max, t) => {
    const m = /^layer(\d+)$/.exec(t);
    return m && targets.includes(t) ? Math.max(max, Number(m[1])) : max;
  }, 0);
}

export function columnValues(table: ImportedTable, col: number): string[] {
  return table.rows.map((r) => r[col] ?? "");
}

const TOKEN_NAMES = ["token", "word", ...TEXT_COLUMN_NAMES];

/** First guess: a token-like column -> token, BIOES-looking columns -> layer1, layer2, … */
export function suggestMapping(table: ImportedTable, mode: string): Record<string, string> {
  const mapping: Record<string, string> = {};
  const targets = mappingTargets(mode);
  const tokenIdx = table.columns.findIndex((c) => TOKEN_NAMES.includes(c.toLowerCase()));
  // CoNLL has no header: the first column is the token
  const fallback = table.columns[0]?.startsWith("column_") ? 0 : -1;
  const ti = tokenIdx >= 0 ? tokenIdx : fallback;
  if (ti >= 0) mapping[table.columns[ti]] = "token";

  let layer = 1;
  table.columns.forEach((c, i) => {
    if (i === ti || !looksLikeBioes(columnValues(table, i))) return;
    const target = `layer${layer}`;
    if (targets.includes(target)) {
      mapping[c] = target;
      layer++;
    }
  });
  return mapping;
}
