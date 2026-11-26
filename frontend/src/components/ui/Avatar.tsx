import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "./tone";

interface AvatarProps {
  initials: string;
  tone?: Tone;
  size?: number;
  title?: string;
  className?: string;
}

export default function Avatar({ initials, tone = "primary", size = 24, title, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 border-white bg-[var(--tone-color)] text-[10px] font-bold text-white",
        toneClass(tone),
        className,
      )}
      style={{ width: size, height: size }}
      title={title}
    >
      {initials}
    </span>
  );
}
