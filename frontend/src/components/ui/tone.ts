export type Tone = "primary" | "violet" | "blue" | "cyan" | "amber" | "pink" | "red" | "green";

export const toneClass = (tone: Tone): string => `tone-${tone}`;
