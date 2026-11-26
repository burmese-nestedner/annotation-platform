import { useMemo, useState } from "react";
import { Check, Search, TriangleAlert } from "@/components/icons";
import { toneClass } from "@/components/ui/tone";
import { cn } from "@/lib/utils";
import { parseTag, type Prefix } from "@/utils/bioes";
import type { EntityType } from "@/types/annotation";

const PREFIXES: { value: Prefix; label: string }[] = [
  { value: "B", label: "Begin" },
  { value: "I", label: "Inside" },
  { value: "E", label: "End" },
  { value: "S", label: "Single" },
];

const SEARCH_FROM = 8; // show a search box once the list gets long

interface TagEditorProps {
  tag: string;
  entities: EntityType[];
  error?: string;
  onPick: (tag: string) => void;
}

/** Dropdown for one tag cell: pick a BIOES prefix, then an entity type (or O). */
export default function TagEditor({ tag, entities, error, onPick }: TagEditorProps) {
  const current = parseTag(tag);
  const [prefix, setPrefix] = useState<Prefix>(current && current.prefix !== "O" ? current.prefix : "B");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entities;
    return entities.filter((e) => e.code.toLowerCase().includes(q) || e.label.toLowerCase().includes(q));
  }, [entities, query]);

  return (
    <div className="flex flex-col">
      {error && (
        <div className="flex gap-2 border-b border-border bg-destructive/5 px-3 py-2 text-[11px] leading-[16.5px] text-destructive">
          <TriangleAlert size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 px-3 pb-2 pt-2.5">
        <div className="flex gap-1" role="radiogroup" aria-label="BIOES prefix">
          {PREFIXES.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={prefix === p.value}
              title={p.label}
              onClick={() => setPrefix(p.value)}
              className={cn(
                "flex flex-1 flex-col items-center rounded-6 border py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                prefix === p.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="font-mono text-[12px] font-bold leading-4">{p.value}</span>
              <span className="text-[9px] leading-3">{p.label}</span>
            </button>
          ))}
        </div>
        {entities.length >= SEARCH_FROM && (
          <label className="flex items-center gap-2 rounded-8 border border-border bg-muted px-2.5 py-1.5">
            <Search size={13} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entity type…"
              aria-label="Search entity types"
              className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-foreground/50"
            />
          </label>
        )}
      </div>

      <div className="max-h-[240px] overflow-y-auto border-t border-border p-1" role="listbox" aria-label="Tag">
        <TagOption selected={tag === "O"} onClick={() => onPick("O")}>
          <span className="w-[72px] shrink-0 font-mono text-[11px] font-bold text-muted-foreground">O</span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">Outside (no entity)</span>
        </TagOption>
        {list.map((e) => {
          const value = `${prefix}-${e.code}`;
          return (
            <TagOption key={e.code} selected={tag === value} onClick={() => onPick(value)} className={toneClass(e.tone)}>
              <span className="size-2 shrink-0 rounded-full bg-[var(--tone-color)]" />
              <span className="w-[60px] shrink-0 truncate font-mono text-[11px] font-bold text-[color:var(--tone-color)]">
                {value}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{e.label}</span>
            </TagOption>
          );
        })}
        {list.length === 0 && (
          <p className="px-2.5 py-4 text-center text-[12px] text-muted-foreground">No entity types match.</p>
        )}
      </div>
    </div>
  );
}

function TagOption({
  selected,
  onClick,
  className,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-6 px-2.5 py-1.5 text-left outline-none hover:bg-muted focus-visible:bg-muted",
        selected && "bg-primary/5",
        className,
      )}
    >
      {children}
      <Check size={12} strokeWidth={2.5} className={cn("shrink-0 text-primary", !selected && "invisible")} />
    </button>
  );
}
