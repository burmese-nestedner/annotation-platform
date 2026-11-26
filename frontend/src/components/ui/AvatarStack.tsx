import type { Annotator } from "../../types/project";
import Avatar from "./Avatar";

interface AvatarStackProps {
  people: Annotator[];
}

export default function AvatarStack({ people }: AvatarStackProps) {
  return (
    <div className="flex [&>*+*]:-ml-1.5">
      {people.map((p) => (
        <Avatar key={p.id} initials={p.initials} tone={p.tone} title={p.name} size={22} className="border text-[9px]" />
      ))}
    </div>
  );
}
