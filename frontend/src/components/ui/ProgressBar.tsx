interface ProgressBarProps {
  value: number;
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-1 overflow-hidden rounded-full bg-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-linear-to-r from-primary to-primary-light" style={{ width: `${pct}%` }} />
    </div>
  );
}
