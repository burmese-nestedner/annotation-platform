// Combining marks that stay attached to the previous base character.
function isMyanmarMark(cp: number): boolean {
  return (
    (cp >= 0x102b && cp <= 0x103e) ||
    (cp >= 0x1056 && cp <= 0x1059) ||
    (cp >= 0x105e && cp <= 0x1060) ||
    (cp >= 0x1062 && cp <= 0x1064) ||
    (cp >= 0x1067 && cp <= 0x106d) ||
    (cp >= 0x1071 && cp <= 0x1074) ||
    (cp >= 0x1082 && cp <= 0x108d) ||
    cp === 0x108f ||
    (cp >= 0x109a && cp <= 0x109d)
  );
}

const VIRAMA = 0x1039; // stacked consonant joins the previous cluster

/** Split text into clickable character clusters (base + marks; stacked consonants kept together). */
export function charClusters(text: string): string[] {
  const out: string[] = [];
  let prev = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (out.length && (isMyanmarMark(cp) || prev === VIRAMA)) out[out.length - 1] += ch;
    else out.push(ch);
    prev = cp;
  }
  return out;
}

/** Cluster indices after which a token boundary sits (last token excluded). */
export function boundariesFromTokens(tokens: string[]): number[] {
  const result: number[] = [];
  let count = 0;
  tokens.forEach((t, i) => {
    count += charClusters(t).length;
    if (i < tokens.length - 1) result.push(count - 1);
  });
  return result;
}
