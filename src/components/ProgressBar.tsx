export function ProgressBar({
  done,
  total,
  compact = false,
}: {
  done: number
  total: number
  compact?: boolean
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div>
      {!compact && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-400">
          <span>
            {done}/{total} steps
          </span>
          <span className={pct === 100 ? 'font-semibold text-emerald-400' : ''}>{pct}%</span>
        </div>
      )}
      <div
        className={`overflow-hidden rounded-full bg-surface-800 ${compact ? 'h-1' : 'h-2'}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            pct === 100
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-twitch-dark to-twitch'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** Circular completion ring used on the dashboard. */
export function ProgressRing({
  done,
  total,
  size = 116,
}: {
  done: number
  total: number
  size?: number
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const stroke = 9
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-800)"
          strokeWidth={stroke}
        />
        <circle
          className="anim-ring"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct === 100 ? '#34d399' : '#a970ff'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ '--ring-circumference': circumference } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{pct}%</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">complete</span>
      </div>
    </div>
  )
}
