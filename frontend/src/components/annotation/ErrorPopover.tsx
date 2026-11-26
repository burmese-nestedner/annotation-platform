import { TriangleAlert } from "lucide-react";

interface ErrorPopoverProps {
  location: string;
  message: string;
}

export default function ErrorPopover({ location, message }: ErrorPopoverProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="absolute -top-[6px] left-[calc(50%-5px)] size-2.5 rotate-45 border-l border-t border-border bg-popover group-data-[side=top]:hidden" />
      <div className="flex items-center gap-2 text-destructive">
        <TriangleAlert className="size-3.5" strokeWidth={1.5} />
        <span className="flex-1 text-xs font-semibold">BIOES validation error</span>
      </div>
      <span className="text-[11px] font-semibold text-text-secondary">{location}</span>
      <p className="text-xs">{message}</p>
    </div>
  );
}
