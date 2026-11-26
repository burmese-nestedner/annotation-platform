import { Check } from "@/components/icons";
import { cn } from "@/lib/utils";

interface WizardStepperProps {
  steps: string[];
  current: number; // 0-based
}

export default function WizardStepper({ steps, current }: WizardStepperProps) {
  const inset = `${50 / steps.length}%`;
  const progress = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;

  return (
    <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {/* track runs between the first and last circle centres */}
      <div className="absolute top-[15px] h-0.5 bg-border" style={{ left: inset, right: inset }} aria-hidden>
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="relative flex flex-col items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-[30px] items-center justify-center rounded-full border-[1.5px] font-mono text-[11px] font-bold leading-[16.5px]",
                active && "border-primary bg-white text-primary shadow-[0_0_0_4px_rgba(0,158,130,0.1)]",
                done && "border-primary bg-primary text-white",
                !active && !done && "border-border bg-track text-muted-foreground",
              )}
            >
              {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
            </span>
            <span
              className={cn(
                "text-center text-[10px] leading-[15px]",
                active && "font-bold text-primary",
                done && "font-bold text-foreground",
                !active && !done && "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
