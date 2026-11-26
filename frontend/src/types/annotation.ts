import type { Tone } from "../components/ui/tone";

export interface EntityType {
  code: string;
  tone: Tone;
}

export interface TokenRow {
  text: string;
  tags: string[];
}

export interface Sentence {
  id: string;
  text: string;
  tokens: TokenRow[];
}

export interface ValidationError {
  sentenceId: string;
  tokenIndex: number;
  layer: number;
  message: string;
}
