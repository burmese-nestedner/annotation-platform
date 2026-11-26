import type { Sentence, ValidationError } from "@/types/annotation";

export type Prefix = "B" | "I" | "E" | "S";

const TAG_RE = /^([BIES])-(\S+)$/;

/** "O" -> { prefix: "O" }, "B-PER" -> { prefix: "B", type: "PER" }, anything else -> null */
export function parseTag(tag: string): { prefix: Prefix | "O"; type: string } | null {
  if (tag === "O") return { prefix: "O", type: "" };
  const m = TAG_RE.exec(tag);
  return m ? { prefix: m[1] as Prefix, type: m[2] } : null;
}

const notClosed = (tag: string, type: string) =>
  `"${tag}" is not closed. Continue with I-${type} or end with E-${type}; use S-${type} for a single-token entity.`;

/**
 * Real-time BIOES check, per sentence and per layer.
 * Each problem is reported on the token where it shows up.
 */
export function validateBioes(sentences: Sentence[], layerCount: number, entityCodes: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const s of sentences) {
    for (let layer = 0; layer < layerCount; layer++) {
      let open: { type: string; index: number } | null = null; // span started by B / continued by I
      const report = (tokenIndex: number, message: string) =>
        errors.push({ sentenceId: s.id, tokenIndex, layer, message });
      const closeOpen = () => {
        if (open) report(open.index, notClosed(s.tokens[open.index].tags[layer], open.type));
        open = null;
      };

      s.tokens.forEach((t, i) => {
        const tag = t.tags[layer] ?? "O";
        const p = parseTag(tag);
        if (!p) {
          closeOpen();
          return report(i, `"${tag}" is not a valid tag. Use O, or B-, I-, E-, S- followed by an entity type.`);
        }
        if (p.prefix !== "O" && !entityCodes.has(p.type)) {
          closeOpen();
          return report(i, `"${p.type}" is not an entity type in this project.`);
        }
        switch (p.prefix) {
          case "O":
          case "S":
            closeOpen();
            break;
          case "B":
            closeOpen();
            open = { type: p.type, index: i };
            break;
          case "I":
          case "E": {
            const role = p.prefix === "I" ? "continue" : "close";
            if (!open) {
              report(i, `"${tag}" has nothing to ${role}. Start the entity with B-${p.type}, or use S-${p.type} for a single token.`);
            } else if (open.type !== p.type) {
              report(i, `"${tag}" cannot ${role} the open ${open.type} entity. Use ${p.prefix}-${open.type}, or end ${open.type} first.`);
            }
            // report once: a stray I- still counts as an open span so the next E- is not flagged again
            open = p.prefix === "I" ? { type: p.type, index: i } : null;
            break;
          }
        }
      });
      closeOpen();
    }
  }
  return errors;
}
