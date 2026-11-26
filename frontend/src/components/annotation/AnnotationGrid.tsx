import { useState, type CSSProperties } from "react";
import TagCell from "./TagCell";
import ErrorPopover from "./ErrorPopover";
import { toneClass, type Tone } from "../ui/tone";
import { toneOf } from "../../utils/tags";
import { cn } from "@/lib/utils";
import type { EntityType, Sentence, ValidationError } from "../../types/annotation";

const ROW =
  "group/row grid min-h-8 grid-cols-[36px_minmax(140px,1.3fr)_repeat(var(--layers),minmax(120px,1fr))] items-center border-b has-[[data-error]]:bg-[color-mix(in_srgb,var(--color-error-row)_4%,transparent)]";
const TH =
  "flex items-center self-stretch border-b px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.6px] text-muted-foreground";

const PIN_BG =
  "bg-white group-has-[[data-error]]/row:bg-[color-mix(in_srgb,var(--color-error-row)_4%,white)]";
const PIN_INDEX = cn("sticky left-0 z-[1] flex items-center justify-end self-stretch pr-3.5 font-mono text-[10px] text-muted-foreground", PIN_BG);
const PIN_TOKEN = cn("sticky left-9 z-[1] flex items-center self-stretch px-3.5 font-burmese text-[14px] tracking-[0.14px]", PIN_BG);

interface LayerColumn {
  label: string;
  tone: Tone;
}

interface AnnotationGridProps {
  sentences: Sentence[];
  layers: LayerColumn[];
  entities: EntityType[];
  errors: ValidationError[];
}

export default function AnnotationGrid({ sentences, layers, entities, errors }: AnnotationGridProps) {
  const [open, setOpen] = useState<string | null>(null);
  const style = { "--layers": layers.length } as CSSProperties;
  const keyOf = (e: Pick<ValidationError, "sentenceId" | "tokenIndex" | "layer">) =>
    `${e.sentenceId}:${e.tokenIndex}:${e.layer}`;

  return (
    <div className="min-w-[calc(176px_+_var(--layers)_*_120px)]" style={style}>
      <div className={cn(ROW, "sticky top-0 z-[2] border-b-0 bg-white")}>
        <span className={cn(TH, "sticky left-0 z-[1] bg-white")}>#</span>
        <span className={cn(TH, "sticky left-9 z-[1] bg-white")}>Token</span>
        {layers.map((l) => (
          <span key={l.label} className={cn(TH, "border-b-[color:color-mix(in_srgb,var(--tone-color)_25%,transparent)] font-bold text-[color:var(--tone-color)]", toneClass(l.tone))}>
            {l.label}
          </span>
        ))}
      </div>

      {sentences.map((s) => (
        <section key={s.id}>
          <div className="border-b">
            <div className="sticky left-0 flex w-max max-w-[100cqw] items-center gap-2.5 px-3.5 pt-2.5 pb-1.5">
              <span className="font-mono text-[10px] font-bold text-primary">{s.id}</span>
              <span className="font-burmese text-[12px]">{s.text}</span>
            </div>
          </div>
          {s.tokens.map((t, i) => (
            <div key={i} className={ROW}>
              <span className={PIN_INDEX}>{i + 1}</span>
              <span className={PIN_TOKEN}>{t.text}</span>
              {layers.map((_, layer) => {
                const err = errors.find((e) => keyOf(e) === keyOf({ sentenceId: s.id, tokenIndex: i, layer }));
                const key = keyOf({ sentenceId: s.id, tokenIndex: i, layer });
                const tag = t.tags[layer] ?? "O";
                return (
                  <TagCell
                    key={layer}
                    tag={tag}
                    tone={toneOf(tag, entities)}
                    error={!!err}
                    popover={
                      err
                        ? {
                            open: open === key,
                            onOpenChange: (o) => setOpen(o ? key : null),
                            content: (
                              <ErrorPopover
                                location={`${s.id} · Token ${i + 1} · Layer ${layer + 1}`}
                                message={err.message}
                              />
                            ),
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
