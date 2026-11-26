import type { Tone } from "../components/ui/tone";
import type { EntityType } from "../types/annotation";

export const isOutside = (tag: string): boolean => tag === "O";

export const entityOf = (tag: string): string => tag.split("-")[1] ?? "";

export const toneOf = (tag: string, entities: EntityType[]): Tone | undefined =>
  entities.find((e) => e.code === entityOf(tag))?.tone;

export const prefixOf = (tag: string): string => tag.split("-")[0] ?? "";

const LAYER_TONES: Tone[] = ["violet", "cyan", "pink", "blue", "amber", "green"];

/** One grid column per layer; any count (layer count is per project, never fixed). */
export function layerColumns(count: number): { label: string; tone: Tone }[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const where = count > 1 && i === 0 ? " (Outer)" : count > 1 && i === count - 1 ? " (Inner)" : "";
    return { label: `Layer ${n}${where}`, tone: LAYER_TONES[i % LAYER_TONES.length] };
  });
}
