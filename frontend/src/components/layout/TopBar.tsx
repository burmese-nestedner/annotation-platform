import { AnnotateIcon, LogOut } from "../icons";
import Avatar from "../ui/Avatar";
import { Button } from "@/components/ui/button";
import type { User } from "../../types/project";

interface TopBarProps {
  user: User;
  onSignOut?: () => void;
}

export default function TopBar({ user, onSignOut }: TopBarProps) {
  return (
    <header className="flex h-[var(--topbar-height)] items-center gap-3 border-b bg-white px-4 sm:gap-4 sm:px-7">
      <div className="flex flex-1 items-center gap-2.5">
        <span className="inline-flex size-7 items-center justify-center rounded-7 bg-primary">
          <AnnotateIcon size={14} strokeWidth={1.5} color="white" />
        </span>
        <span className="font-mono text-[11px] font-bold leading-[16.5px] tracking-[1.1px] text-primary">
          NESTED-NER
        </span>
        <span className="hidden text-[11px] leading-[16.5px] text-muted-foreground sm:inline">Annotation Platform</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <Avatar initials={user.initials} tone="primary" size={30} className="border-0 text-[11px]" />
          <div className="hidden flex-col sm:flex">
            <span className="text-[12px] font-semibold leading-[14.4px]">{user.name}</span>
            <span className="text-[10px] capitalize leading-[15px] text-primary">{user.role}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-auto gap-[5px] px-2.5 py-[5px] text-[11px] font-normal leading-[16.5px]"
          onClick={onSignOut}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Sign out
        </Button>
      </div>
    </header>
  );
}
