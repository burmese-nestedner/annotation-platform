import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { getHealth } from "../api/client";

type Row = { idx: number; token: string; gloss: string; l1: string; l2: string; l3: string };

// Sample rows from proposal Table 3.3
const SAMPLE: Row[] = [
  { idx: 1, token: "မန္တလေး", gloss: "Mandalay", l1: "B-JOB", l2: "S-CITY", l3: "O" },
  { idx: 2, token: "မြို့တော်ဝန်", gloss: "mayor", l1: "E-JOB", l2: "O", l3: "O" },
  { idx: 3, token: "သည်", gloss: "(subj.)", l1: "O", l2: "O", l3: "O" },
  { idx: 4, token: "ရှမ်း", gloss: "Shan", l1: "B-ZONE", l2: "B-STATE", l3: "S-ETHNIC" },
  { idx: 5, token: "ပြည်နယ်", gloss: "State", l1: "I-ZONE", l2: "E-STATE", l3: "O" },
  { idx: 6, token: "မြောက်ပိုင်း", gloss: "northern part", l1: "E-ZONE", l2: "O", l3: "O" },
];

const COLUMNS: ColDef<Row>[] = [
  { field: "idx", headerName: "#", width: 70 },
  { field: "token", headerName: "Token", flex: 1 },
  { field: "gloss", headerName: "Gloss", flex: 1 },
  { field: "l1", headerName: "Layer 1", editable: true, flex: 1 },
  { field: "l2", headerName: "Layer 2", editable: true, flex: 1 },
  { field: "l3", headerName: "Layer 3", editable: true, flex: 1 },
];

export default function GridDemo() {
  const [status, setStatus] = useState("checking…");

  useEffect(() => {
    getHealth()
      .then((h) => setStatus(`backend ${h.status}, database ${h.database}`))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <main className="demo-page">
      <header>
        <h1 className="demo-title">Annotation grid (scaffold)</h1>
        <p className="demo-status">Status: {status}</p>
      </header>
      <div className="demo-grid">
        <AgGridReact<Row> rowData={SAMPLE} columnDefs={COLUMNS} />
      </div>
    </main>
  );
}
