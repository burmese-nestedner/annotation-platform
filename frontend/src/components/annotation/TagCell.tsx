import { useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toneClass, type Tone } from "@/components/ui/tone";
import { isOutside, prefixOf } from "@/utils/tags";
import { cn } from "@/lib/utils";
import type { EntityType } from "@/types/annotation";
import ErrorPopover from "./ErrorPopover";
import TagEditor from "./TagEditor";

interface TagCellProps {
  tag: string;
  tone?: Tone;
  entities: EntityType[];
  location: string; // "SENT-2 · Token 2 · Layer 1"
  error?: string; // live BIOES message for this cell
  onChange: (tag: string) => void;
}

const HOVER_CLOSE_DELAY = 80; // avoids flicker when moving inside the cell

/**
 * One tag cell. Click -> tag dropdown. Hover / focus an error cell -> error popover
 * (centred under the cell, as in Figma "Error Popover").
 */
export default function TagCell({ tag, tone, entities, location, error, onChange }: TagCellProps) {
  const outside = isOutside(tag);
  const [editing, setEditing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showError = () => {
    window.clearTimeout(timer.current);
    if (error && !editing) setHovering(true);
  };
  const hideError = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHovering(false), HOVER_CLOSE_DELAY);
  };

  return (
    <div className="flex h-full items-center px-1 py-0.5">
      <Popover open={!!error && hovering && !editing} onOpenChange={(o) => !o && setHovering(false)}>
        <PopoverAnchor asChild>
          <div className="w-full" onMouseEnter={showError} onMouseLeave={hideError}>
            <Popover
              open={editing}
              onOpenChange={(o) => {
                setEditing(o);
                if (o) setHovering(false);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-error={error ? true : undefined}
                  aria-label={`${location}: ${tag}${error ? " (error)" : ""}. Change tag`}
                  onFocus={showError}
                  onBlur={hideError}
                  className={cn(
                    "flex w-full min-w-[90px] items-center gap-1 rounded-4 border border-border bg-muted px-2 py-1 text-left outline-none hover:border-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:border-primary",
                    tone && toneClass(tone),
                    error && "border-destructive bg-destructive/10 hover:border-destructive",
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
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="start"
                sideOffset={4}
                collisionPadding={8}
                className="w-[min(280px,calc(100vw-16px))] overflow-hidden p-0 shadow-[var(--shadow-popover)]"
              >
                <TagEditor
                  tag={tag}
                  entities={entities}
                  error={error}
                  onPick={(t) => {
                    if (t !== tag) onChange(t);
                    setEditing(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </PopoverAnchor>
        {error && (
          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={16}
            collisionPadding={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            // read-only hint: let clicks reach the cells it covers (Radix's positioning wrapper too)
            ref={(el) => {
              if (el?.parentElement) el.parentElement.style.pointerEvents = "none";
            }}
            className="group pointer-events-none relative w-[clamp(14rem,42vw,20rem)] max-w-[var(--radix-popover-content-available-width)] px-3.5"
          >
            <ErrorPopover location={location} message={error} />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
