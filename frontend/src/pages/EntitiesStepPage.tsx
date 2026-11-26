import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Check, X } from "@/components/icons";
import EntityTypePicker from "@/components/projects/EntityTypePicker";
import { useNewProject, type ProjectEntity } from "@/components/projects/NewProjectContext";
import WizardFooter from "@/components/projects/WizardFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENTITY_COLORS, ENTITY_TYPE_CATALOG, type EntityTypeOption } from "@/data/entityTypes";
import { cn } from "@/lib/utils";
import { MAX_LAYERS, mappedLayerCount } from "@/utils/columnMap";

// Layer badge colours: violet, cyan, then the remaining swatches
const LAYER_COLORS = ["#a78bfa", "#22d3ee", "#60a5fa", "#fbbf24", "#f472b6", "#34d399"];

const card = "rounded-12 border border-border bg-muted p-5";

function layerNote(i: number, total: number) {
  if (total === 1) return "Single layer";
  if (i === 0) return "Outermost span";
  if (i === total - 1) return `Innermost — inside Layer ${i}`;
  return `Inside Layer ${i}`;
}

function CustomEntityForm({
  initialCode,
  taken,
  onAdd,
  onCancel,
}: {
  initialCode: string;
  taken: Set<string>;
  onAdd: (o: EntityTypeOption) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initialCode.toUpperCase().replace(/[^A-Z0-9_]/g, ""));
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(ENTITY_COLORS[0]);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code) return setError("Enter a code.");
    if (taken.has(code)) return setError(`${code} already exists.`);
    if (!label.trim()) return setError("Enter a full label.");
    onAdd({ code, label: label.trim(), color });
  };

  return (
    <form onSubmit={submit} noValidate className="pt-4">
      <p className="pb-2 text-[11px] leading-[16.5px] text-muted-foreground">Add Custom Entity</p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          autoFocus
          aria-label="Entity code"
          value={code}
          maxLength={50}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""));
            setError("");
          }}
          placeholder="CODE"
          className="h-[41px] w-[90px] rounded-8 border-border bg-muted px-3.5 font-mono text-[13px]"
        />
        <Input
          aria-label="Full label"
          value={label}
          maxLength={100}
          onChange={(e) => {
            setLabel(e.target.value);
            setError("");
          }}
          placeholder="Full label"
          className="h-[41px] min-w-[160px] flex-1 rounded-8 border-border bg-muted px-3.5 text-[13px]"
        />
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Colour">
          {ENTITY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === color}
              aria-label={c}
              onClick={() => setColor(c)}
              className={cn(
                "size-[18px] rounded-full border-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                c === color ? "border-foreground" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button type="button" variant="ghost" size="lg" className="h-[38px] px-3 font-normal" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="h-[38px] px-4">
            Add
          </Button>
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] leading-[16.5px] text-destructive">{error}</p>}
    </form>
  );
}

export default function EntitiesStepPage() {
  const navigate = useNavigate();
  const {
    form,
    table,
    mapping,
    entities,
    setEntities,
    customTypes,
    setCustomTypes,
    layers,
    setLayers,
    layersTouched,
    setLayersTouched,
  } = useNewProject();
  const [customDraft, setCustomDraft] = useState<string | null>(null); // null = form closed
  const [submitted, setSubmitted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const catalog = useMemo(() => [...ENTITY_TYPE_CATALOG, ...customTypes], [customTypes]);
  const selected = useMemo(() => new Set(entities.map((e) => e.code)), [entities]);
  // layers the file already has tag columns for (step 3); the project needs at least these
  const mappedLayers = mappedLayerCount(mapping, form.mode);

  useEffect(() => {
    if (form.mode !== "nested" || mappedLayers === 0) return;
    if (!layersTouched || layers < mappedLayers) setLayers(mappedLayers);
    // only when the mapping changes; a manual pick is kept if it still fits
  }, [mappedLayers, form.mode]);

  if (!table) return <Navigate to="/projects/new" replace />;

  const nestedMode = form.mode === "nested";
  const layerCount = nestedMode ? layers : 1;
  const showError = submitted && entities.length === 0;

  const toggle = (o: EntityTypeOption) =>
    setEntities((prev) =>
      prev.some((e) => e.code === o.code) ? prev.filter((e) => e.code !== o.code) : [...prev, { ...o, nested: true }],
    );

  const update = (code: string, patch: Partial<ProjectEntity>) =>
    setEntities((prev) => prev.map((e) => (e.code === code ? { ...e, ...patch } : e)));

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-[17px] px-4 py-7 sm:px-10">
          <h2 className="text-[16px] font-bold leading-6">Entity Types &amp; Layers</h2>

          <section className={cn(card, showError && "border-destructive")}>
            <h3 className="text-[12px] font-bold leading-[18px]">Entity Types</h3>
            <EntityTypePicker
              catalog={catalog}
              selected={selected}
              onToggle={toggle}
              onCreateCustom={(q) => setCustomDraft(q)}
            />

            <p className="pt-4 text-[11px] leading-[16.5px] text-muted-foreground">Active ({entities.length})</p>
            <div ref={listRef} className="flex flex-col gap-[5px] pt-2">
              {entities.length === 0 && (
                <p className="rounded-7 border border-dashed border-border bg-white px-3 py-4 text-center text-[12px] text-muted-foreground">
                  No entity types yet. Use <b className="font-semibold text-primary">Add entity type</b> to pick some.
                </p>
              )}
              {entities.map((e) => (
                <div
                  key={e.code}
                  className="flex items-center gap-2.5 rounded-7 border border-border bg-white px-[11px] py-[7px]"
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: e.color }} />
                  <span className="w-[52px] shrink-0 truncate font-mono text-[11px] font-bold" style={{ color: e.color }}>
                    {e.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] leading-[18px]">{e.label}</span>
                  {nestedMode && (
                    <label className="flex shrink-0 cursor-pointer items-center gap-[5px] text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={e.nested}
                        onChange={(ev) => update(e.code, { nested: ev.target.checked })}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex size-[13px] items-center justify-center rounded-[2px] border peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
                          e.nested ? "border-primary bg-primary text-white" : "border-border bg-white",
                        )}
                      >
                        {e.nested && <Check size={10} strokeWidth={3} />}
                      </span>
                      Nested
                    </label>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${e.code}`}
                    onClick={() => toggle(e)}
                    className="shrink-0 rounded-4 p-0.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <X size={14} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
            {showError && (
              <p role="alert" className="mt-2 text-[11px] leading-[16.5px] text-destructive">
                Add at least one entity type.
              </p>
            )}

            {customDraft !== null && (
              <CustomEntityForm
                key={customDraft}
                initialCode={customDraft}
                taken={new Set(catalog.map((o) => o.code))}
                onCancel={() => setCustomDraft(null)}
                onAdd={(o) => {
                  setCustomTypes((prev) => [...prev, o]);
                  setEntities((prev) => [...prev, { ...o, nested: true }]);
                  setCustomDraft(null);
                }}
              />
            )}
          </section>

          {nestedMode && (
            <section className={card}>
              <h3 className="text-[12px] font-bold leading-[18px]">Nesting Layers</h3>
              <p className="pt-4 text-[11px] leading-[16.5px] text-muted-foreground" id="layer-count-label">
                Number of Nesting Layers
              </p>
              <div className="flex flex-wrap gap-2 pt-2.5" role="radiogroup" aria-labelledby="layer-count-label">
                {Array.from({ length: MAX_LAYERS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={n === layers}
                    disabled={n < mappedLayers}
                    title={n < mappedLayers ? `The file has tag columns for ${mappedLayers} layers` : undefined}
                    onClick={() => {
                      setLayers(n);
                      setLayersTouched(true);
                    }}
                    className={cn(
                      "flex size-[52px] items-center justify-center rounded-8 border-[1.5px] font-mono text-[18px] font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40",
                      n === layers
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white text-muted-foreground enabled:hover:bg-muted",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {mappedLayers > 0 && (
                <p className="pt-2 text-[11px] leading-[16.5px] text-muted-foreground">
                  Your file has tag columns for {mappedLayers} {mappedLayers === 1 ? "layer" : "layers"}, so the project
                  needs at least {mappedLayers}.
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2.5 rounded-8 border border-border bg-white px-4 py-3.5">
                {Array.from({ length: layerCount }, (_, i) => {
                  const c = LAYER_COLORS[i % LAYER_COLORS.length];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-[76px] shrink-0 rounded-5 border px-2.5 py-1 text-center font-mono text-[11px] font-bold leading-[16.5px]"
                        style={{ color: c, background: `${c}21`, borderColor: `${c}40` }}
                      >
                        Layer {i + 1}
                      </span>
                      <span className="h-px min-w-4 flex-1 bg-border" style={{ marginLeft: i * 16 }} />
                      <span className="shrink-0 text-[11px] leading-[16.5px] text-muted-foreground">
                        {layerNote(i, layerCount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <WizardFooter
        onBack={() => navigate("/projects/new/column-map")}
        onNext={() => {
          setSubmitted(true);
          if (entities.length === 0) {
            listRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
          navigate("/projects/new/batches");
        }}
      />
    </>
  );
}
