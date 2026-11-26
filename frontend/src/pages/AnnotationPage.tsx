import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import AnnotationGrid from "../components/annotation/AnnotationGrid";
import EntityLegend from "../components/annotation/EntityLegend";
import StatusBar from "../components/annotation/StatusBar";
import { Button } from "@/components/ui/button";
import AlertPill from "../components/ui/AlertPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENTITY_TYPES, LAYERS, MOCK_ERRORS, MOCK_SENTENCES } from "../data/mockAnnotation";
import type { Project } from "../types/project";

export default function AnnotationPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [sentenceId, setSentenceId] = useState("all");

  const layers = LAYERS.slice(0, project.layers);
  const sentences = MOCK_SENTENCES.filter((s) => sentenceId === "all" || s.id === sentenceId);
  const errors = MOCK_ERRORS.filter((e) => e.layer < project.layers);
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
              {MOCK_SENTENCES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm">Save</Button>
      </header>

      <EntityLegend entities={ENTITY_TYPES} hint="Click a cell to edit · Errors highlighted in red" />

      <div className="@container flex-1 overflow-auto">
        <AnnotationGrid sentences={sentences} layers={[...layers]} entities={ENTITY_TYPES} errors={errors} />
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
