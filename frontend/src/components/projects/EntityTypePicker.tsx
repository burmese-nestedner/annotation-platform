import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { EntityTypeOption } from "@/data/entityTypes";
import { cn } from "@/lib/utils";

interface EntityTypePickerProps {
  catalog: EntityTypeOption[];
  selected: Set<string>; // codes
  onToggle: (option: EntityTypeOption) => void;
  onCreateCustom: (query: string) => void;
}

/** "Add entity type" button + searchable multi-select dropdown (Figma 179:22). */
export default function EntityTypePicker({ catalog, selected, onToggle, onCreateCustom }: EntityTypePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((o) => o.code.toLowerCase().includes(q) || o.label.toLowerCase().includes(q));
  }, [catalog, query]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2.5">
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-6 border-[1.5px] bg-white px-3 py-[7px] text-[12px] font-semibold leading-[16.5px] text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              open ? "border-primary" : "border-border hover:bg-muted",
            )}
          >
            <Plus size={15} strokeWidth={1.5} className="text-muted-foreground" />
            Add entity type
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(380px,calc(100vw-32px))] overflow-hidden p-0 shadow-[var(--shadow-popover)]">
          <div className="px-2 pb-1 pt-2">
            <label className="flex items-center gap-2 rounded-8 border border-border bg-muted px-2.5 py-[9px]">
              <Search size={14} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search code or name…"
                aria-label="Search entity types"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-foreground/50"
              />
            </label>
          </div>
          <div className="flex justify-between px-3 pb-1 pt-1.5 text-[11px] leading-[16.5px]">
            <span className="text-muted-foreground">
              {query ? `${filtered.length} of ${catalog.length}` : catalog.length} entity types
            </span>
            <span className="font-semibold text-primary">{selected.size} selected</span>
          </div>

          <div className="max-h-[288px] overflow-y-auto px-3 pb-1" role="listbox" aria-multiselectable>
            {filtered.map((o) => {
              const on = selected.has(o.code);
              return (
                <button
                  key={o.code}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => onToggle(o)}
                  className="flex w-full items-center gap-2.5 rounded-6 px-2.5 py-[7px] text-left outline-none hover:bg-muted focus-visible:bg-muted"
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-4 border",
                      on ? "border-primary bg-primary text-white" : "border-border bg-white",
                    )}
                  >
                    {on && <Check size={10} strokeWidth={3} />}
                  </span>
                  <span className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />
                  <span className="w-[72px] shrink-0 truncate font-mono text-[11px] font-bold" style={{ color: o.color }}>
                    {o.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{o.label}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-2.5 py-6 text-center text-[12px] text-muted-foreground">
                No entity types match “{query.trim()}”.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <button
              type="button"
              onClick={() => {
                onCreateCustom(query.trim());
                setOpen(false);
                setQuery("");
              }}
              className="flex items-center gap-1.5 rounded-4 text-[12px] font-semibold text-primary outline-none hover:underline focus-visible:underline"
            >
              <Plus size={14} strokeWidth={1.75} />
              Create custom entity
            </button>
            <PopoverClose asChild>
              <Button size="sm" className="h-7 px-3.5 text-[12px] font-bold">
                Done
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <span className="text-[11px] text-muted-foreground">
        Search and pick from {catalog.length} entity types
      </span>
    </div>
  );
}
