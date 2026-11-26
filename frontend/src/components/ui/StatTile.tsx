interface StatTileProps {
  label: string;
  value: string | number;
}

export default function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex flex-1 flex-col rounded-7 border bg-muted px-2.5 py-2">
      <span className="text-[10px] leading-[15px] text-muted-foreground">{label}</span>
      <span className="pt-0.5 font-mono text-[16px] font-bold leading-[24px]">{value}</span>
    </div>
  );
}
