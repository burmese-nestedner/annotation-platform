import { useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "@/components/icons";
import { Field, REQUIRED_MSG, fieldBase, fieldError } from "@/components/projects/FormField";
import { useNewProject, type NewProjectForm } from "@/components/projects/NewProjectContext";
import WizardFooter from "@/components/projects/WizardFooter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPES,
  ANNOTATION_MODES,
  LANGUAGE_OPTIONS,
  NO_TOKENIZER,
  TOKENIZER_OPTIONS,
} from "@/data/createProject";
import { boundariesFromTokens } from "@/utils/burmese";
import { suggestMapping } from "@/utils/columnMap";
import { readImport } from "@/utils/importFile";

type FormState = NewProjectForm;

type RequiredField = "name" | "language" | "tokenizer" | "mode" | "file";
type Errors = Partial<Record<RequiredField, string>>;

const isConllFile = (file: File) => file.name.toLowerCase().endsWith(".conll");

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = REQUIRED_MSG;
  if (!form.language) errors.language = REQUIRED_MSG;
  if (!form.tokenizer) errors.tokenizer = REQUIRED_MSG;
  if (!form.mode) errors.mode = REQUIRED_MSG;
  if (!form.file) errors.file = REQUIRED_MSG;
  return errors;
}

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevTokenizer = useRef("");
  const {
    form,
    setForm,
    setSentences,
    setPipes,
    parsedFile,
    setParsedFile,
    table,
    setTable,
    setMapping,
    mappingMode,
    setMappingMode,
  } = useNewProject();
  const [submitted, setSubmitted] = useState(false);
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // errors show only after the first Next, then update live
  const errors: Errors = submitted ? validate(form) : {};
  if (!errors.file && fileError) errors.file = fileError;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isConll = !!form.file && isConllFile(form.file);

  // .conll is already tokenized: force "none"; leaving conll restores the earlier choice
  const setFile = (file: File | null) => {
    setForm((f) => {
      let tokenizer = f.tokenizer;
      if (file && isConllFile(file)) {
        if (tokenizer !== NO_TOKENIZER.value) prevTokenizer.current = tokenizer;
        tokenizer = NO_TOKENIZER.value;
      } else if (tokenizer === NO_TOKENIZER.value) {
        tokenizer = prevTokenizer.current;
      }
      return { ...f, file, tokenizer };
    });
    setFileError("");
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const ok = ACCEPTED_FILE_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (ok) setFile(file);
    else setFileError(`Only ${ACCEPTED_FILE_TYPES.join(" and ")} files are accepted.`);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const scrollToError = () =>
    requestAnimationFrame(() =>
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );

  const onNext = async () => {
    setSubmitted(true);
    if (Object.keys(validate(form)).length > 0 || !form.file) return scrollToError();
    if (form.file === parsedFile && table) {
      // same file: keep sentences and pipe edits; re-suggest columns only if the mode changed
      if (form.mode !== mappingMode) {
        setMapping(suggestMapping(table, form.mode));
        setMappingMode(form.mode);
      }
      return navigate("tokenize");
    }
    setReading(true);
    try {
      const { sentences, table } = await readImport(form.file);
      if (sentences.length === 0) {
        setFileError("No sentences found in this file.");
        return scrollToError();
      }
      setSentences(sentences);
      setParsedFile(form.file);
      setTable(table);
      setMapping(suggestMapping(table, form.mode));
      setMappingMode(form.mode);
      setPipes(
        Object.fromEntries(sentences.map((s) => [s.id, s.tokens ? boundariesFromTokens(s.tokens) : []])),
      );
      navigate("tokenize");
    } catch {
      setFileError("Could not read this file.");
      scrollToError();
    } finally {
      setReading(false);
    }
  };

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onNext();
          }}
          id="create-project-form"
          className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-7 sm:px-10"
        >
          <h2 className="text-[16px] font-bold leading-6">Create Project</h2>

          <div className="flex flex-col gap-4">
            <Field id="project-name" label="Project Name" required error={errors.name}>
              <Input
                id="project-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Burmese-NestedNER v1"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "project-name-error" : undefined}
                className={cn(fieldBase, "h-[42px] px-3.5", errors.name && fieldError)}
              />
            </Field>

            <Field id="project-description" label="Description">
              <textarea
                id="project-description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short description of this annotation project…"
                rows={2}
                className={cn(
                  fieldBase,
                  "min-h-16 resize-y px-3.5 py-2.5 leading-[20.8px] outline-none placeholder:text-foreground/50",
                )}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="project-language" label="Language" required error={errors.language}>
                <Select value={form.language} onValueChange={(v) => update("language", v)}>
                  <SelectTrigger
                    id="project-language"
                    aria-invalid={!!errors.language}
                    aria-describedby={errors.language ? "project-language-error" : undefined}
                    className={cn(
                      fieldBase,
                      "h-[38.5px] w-full rounded-8 px-[19px] data-[placeholder]:text-foreground [&>svg]:size-5 [&>svg]:opacity-100",
                      errors.language && fieldError,
                    )}
                  >
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-[13px]">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                id="project-tokenizer"
                label="Tokenizer"
                required
                error={errors.tokenizer}
                hint={isConll ? "CoNLL files are already tokenized, so no tokenizer is needed." : undefined}
              >
                <Select
                  value={form.tokenizer}
                  onValueChange={(v) => update("tokenizer", v)}
                  disabled={isConll}
                >
                  <SelectTrigger
                    id="project-tokenizer"
                    aria-invalid={!!errors.tokenizer}
                    aria-describedby={
                      errors.tokenizer ? "project-tokenizer-error" : isConll ? "project-tokenizer-hint" : undefined
                    }
                    className={cn(
                      fieldBase,
                      "h-[38.5px] w-full rounded-8 px-[19px] data-[placeholder]:text-foreground [&>svg]:size-5 [&>svg]:opacity-100",
                      errors.tokenizer && fieldError,
                    )}
                  >
                    <SelectValue placeholder="Select Tokenizer" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKENIZER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-[13px]">
                        {o.label}
                      </SelectItem>
                    ))}
                    {/* only reachable via a .conll upload */}
                    <SelectItem value={NO_TOKENIZER.value} disabled className="text-[13px]">
                      {NO_TOKENIZER.label}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <Field label="Annotation Mode" required error={errors.mode}>
            <div role="radiogroup" aria-invalid={!!errors.mode} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ANNOTATION_MODES.map((m) => {
                const checked = form.mode === m.value;
                return (
                  <label
                    key={m.value}
                    className={cn(
                      "cursor-pointer rounded-10 border border-border bg-muted px-4 py-3.5 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
                      checked && "border-primary bg-primary/5",
                      errors.mode && fieldError,
                    )}
                  >
                    <input
                      type="radio"
                      name="annotation-mode"
                      value={m.value}
                      checked={checked}
                      onChange={() => update("mode", m.value)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border border-border bg-white",
                          checked && "border-primary",
                        )}
                      >
                        {checked && <span className="size-2 rounded-full bg-primary" />}
                      </span>
                      <span className="text-[13px] font-bold leading-[19.5px]">{m.label}</span>
                    </span>
                    <span className="mt-[5px] block pl-6 text-[11px] leading-[16.5px] text-muted-foreground">
                      {m.description}
                    </span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field label="Data File" required error={errors.file}>
            <div
              role="button"
              tabIndex={0}
              aria-invalid={!!errors.file}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2.5 rounded-10 border border-border bg-muted px-5 py-7 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                dragging && "border-primary bg-primary/5",
                errors.file && fieldError,
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-10 bg-track text-muted-foreground">
                <Upload size={20} strokeWidth={1.5} />
              </span>
              {form.file ? (
                <span className="flex items-center gap-2 text-[13px] font-semibold leading-[19.5px]">
                  <span className="break-all">{form.file.name}</span>
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-4 p-0.5 text-muted-foreground hover:bg-track hover:text-foreground"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </span>
              ) : (
                <span className="text-[13px] font-semibold leading-[19.5px]">
                  Drop your data file here, or <span className="text-primary">browse</span>
                </span>
              )}
              <span className="text-[11px] leading-[16.5px] text-muted-foreground">
                Accepted formats: {ACCEPTED_FILE_TYPES.join(" · ")}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES.join(",")}
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
          </Field>
        </form>
      </main>

      <WizardFooter nextForm="create-project-form" nextDisabled={reading} />
    </>
  );
}
