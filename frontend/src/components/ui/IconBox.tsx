import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "./tone";

interface IconBoxProps {
  tone: Tone;
  children: ReactNode;
}

export default function IconBox({ tone, children }: IconBoxProps) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-10 border border-[color:var(--tone-border)] bg-[var(--tone-bg)] text-[color:var(--tone-color)]",
        toneClass(tone),
      )}
    >
      {children}
    </span>
  );
}
