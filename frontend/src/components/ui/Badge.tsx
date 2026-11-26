import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "./tone";

interface BadgeProps {
  tone?: Tone;
  className?: string;
  size?: "md" | "sm";
  children: ReactNode;
}

const MD =
  "inline-flex items-center whitespace-nowrap rounded-4 border border-[color:var(--tone-border)] bg-[var(--tone-bg)] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase leading-[13.5px] text-[color:var(--tone-color)]";
const SM =
  "inline-flex items-center whitespace-nowrap rounded-3 bg-[var(--tone-bg)] px-[5px] py-px font-mono text-[8px] font-bold uppercase leading-[12px] tracking-[0.4px] text-[color:var(--tone-color)]";

export default function Badge({ tone = "violet", size = "md", className, children }: BadgeProps) {
  return <span className={cn(size === "sm" ? SM : MD, toneClass(tone), className)}>{children}</span>;
}
