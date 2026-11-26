// Mock options until the API exists.
export const LANGUAGE_OPTIONS = [
  { value: "my", label: "Burmese" },
  { value: "en", label: "English" },
];

export const TOKENIZER_OPTIONS = [
  { value: "oppaword", label: "oppaWord (default)" },
  { value: "pipe", label: "Pipe-delimited ( | )" },
];

// Set automatically for .conll files (already tokenized).
export const NO_TOKENIZER = { value: "none", label: "None (pre-tokenized)" };

export const ANNOTATION_MODES = [
  { value: "flat", label: "Flat NER", description: "Single layer. One BIOES tag per token." },
  {
    value: "nested",
    label: "Nested NER",
    description: "Multiple nested layers. Inner entities contained within outer spans.",
  },
] as const;

export const WIZARD_STEPS = ["Create", "Tokenize", "Column Map", "Entities & Layers", "Batches", "Review"];

export const ACCEPTED_FILE_TYPES = [".csv", ".conll"];
