import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import GridDemo from "./pages/GridDemo";
import "./styles.css";

ModuleRegistry.registerModules([AllCommunityModule]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GridDemo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
