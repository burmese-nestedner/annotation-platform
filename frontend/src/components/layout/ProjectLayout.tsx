import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { AnnotateIcon, Menu } from "../icons";
import { Button } from "@/components/ui/button";
import { getProject, MOCK_USER } from "../../data/mockProjects";

export default function ProjectLayout() {
  const { projectId = "" } = useParams();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const project = getProject(projectId);
  if (!project) return <Navigate to="/" replace />;

  return (
    <div className="flex h-dvh overflow-hidden">
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/30 md:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <Sidebar
        project={project}
        user={MOCK_USER}
        openIaa={2}
        openAdjudication={3}
        className={`fixed inset-y-0 left-0 z-40 transition-transform md:static md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2.5 border-b px-4 py-2 md:hidden">
          <Button variant="outline" size="icon" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={15} strokeWidth={1.5} />
          </Button>
          <span className="inline-flex size-6 items-center justify-center rounded-6 bg-primary">
            <AnnotateIcon size={13} strokeWidth={1.5} color="white" />
          </span>
          <span className="truncate text-[13px] font-bold">{project.name}</span>
        </div>
        <Outlet context={{ project }} />
      </main>
    </div>
  );
}
