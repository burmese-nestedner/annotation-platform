import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import { CircleCheck, Plus, X } from "../components/icons";
import ProjectCard from "../components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/SearchInput";
import { MOCK_PROJECTS, MOCK_USER } from "../data/mockProjects";

export default function HomePage() {
  const navigate = useNavigate();
  const created = (useLocation().state as { createdProject?: string } | null)?.createdProject;
  const [query, setQuery] = useState("");

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_PROJECTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <TopBar user={MOCK_USER} />
      <main className="mx-auto max-w-[var(--content-max-width)] px-4 py-5 sm:px-8 sm:py-7">
        <div className="mb-5 flex flex-wrap items-center gap-3.5">
          <h1 className="min-w-0 flex-1 basis-full text-[24px] sm:basis-0 font-bold leading-[22.5px]">Projects</h1>
          <SearchInput
            className="min-w-0 flex-1 sm:w-[200px] sm:flex-none"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button size="lg" className="gap-[7px] px-[18px]" onClick={() => navigate("/projects/new")}>
            <Plus size={14} strokeWidth={1.5} />
            New Project
          </Button>
        </div>
        {created && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2.5 rounded-10 bg-primary/10 px-4 py-3 text-[13px] text-foreground"
          >
            <CircleCheck size={16} strokeWidth={1.75} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              Project <b className="font-semibold">{created}</b> created. (Mock only: it is not saved until the API
              exists.)
            </span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => navigate(".", { replace: true, state: null })}
              className="shrink-0 rounded-4 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={(proj) => navigate(`/projects/${proj.id}`)} />
          ))}
        </div>
      </main>
    </div>
  );
}
