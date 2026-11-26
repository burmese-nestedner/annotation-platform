import type { ReactNode } from "react";
import { TriangleAlert } from "../icons";

export default function AlertPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-6 bg-destructive/10 px-2.5 py-[5px] text-[12px] font-semibold text-destructive">
      <TriangleAlert size={13} strokeWidth={1.5} />
      {children}
    </span>
  );
}
