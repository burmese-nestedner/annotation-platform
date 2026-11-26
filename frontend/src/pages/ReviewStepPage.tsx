import { Navigate, useNavigate } from "react-router-dom";
import { useNewProject } from "@/components/projects/NewProjectContext";
import WizardFooter from "@/components/projects/WizardFooter";
import { ANNOTATION_MODES, LANGUAGE_OPTIONS, NO_TOKENIZER, TOKENIZER_OPTIONS } from "@/data/createProject";
import { NOT_MAPPED, mappingTargets } from "@/utils/columnMap";

const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-8 border border-border bg-muted px-4 py-3">
      <p className="text-[10px] uppercase leading-[15px] tracking-[0.7px] text-muted-foreground">{label}</p>
      <p className="truncate pt-1 text-[13px] font-bold leading-[19.5px]" title={value}>
        {value}
      </p>
    </div>
  );
}

export default function ReviewStepPage() {
  const navigate = useNavigate();
  const { form, table, mapping, entities, layers } = useNewProject();

  if (!table || !form.file) return <Navigate to="/projects/new" replace />;

  const nested = form.mode === "nested";
  const modeLabel = ANNOTATION_MODES.find((m) => m.value === form.mode)?.label ?? form.mode;
  const tokenizer =
    [...TOKENIZER_OPTIONS, NO_TOKENIZER].find((t) => t.value === form.tokenizer)?.label ?? form.tokenizer;
  const language = LANGUAGE_OPTIONS.find((l) => l.value === form.language)?.label ?? form.language;
  const ext = form.file.name.split(".").pop()?.toUpperCase() ?? "";
  const targets = mappingTargets(form.mode);
  const mapped = Object.values(mapping).filter((t) => t !== NOT_MAPPED && targets.includes(t)).length;

  const create = () => {
    // TODO: POST to the projects API once the backend exists
    navigate("/", { state: { createdProject: form.name.trim() } });
  };

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5 px-4 py-7 sm:px-10">
          <h2 className="text-[16px] font-bold leading-6">Review &amp; Create</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SummaryItem label="Project Name" value={form.name.trim()} />
            <SummaryItem label="Language" value={language} />
            <SummaryItem label="Annotation Mode" value={nested ? `${modeLabel} (${plural(layers, "layer")})` : modeLabel} />
            <SummaryItem label="Tokenizer" value={tokenizer} />
            <SummaryItem label="Entity Types" value={plural(entities.length, "type")} />
            {/* batches are out of scope this term */}
            <SummaryItem label="Batches" value="-" />
            <SummaryItem label="Data File" value={`${form.file.name} (${ext})`} />
            <SummaryItem label="Column Mapping" value={`${plural(mapped, "column")} mapped`} />
          </div>

          <section className="rounded-10 border border-border bg-muted p-[18px]">
            <h3 className="text-[12px] font-bold leading-[18px]">Entity Types</h3>
            <div className="flex flex-wrap gap-[7px] pt-3">
              {entities.map((e) => (
                <span
                  key={e.code}
                  title={e.label}
                  className="rounded-5 border px-[9px] py-[2.5px] font-mono text-[11px] font-bold leading-[16.5px]"
                  style={{ color: e.color, background: `${e.color}17`, borderColor: `${e.color}36` }}
                >
                  {e.code}
                  {nested && e.nested && <span className="opacity-60">⁺</span>}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
      <WizardFooter onBack={() => navigate("/projects/new/batches")} onNext={create} nextLabel="Create Project" />
    </>
  );
}
