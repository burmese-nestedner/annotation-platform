import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft } from "@/components/icons";
import WizardStepper from "@/components/projects/WizardStepper";
import { NewProjectProvider } from "@/components/projects/NewProjectContext";
import { WIZARD_STEPS } from "@/data/createProject";

// route segment -> step index
const STEP_PATHS = ["", "tokenize", "column-map", "entities", "batches", "review"];

export default function NewProjectLayout() {
  const { pathname } = useLocation();
  const segment = pathname.replace(/\/+$/, "").split("/projects/new")[1]?.replace(/^\//, "") ?? "";
  const current = Math.max(STEP_PATHS.indexOf(segment), 0);

  return (
    <NewProjectProvider>
      <div className="flex h-dvh flex-col bg-white">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[12px] leading-[18px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Projects
          </Link>
          <span className="text-[13px] leading-[19.5px] text-border">/</span>
          <h1 className="text-[14px] font-bold leading-[21px]">New Project</h1>
        </header>

        <div className="px-4 pt-6 sm:px-10">
          <WizardStepper steps={WIZARD_STEPS} current={current} />
        </div>

        {/* each step renders its own scrolling <main> and <WizardFooter> */}
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </NewProjectProvider>
  );
}
