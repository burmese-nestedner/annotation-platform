import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AnnotationGrid from "../components/annotation/AnnotationGrid";
import EntityLegend from "../components/annotation/EntityLegend";
import StatusBar from "../components/annotation/StatusBar";
import { Button } from "@/components/ui/button";
import AlertPill from "../components/ui/AlertPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENTITY_TYPES, MOCK_SENTENCES } from "../data/mockAnnotation";
import { layerColumns } from "../utils/tags";
import type { Project } from "../types/project";
import type { Sentence } from "../types/annotation";
import { validateBioes } from "@/utils/bioes";

const ENTITY_CODES = new Set(ENTITY_TYPES.map((e) => e.code));

export default function AnnotationPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [sentenceId, setSentenceId] = useState("all");
  // editable copy of the mock data until the annotations API exists
  const [data, setData] = useState<Sentence[]>(MOCK_SENTENCES);

  const layers = useMemo(() => layerColumns(project.layers), [project.layers]);
  const sentences = useMemo(
    () => data.filter((s) => sentenceId === "all" || s.id === sentenceId),
    [data, sentenceId],
  );
  // real-time BIOES check over what is shown
  const errors = useMemo(
    () => validateBioes(sentences, project.layers, ENTITY_CODES),
    [sentences, project.layers],
  );

  const setTag = (sid: string, tokenIndex: number, layer: number, tag: string) =>
    setData((prev) =>
      prev.map((s) =>
        s.id !== sid
          ? s
          : {
              ...s,
              tokens: s.tokens.map((t, i) =>
                i !== tokenIndex ? t : { ...t, tags: t.tags.map((g, l) => (l === layer ? tag : g)) },
              ),
            },
      ),
    );
  const tokenCount = sentences.reduce((n, s) => n + s.tokens.length, 0);

  return (
    <>
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 sm:px-5">
        <div className="min-w-[12rem] flex-1">
          <h1 className="text-[15px] font-bold leading-[22.5px]">Annotation Grid</h1>
          <p className="pt-px text-[11px] text-muted-foreground">
            {project.name} · Batch: IAA Pilot Batch 1 · Annotator: jomsuda
          </p>
        </div>
        {errors.length > 0 && (
          <AlertPill>
            {errors.length} BIOES {errors.length === 1 ? "error" : "errors"}
          </AlertPill>
        )}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          Sentence:
          <Select value={sentenceId} onValueChange={setSentenceId}>
            <SelectTrigger size="sm" aria-label="Sentence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {data.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm">Save</Button>
      </header>

      <EntityLegend entities={ENTITY_TYPES} hint="Click a cell to change its tag · Hover a red cell to see the error" />

      <div className="@container flex-1 overflow-auto">
        <AnnotationGrid
          sentences={sentences}
          layers={layers}
          entities={ENTITY_TYPES}
          errors={errors}
          onTagChange={setTag}
        />
      </div>

      <StatusBar
        tokenCount={tokenCount}
        errorCount={errors.length}
        lastSaved="14:32:07"
        info={`Tokenizer: ${project.tokenizer} · Mode: ${project.mode} (${project.layers} ${
          project.layers === 1 ? "layer" : "layers"
        })`}
      />
    </>
  );
}
