import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { useNewProject } from "@/components/projects/NewProjectContext";
import WizardFooter from "@/components/projects/WizardFooter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NOT_MAPPED, columnValues, mappingTargets } from "@/utils/columnMap";
import { looksLikeBioes } from "@/utils/importFile";

const PREVIEW_ROWS = 4;
const SAMPLE_CHIPS = 3;

const isBurmese = (s: string) => /[က-႟]/.test(s);

function Cell({ value, strong }: { value: string; strong?: boolean }) {
  return (
    <span
      className={cn(
        "block max-w-[220px] truncate",
        isBurmese(value) ? "font-burmese text-[13px]" : "font-mono text-[11px]",
        strong ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export default function ColumnMapStepPage() {
  const navigate = useNavigate();
  const { form, table, mapping, setMapping } = useNewProject();
  const [submitted, setSubmitted] = useState(false);

  const targets = useMemo(() => mappingTargets(form.mode), [form.mode]);
  const columns = useMemo(
    () =>
      (table?.columns ?? []).map((name, i) => {
        const values = table ? columnValues(table, i) : [];
        return { name, samples: values.filter(Boolean).slice(0, SAMPLE_CHIPS), bioes: looksLikeBioes(values) };
      }),
    [table],
  );

  if (!table) return <Navigate to="/projects/new" replace />;

  // ignore targets that no longer exist (e.g. switched nested -> flat)
  const targetOf = (col: string) => (targets.includes(mapping[col]) ? mapping[col] : NOT_MAPPED);
  const active = table.columns.filter((c) => targetOf(c) !== NOT_MAPPED);
  const tokenMapped = active.some((c) => targetOf(c) === "token");
  const showTokenError = submitted && !tokenMapped;

  // each platform field takes one column: picking a used field moves it here
  const assign = (col: string, target: string) =>
    setMapping((prev) => {
      const next: Record<string, string> = {};
      for (const [c, t] of Object.entries(prev)) if (t !== target && c !== col) next[c] = t;
      if (target !== NOT_MAPPED) next[col] = target;
      return next;
    });

  const tokenColumn = table.columns.find((c) => targetOf(c) === "token");

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-[22px] px-4 py-7 sm:px-10">
          <h2 className="text-[16px] font-bold leading-6">Column Mapping</h2>

          <section>
            <p className="text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.77px] text-muted-foreground">
              Data Preview — first {Math.min(PREVIEW_ROWS, table.rows.length)} rows
            </p>
            <div className="mt-2.5 overflow-x-auto rounded-10 border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted">
                    {table.columns.map((c) => (
                      <th
                        key={c}
                        className="whitespace-nowrap border-b border-border px-3.5 py-2 font-mono text-[10px] font-bold uppercase leading-[15px] tracking-[0.6px] text-muted-foreground"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, PREVIEW_ROWS).map((r, ri) => (
                    <tr key={ri} className={cn(ri % 2 === 1 && "bg-muted", "border-b border-border last:border-0")}>
                      {table.columns.map((c, ci) => (
                        <td key={c} className="whitespace-nowrap px-3.5 py-[7px] leading-[16.5px]">
                          <Cell value={r[ci] ?? ""} strong={c === tokenColumn} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <p className="text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.77px] text-muted-foreground">
              Column Mapping — match each file column to a platform field
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map(({ name, samples, bioes }) => {
                const target = targetOf(name);
                const mapped = target !== NOT_MAPPED;
                return (
                  <div
                    key={name}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-10 border-[1.5px] border-border",
                      mapped ? "bg-white" : "bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "flex-1 px-3.5 py-3",
                        mapped ? "bg-primary/10" : "border-b border-border bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-[7px]">
                        <code
                          className={cn(
                            "rounded-4 bg-track px-[7px] py-0.5 font-mono text-[12px] font-extrabold leading-[18px]",
                            mapped ? "text-primary" : "text-foreground",
                          )}
                        >
                          {name}
                        </code>
                        {bioes && (
                          <span className="rounded-3 bg-amber-500/15 px-[5px] py-px text-[9px] font-extrabold uppercase leading-[13.5px] tracking-[0.45px] text-amber-500">
                            BIOES
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-2">
                        {samples.map((v, i) => (
                          <span
                            key={i}
                            className="max-w-[100px] truncate rounded-3 border border-border bg-track px-1.5 py-px leading-[15px]"
                          >
                            <span
                              className={cn(
                                "text-muted-foreground",
                                isBurmese(v) ? "font-burmese text-[11px]" : "font-mono text-[10px]",
                              )}
                            >
                              {v}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white px-3.5 py-2.5">
                      <label
                        htmlFor={`map-${name}`}
                        className="block pb-1.5 text-[9px] font-semibold uppercase leading-[13.5px] tracking-[0.54px] text-muted-foreground"
                      >
                        Maps to
                      </label>
                      <Select value={target} onValueChange={(v) => assign(name, v)}>
                        <SelectTrigger
                          id={`map-${name}`}
                          className={cn(
                            "h-[33px] w-full rounded-7 px-3.5 font-mono text-[12px] [&>svg]:size-4 [&>svg]:opacity-100",
                            mapped
                              ? "border-transparent bg-primary/10 font-bold text-primary"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_MAPPED} className="font-mono text-[12px] text-muted-foreground">
                            — not mapped —
                          </SelectItem>
                          {targets.map((t) => (
                            <SelectItem key={t} value={t} className="font-mono text-[12px]">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3.5">
              <span className="text-[11px] leading-[16.5px] text-muted-foreground">Active:</span>
              {active.length === 0 && <span className="text-[11px] text-muted-foreground">none</span>}
              {active.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-[5px] rounded-6 border border-border bg-muted px-[9px] py-[3px] font-mono text-[11px] leading-[16.5px]"
                >
                  <b className="font-bold text-foreground">{c}</b>
                  <ArrowRight size={9} strokeWidth={2} className="text-muted-foreground" />
                  <span className="font-semibold text-primary">{targetOf(c)}</span>
                </span>
              ))}
            </div>
            {showTokenError && (
              <p role="alert" className="mt-2 text-[11px] leading-[16.5px] text-destructive">
                Map one column to token.
              </p>
            )}
          </section>

          <p className="text-[11px] leading-[17.6px] text-muted-foreground">
            This mapping is stored with the import. Original column names are preserved for re-export.
          </p>
        </div>
      </main>
      <WizardFooter
        onBack={() => navigate("/projects/new/tokenize")}
        onNext={() => {
          setSubmitted(true);
          if (tokenMapped) navigate("/projects/new/entities");
        }}
      />
    </>
  );
}
