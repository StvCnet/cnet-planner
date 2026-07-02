interface ProgressRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  pct, size = 120, stroke = 10, color = "#10B981", label, sublabel,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(pct, 0), 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--bg-hover)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute text-center">
          {label && <p className="text-2xl font-bold text-[--text-primary]">{label}</p>}
          {sublabel && <p className="text-[10px] text-[--text-muted]">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
