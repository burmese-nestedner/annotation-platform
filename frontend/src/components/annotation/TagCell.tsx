import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toneClass, type Tone } from "@/components/ui/tone";
import { isOutside, prefixOf } from "@/utils/tags";
import { cn } from "@/lib/utils";

interface TagCellProps {
  tag: string;
  tone?: Tone;
  error?: boolean;
  popover?: { open: boolean; onOpenChange: (open: boolean) => void; content: ReactNode };
}

export default function TagCell({ tag, tone, error = false, popover }: TagCellProps) {
  const outside = isOutside(tag);

  const box = (
    <button
      type="button"
      data-error={error || undefined}
      className={cn(
        "flex w-full min-w-[90px] items-center gap-1 rounded-4 border border-border bg-muted px-2 py-1 text-left",
        tone && toneClass(tone),
        error && "border-destructive bg-destructive/10",
      )}
    >
      {!outside && tone && <span className="size-1.5 rounded-full bg-[var(--tone-color)]" />}
      <span
        className={cn(
          "font-mono text-[11px] font-semibold leading-[16.5px]",
          outside
            ? "text-muted-foreground"
            : error
              ? "text-destructive"
              : prefixOf(tag) === "S"
                ? "text-tag-single"
                : "text-tag-begin",
        )}
      >
        {tag}
      </span>
      {error && <TriangleAlert className="ml-auto size-2.5 text-destructive" strokeWidth={1.5} />}
    </button>
  );

  return (
    <div className="flex h-full items-center px-1 py-0.5">
      {popover ? (
        <Popover open={popover.open} onOpenChange={popover.onOpenChange}>
          <PopoverTrigger asChild>{box}</PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={16}
            collisionPadding={8}
            className="group relative w-[clamp(14rem,42vw,20rem)] max-w-[var(--radix-popover-content-available-width)] px-3.5"
          >
            {popover.content}
          </PopoverContent>
        </Popover>
      ) : (
        box
      )}
    </div>
  );
}
