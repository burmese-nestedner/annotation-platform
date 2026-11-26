import { Link } from "react-router-dom";
import { AnnotateIcon, ArrowLeft, BarChart3, CircleCheck, House, LogOut, PieChart, Upload } from "../icons";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import NavItem from "./NavItem";
import { cn } from "@/lib/utils";
import type { Project, User } from "../../types/project";

interface SidebarProps {
  project: Project;
  user: User;
  openIaa?: number;
  openAdjudication?: number;
  className?: string;
}

const ICON = { size: 15, strokeWidth: 1.5 } as const;
const LABEL = "block text-[9px] font-semibold uppercase tracking-[0.81px] text-muted-foreground";

export default function Sidebar({ project, user, openIaa, openAdjudication, className }: SidebarProps) {
  const base = `/projects/${project.id}`;
  return (
    <aside className={cn("flex h-full w-[var(--sidebar-width)] shrink-0 flex-col border-r bg-white", className)}>
      <div className="flex flex-col border-b px-3.5 pt-3.5 pb-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground no-underline">
          <ArrowLeft size={13} strokeWidth={1.5} />
          All Projects
        </Link>
        <span className="mt-3 font-mono text-[10px] tracking-[1.2px] text-primary">NESTED-NER</span>
        <span className="mt-[3px] text-[12px] font-semibold">Annotation Platform</span>
      </div>

      <div className="border-b px-3 py-2.5">
        <span className={LABEL}>Active Project</span>
        <div className="mt-1.5 rounded-7 border px-2.5 py-[9px]">
          <span className="block truncate text-[12px] font-bold">{project.name}</span>
          <div className="flex items-center gap-[5px] pt-1">
            <Badge tone={project.mode === "nested" ? "violet" : "blue"} size="sm">
              {project.mode}
            </Badge>
            <Badge tone="cyan" size="sm">
              {project.layers}L
            </Badge>
            <span className="px-[5px] py-px font-mono text-[8px] text-muted-foreground">{project.tokenizer}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto p-2">
        <span className={`${LABEL} px-1.5 pt-1 pb-1.5`}>Navigation</span>
        <NavItem to={`${base}/overview`} icon={<House {...ICON} />} label="Overview" />
        <NavItem to={`${base}/annotation`} icon={<AnnotateIcon {...ICON} />} label="Annotation" />
        <NavItem to={`${base}/iaa`} icon={<BarChart3 {...ICON} />} label="IAA Dashboard" count={openIaa} />
        <NavItem
          to={`${base}/adjudication`}
          icon={<CircleCheck {...ICON} />}
          label="Adjudication"
          count={openAdjudication}
        />
        <NavItem to={`${base}/statistics`} icon={<PieChart {...ICON} />} label="Statistics" />
        <NavItem to={`${base}/export`} icon={<Upload {...ICON} />} label="Export" />
      </nav>

      <div className="flex items-center gap-2.5 border-t p-3">
        <Avatar initials={user.initials} size={28} className="border-0" />
        <div className="flex flex-1 flex-col leading-[1.3]">
          <span className="text-[11px] font-bold">{user.name}</span>
          <span className="text-[10px] capitalize text-primary">{user.role}</span>
        </div>
        <LogOut size={14} strokeWidth={1.5} color="var(--muted-foreground)" />
      </div>
    </aside>
  );
}
