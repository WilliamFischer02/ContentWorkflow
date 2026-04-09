type ProgressBarProps = {
  done: number;
  total: number;
  accent: string;
  animateDelayMs?: number;
};

export default function ProgressBar({ done, total, accent, animateDelayMs = 0 }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accent} transition-[width] duration-300 ease-out`}
          style={{ width: `${percent}%`, transitionDelay: `${animateDelayMs}ms` }}
        />
      </div>
      <span className="text-xs text-neutral-400">
        {done}/{total}
      </span>
    </div>
  );
}
