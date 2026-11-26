import type { Tone } from "../components/ui/tone";
import type { EntityType } from "../types/annotation";

export const isOutside = (tag: string): boolean => tag === "O";

export const entityOf = (tag: string): string => tag.split("-")[1] ?? "";

export const toneOf = (tag: string, entities: EntityType[]): Tone | undefined =>
  entities.find((e) => e.code === entityOf(tag))?.tone;

export const prefixOf = (tag: string): string => tag.split("-")[0] ?? "";
