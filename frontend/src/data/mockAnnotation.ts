import type { EntityType, Sentence, ValidationError } from "../types/annotation";

export const ENTITY_TYPES: EntityType[] = [
  { code: "ORG", tone: "violet" },
  { code: "PER", tone: "blue" },
  { code: "GPE", tone: "amber" },
  { code: "LOC", tone: "green" },
  { code: "FAC", tone: "pink" },
  { code: "EVENT", tone: "red" },
  { code: "TITLE", tone: "cyan" },
];

const row = (text: string, ...tags: string[]) => ({ text, tags });

export const MOCK_SENTENCES: Sentence[] = [
  {
    id: "SENT-1",
    text: "ဆမ်ဆောင်းကုမ္ပဏီသည် တောင်ကိုရီးယားနိုင်ငံ ဆိုးလ်မြို့တွင် တည်ရှိသည်။",
    tokens: [
      row("ဆမ်ဆောင်း", "B-ORG", "O", "O"),
      row("ကုမ္ပဏီ", "E-ORG", "O", "O"),
      row("တောင်ကိုရီးယားနိုင်ငံ", "B-GPE", "O", "O"),
      row("ဆိုးလ်မြို့", "E-GPE", "S-LOC", "O"),
      row("တွင်", "O", "O", "O"),
      row("တည်ရှိသည်", "O", "O", "O"),
    ],
  },
  {
    id: "SENT-2",
    text: "ဦးဇော်မင်းသည် ရန်ကုန်မြို့တွင် နှစ်ပေါင်းများစွာ နေထိုင်ခဲ့သည်။",
    tokens: [
      row("ဦး", "B-TITLE", "O", "O"),
      row("ဇော်မင်း", "E-TITLE", "S-PER", "O"),
      row("သည်", "O", "O", "O"),
      row("ရန်ကုန်မြို့", "S-GPE", "S-LOC", "O"),
      row("တွင်", "O", "O", "O"),
      row("နေထိုင်ခဲ့သည်", "O", "O", "O"),
    ],
  },
  {
    id: "SENT-3",
    text: "ကုလသမဂ္ဂ၏ ရုံးချုပ်သည် နယူးယောက်မြို့တွင် တည်ရှိသည်။",
    tokens: [
      row("ကုလသမဂ္ဂ", "B-ORG", "O", "O"),
      row("ရုံးချုပ်", "E-ORG", "O", "O"),
      row("နယူးယောက်မြို့", "S-GPE", "S-LOC", "O"),
      row("တွင်", "O", "O", "O"),
      row("တည်ရှိသည်", "O", "O", "O"),
    ],
  },
];

export const MOCK_ERRORS: ValidationError[] = [
  {
    sentenceId: "SENT-2",
    tokenIndex: 1,
    layer: 0,
    message: 'Invalid tag "E-TITLE". Check the BIOES sequence: B → I → E, or S for a single-token entity.',
  },
];

export const LAYERS = [
  { label: "Layer 1 (Outer)", tone: "violet" },
  { label: "Layer 2 (Inner)", tone: "cyan" },
  { label: "Layer 3", tone: "pink" },
] as const;
