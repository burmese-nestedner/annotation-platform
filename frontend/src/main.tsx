import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import GridDemo from "./pages/GridDemo";
import ProjectLayout from "./components/layout/ProjectLayout";
import AnnotationPage from "./pages/AnnotationPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import TokenizeStepPage from "./pages/TokenizeStepPage";
import ColumnMapStepPage from "./pages/ColumnMapStepPage";
import EntitiesStepPage from "./pages/EntitiesStepPage";
import BatchesStepPage from "./pages/BatchesStepPage";
import ReviewStepPage from "./pages/ReviewStepPage";
import NewProjectLayout from "./components/projects/NewProjectLayout";
import ComingSoon from "./pages/ComingSoon";
import HomePage from "./pages/HomePage";
import "./styles/index.css";
import "./styles.css";

ModuleRegistry.registerModules([AllCommunityModule]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/new" element={<NewProjectLayout />}>
          <Route index element={<CreateProjectPage />} />
          <Route path="tokenize" element={<TokenizeStepPage />} />
          <Route path="column-map" element={<ColumnMapStepPage />} />
          <Route path="entities" element={<EntitiesStepPage />} />
          <Route path="batches" element={<BatchesStepPage />} />
          <Route path="review" element={<ReviewStepPage />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<Navigate to="annotation" replace />} />
          <Route path="annotation" element={<AnnotationPage />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
        <Route path="/grid-demo" element={<GridDemo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
