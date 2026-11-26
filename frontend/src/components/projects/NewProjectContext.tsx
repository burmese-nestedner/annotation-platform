import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { EntityTypeOption } from "@/data/entityTypes";
import type { ImportedSentence, ImportedTable } from "@/utils/importFile";

export interface ProjectEntity extends EntityTypeOption {
  nested: boolean; // may appear inside another entity
}

export interface NewProjectForm {
  name: string;
  description: string;
  language: string;
  tokenizer: string;
  mode: string;
  file: File | null;
}

interface NewProjectState {
  form: NewProjectForm;
  setForm: Dispatch<SetStateAction<NewProjectForm>>;
  sentences: ImportedSentence[] | null; // parsed from the file on step 1 Next
  setSentences: Dispatch<SetStateAction<ImportedSentence[] | null>>;
  pipes: Record<string, number[]>; // sentence id -> cluster indices followed by "|"
  setPipes: Dispatch<SetStateAction<Record<string, number[]>>>;
  parsedFile: File | null; // file the sentences came from; skip re-parsing on Back -> Next
  setParsedFile: Dispatch<SetStateAction<File | null>>;
  table: ImportedTable | null; // file columns for Column Map
  setTable: Dispatch<SetStateAction<ImportedTable | null>>;
  mapping: Record<string, string>; // file column -> platform field ("token", "layer1", …)
  setMapping: Dispatch<SetStateAction<Record<string, string>>>;
  entities: ProjectEntity[]; // entity types picked on step 4
  setEntities: Dispatch<SetStateAction<ProjectEntity[]>>;
  customTypes: EntityTypeOption[]; // created on step 4, added to the catalog
  setCustomTypes: Dispatch<SetStateAction<EntityTypeOption[]>>;
  layers: number;
  setLayers: Dispatch<SetStateAction<number>>;
}

const EMPTY_FORM: NewProjectForm = {
  name: "",
  description: "",
  language: "",
  tokenizer: "",
  mode: "",
  file: null,
};

const NewProjectContext = createContext<NewProjectState | null>(null);

export function NewProjectProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sentences, setSentences] = useState<ImportedSentence[] | null>(null);
  const [pipes, setPipes] = useState<Record<string, number[]>>({});
  const [parsedFile, setParsedFile] = useState<File | null>(null);
  const [table, setTable] = useState<ImportedTable | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [entities, setEntities] = useState<ProjectEntity[]>([]);
  const [customTypes, setCustomTypes] = useState<EntityTypeOption[]>([]);
  const [layers, setLayers] = useState(2);
  return (
    <NewProjectContext.Provider
      value={{
        form,
        setForm,
        sentences,
        setSentences,
        pipes,
        setPipes,
        parsedFile,
        setParsedFile,
        table,
        setTable,
        mapping,
        setMapping,
        entities,
        setEntities,
        customTypes,
        setCustomTypes,
        layers,
        setLayers,
      }}
    >
      {children}
    </NewProjectContext.Provider>
  );
}

export function useNewProject() {
  const ctx = useContext(NewProjectContext);
  if (!ctx) throw new Error("useNewProject must be used inside NewProjectProvider");
  return ctx;
}
