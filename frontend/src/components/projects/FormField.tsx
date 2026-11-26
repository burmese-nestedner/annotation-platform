import type { ReactNode } from "react";

export const REQUIRED_MSG = "This field is required.";

export const fieldBase = "rounded-8 border border-border bg-muted text-[13px] text-foreground";
// error state: red border only, background unchanged
export const fieldError = "border-destructive";

/** Uppercase label + control + error (or hint) line, as in the Create Project form. */
export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const LabelTag = id ? "label" : "span";
  return (
    <div className="flex min-w-0 flex-col">
      <LabelTag
        htmlFor={id}
        className="pb-[7px] text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.77px] text-muted-foreground"
      >
        {label}
        {required && "*"}
      </LabelTag>
      {children}
      {error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-[11px] leading-[16.5px] text-destructive">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={id ? `${id}-hint` : undefined} className="mt-1 text-[11px] leading-[16.5px] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
