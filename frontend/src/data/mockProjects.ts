import type { Annotator, Project, User } from "../types/project";

export const MOCK_USER: User = { name: "Jomsuda Nakyai", initials: "JN", role: "owner" };

const annotators: Annotator[] = [
  { id: "j", name: "Jomsuda", initials: "J", tone: "amber" },
  { id: "h", name: "Hein", initials: "H", tone: "blue" },
  { id: "p", name: "Pyae", initials: "P", tone: "violet" },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "burmese-nestedner-v1",
    name: "Burmese-NestedNER v1",
    mode: "nested",
    layers: 3,
    tokenizer: "oppaWord",
    description:
      "Multi-layer nested NER annotation project with 3 annotators, 3 layers, and 18 entity types.",
    stats: { sentences: 4918, batches: 5, entityTypes: 7 },
    completion: 60,
    annotators,
  },
  {
    id: "burmese-ner-flat-reference",
    name: "BurmeseNER Flat Reference",
    mode: "flat",
    layers: 1,
    tokenizer: "oppaWord",
    description: "Flat-NER baseline for comparison with 18 entity types and Fleiss κ = 0.9408.",
    stats: { sentences: 4918, batches: 1, entityTypes: 5 },
    completion: 100,
    annotators,
  },
];

export const getProject = (id: string): Project | undefined =>
  MOCK_PROJECTS.find((p) => p.id === id);
