import { toneClass, type Tone } from "./tone";
import { cn } from "@/lib/utils";

export default function EntityChip({ code, tone }: { code: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "rounded-4 border border-[color:color-mix(in_srgb,var(--tone-color)_21%,transparent)] bg-[color-mix(in_srgb,var(--tone-color)_9%,transparent)] px-[7px] py-0.5 font-mono text-[10px] font-bold leading-[15px] text-[color:var(--tone-color)]",
        toneClass(tone),
      )}
    >
      {code}
    </span>
  );
}
