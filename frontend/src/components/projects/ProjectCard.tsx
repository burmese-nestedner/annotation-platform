import { AnnotateIcon } from "../icons";
import AvatarStack from "../ui/AvatarStack";
import Badge from "../ui/Badge";
import IconBox from "../ui/IconBox";
import ProgressBar from "../ui/ProgressBar";
import StatTile from "../ui/StatTile";
import type { Project } from "../../types/project";

interface ProjectCardProps {
  project: Project;
  onOpen?: (project: Project) => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const nested = project.mode === "nested";
  const tone = nested ? "violet" : "blue";
  const { stats } = project;
  const count = project.annotators.length;

  return (
    <article
      className="flex cursor-pointer flex-col gap-4 rounded-12 border bg-white p-4 sm:p-[22px] hover:border-primary"
      onClick={() => onOpen?.(project)}
    >
      <div className="flex items-start gap-3">
        <IconBox tone={tone}>
          <AnnotateIcon size={18} strokeWidth={1.5} />
        </IconBox>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-x-[7px] gap-y-1">
            <h3 className="text-[14px] font-bold leading-[21px]">{project.name}</h3>
            <Badge tone={tone} className="tracking-[0.54px]">
              {project.mode}
            </Badge>
            {nested && <Badge tone="cyan">{project.layers}L</Badge>}
          </div>
          <p className="pt-1 text-[12px] leading-[18px] text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 [&>*]:min-w-0">
        <StatTile label="Sentences" value={stats.sentences.toLocaleString()} />
        <StatTile label="Batches" value={stats.batches} />
        <StatTile label="Entity Types" value={stats.entityTypes} />
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between text-[11px] leading-[16.5px]">
          <span className="text-muted-foreground">Batch completion</span>
          <span className="font-mono font-semibold">{project.completion}%</span>
        </div>
        <div className="pt-[5px]">
          <ProgressBar value={project.completion} />
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <AvatarStack people={project.annotators} />
          <span className="pl-1.5 text-[11px] leading-[16.5px] text-muted-foreground">{count} annotators</span>
        </div>
      </div>
    </article>
  );
}
