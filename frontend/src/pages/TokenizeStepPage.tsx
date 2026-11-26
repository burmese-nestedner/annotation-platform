import { memo, useMemo, useState, type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CircleAlert, PenLine } from "@/components/icons";
import { useNewProject } from "@/components/projects/NewProjectContext";
import WizardFooter from "@/components/projects/WizardFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { charClusters } from "@/utils/burmese";
import type { ImportedSentence } from "@/utils/importFile";

const PAGE_SIZE = 50;

function InfoBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-10 bg-primary/10 px-4 py-3.5">
      <CircleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[13px] font-bold leading-[19.5px] text-primary">{title}</p>
        <div className="pt-1 text-[12px] leading-[20.4px] text-foreground">{children}</div>
      </div>
    </div>
  );
}

const PipeSentence = memo(function PipeSentence({
  index,
  sentence,
  pipes,
  onToggle,
}: {
  index: number;
  sentence: ImportedSentence;
  pipes: number[];
  onToggle: (id: string, cluster: number) => void;
}) {
  const clusters = useMemo(() => charClusters(sentence.text), [sentence.text]);
  const pipeSet = useMemo(() => new Set(pipes), [pipes]);

  return (
    <div className="rounded-8 border border-border bg-muted px-3.5 py-3">
      <p className="font-mono text-[9px] font-bold uppercase leading-[13.5px] tracking-[0.63px] text-muted-foreground">
        Sentence {index + 1}
      </p>
      <div className="flex flex-wrap pt-2 font-burmese text-[15px] leading-[33px] text-foreground">
        {clusters.map((c, i) => {
          const last = i === clusters.length - 1;
          const piped = pipeSet.has(i);
          return (
            <span key={i} className="flex items-center">
              <button
                type="button"
                disabled={last}
                aria-pressed={piped}
                aria-label={`${piped ? "Remove" : "Insert"} separator after ${c}`}
                onClick={() => onToggle(sentence.id, i)}
                className={cn(
                  "flex h-[36.5px] items-center rounded-t-2 border-b-[1.5px] border-transparent outline-none",
                  !last && "cursor-pointer hover:border-primary hover:bg-primary/5 focus-visible:border-primary",
                  last && "cursor-default",
                )}
              >
                {c}
              </button>
              {piped && (
                <span aria-hidden className="px-0.5 font-mono text-[15px] font-bold text-primary">
                  |
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
});

function PipeTokenizer() {
  const { sentences, pipes, setPipes } = useNewProject();
  const [shown, setShown] = useState(PAGE_SIZE);
  const list = sentences ?? [];
  const total = Object.values(pipes).reduce((n, p) => n + p.length, 0);

  const toggle = (id: string, cluster: number) =>
    setPipes((prev) => {
      const cur = prev[id] ?? [];
      const next = cur.includes(cluster) ? cur.filter((c) => c !== cluster) : [...cur, cluster].sort((a, b) => a - b);
      return { ...prev, [id]: next };
    });

  return (
    <div className="overflow-hidden rounded-10 border border-border bg-white">
      <div className="flex items-center gap-2.5 border-b border-border bg-muted px-4 py-2.5">
        <PenLine size={14} strokeWidth={1.75} className="shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-[12px] font-bold leading-[18px]">Pipe Tokenizer</p>
        <p className="text-[11px] leading-[16.5px] text-muted-foreground">
          {total} {total === 1 ? "pipe" : "pipes"} inserted
        </p>
      </div>
      <p className="border-b border-border px-4 py-2 text-[11px] leading-[16.5px] text-muted-foreground">
        Click the <b className="font-bold text-foreground">last character</b> of each word to insert a{" "}
        <code className="rounded-3 bg-muted px-1 font-mono font-bold text-primary">|</code> separator. Click again to
        remove.
      </p>
      <div className="flex flex-col gap-3 px-4 py-3">
        {list.slice(0, shown).map((s, i) => (
          <PipeSentence key={s.id} index={i} sentence={s} pipes={pipes[s.id] ?? []} onToggle={toggle} />
        ))}
        {list.length > shown && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-muted-foreground">
              Showing {shown} of {list.length} sentences
            </span>
            <Button variant="outline" size="sm" onClick={() => setShown((n) => n + PAGE_SIZE)}>
              Show more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TokenizeStepPage() {
  const navigate = useNavigate();
  const { form, sentences } = useNewProject();

  // reached directly (refresh / deep link): start over at step 1
  if (!form.file || !sentences) return <Navigate to="/projects/new" replace />;

  const tokenCount = sentences.reduce((n, s) => n + (s.tokens?.length ?? 0), 0);

  let content: ReactNode;
  switch (form.tokenizer) {
    case "none":
      content = (
        <InfoBanner title="File is already tokenized">
          <b className="font-semibold">{form.file.name}</b> is a CoNLL file, so tokenization is skipped. Found{" "}
          {sentences.length} sentences and {tokenCount} tokens.
          <br />
          You can still correct individual tokens in the annotation grid after import.
        </InfoBanner>
      );
      break;
    case "pipe":
      content = <PipeTokenizer />;
      break;
    default:
      content = (
        <InfoBanner title="oppaWord tokenizer selected">
          The corpus will be tokenized automatically using <b className="font-semibold">oppaWord</b>, a Burmese word
          segmenter. No manual editing is needed.
          <br />
          You can still correct individual tokens in the annotation grid after import.
        </InfoBanner>
      );
  }

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4 px-4 py-7 sm:px-10">
          <h2 className="text-[16px] font-bold leading-6">Tokenization</h2>
          {content}
        </div>
      </main>
      <WizardFooter onBack={() => navigate("/projects/new")} onNext={() => navigate("/projects/new/column-map")} />
    </>
  );
}
