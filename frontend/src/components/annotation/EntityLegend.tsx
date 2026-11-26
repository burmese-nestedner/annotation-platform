import EntityChip from "../ui/EntityChip";
import type { EntityType } from "../../types/annotation";

const TEXT = "text-[10px] text-muted-foreground";

export default function EntityLegend({ entities, hint }: { entities: EntityType[]; hint?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2 sm:px-5">
      <span className={`${TEXT} uppercase tracking-[0.6px]`}>Entity Types:</span>
      {entities.map((e) => (
        <EntityChip key={e.code} code={e.code} tone={e.tone} />
      ))}
      {hint && <span className={`${TEXT} ml-auto`}>{hint}</span>}
    </div>
  );
}
