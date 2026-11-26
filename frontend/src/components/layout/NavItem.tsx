import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  count?: number;
}

export default function NavItem({ to, icon, label, count }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "mb-0.5 flex items-center gap-2.5 rounded-7 px-2.5 py-2 text-[13px] text-muted-foreground no-underline hover:bg-muted",
          isActive && "bg-primary/10 font-bold text-primary hover:bg-primary/10",
        )
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count ? (
        <span className="min-w-4 rounded-10 bg-destructive px-1.5 py-px text-center text-[9px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </NavLink>
  );
}
