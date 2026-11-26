import { Navigate, useNavigate } from "react-router-dom";
import { useNewProject } from "@/components/projects/NewProjectContext";
import WizardFooter from "@/components/projects/WizardFooter";

// Batches are out of scope this term (Figma Term1 "Batch" frame 170:963).
export default function BatchesStepPage() {
  const navigate = useNavigate();
  const { table } = useNewProject();

  if (!table) return <Navigate to="/projects/new" replace />;

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-4 py-7 sm:px-10">
          <h2 className="text-[16px] font-bold leading-6">Coming Soon</h2>
        </div>
      </main>
      <WizardFooter
        onBack={() => navigate("/projects/new/entities")}
        onNext={() => navigate("/projects/new/review")}
      />
    </>
  );
}
