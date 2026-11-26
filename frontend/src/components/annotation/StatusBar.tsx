interface StatusBarProps {
  tokenCount: number;
  errorCount: number;
  lastSaved: string;
  info: string;
}

export default function StatusBar({ tokenCount, errorCount, lastSaved, info }: StatusBarProps) {
  return (
    <footer className="flex flex-wrap gap-x-5 gap-y-0.5 border-t px-4 py-1.5 sm:px-5 text-[11px] leading-[16.5px] text-muted-foreground">
      <span>{tokenCount} tokens displayed</span>
      <span className="text-destructive">{errorCount} errors</span>
      <span>Last saved: {lastSaved}</span>
      <span className="ml-auto">{info}</span>
    </footer>
  );
}
