import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WizardFooterProps {
  onBack?: () => void; // omitted on the first step -> Back is disabled
  onNext?: () => void;
  nextForm?: string; // submit this form id instead of calling onNext
  nextDisabled?: boolean;
  nextLabel?: string;
}

export default function WizardFooter({
  onBack,
  onNext,
  nextForm,
  nextDisabled,
  nextLabel = "Next",
}: WizardFooterProps) {
  const navigate = useNavigate();
  return (
    <footer className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-3.5 sm:px-10">
      <Button
        variant="outline"
        size="lg"
        disabled={!onBack}
        onClick={onBack}
        className="bg-muted px-5 font-normal text-foreground disabled:text-border disabled:opacity-100"
      >
        ← Back
      </Button>
      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="lg" className="px-[18px] font-normal" onClick={() => navigate("/")}>
          Cancel
        </Button>
        <Button
          type={nextForm ? "submit" : "button"}
          form={nextForm}
          onClick={nextForm ? undefined : onNext}
          disabled={nextDisabled}
          size="lg"
          className="px-6"
        >
          {nextLabel} →
        </Button>
      </div>
    </footer>
  );
}
