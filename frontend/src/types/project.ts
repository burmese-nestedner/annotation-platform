import type { Tone } from "../components/ui/tone";

export type NerMode = "flat" | "nested";

export interface Annotator {
  id: string;
  name: string;
  initials: string;
  tone: Tone;
}

export interface Project {
  id: string;
  name: string;
  mode: NerMode;
  layers: number;
  tokenizer: string;
  description: string;
  stats: { sentences: number; batches: number; entityTypes: number };
  completion: number;
  annotators: Annotator[];
}

export interface User {
  name: string;
  initials: string;
  role: string;
}
