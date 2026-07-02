import { cn } from "@/lib/utils";

interface ProgressBarProps {
  pct: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ pct, color = "var(--accent-violet)", className }: ProgressBarProps) {
  return (
    <div className={cn("h-1.5 rounded-full bg-[--bg-hover] overflow-hidden", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}
