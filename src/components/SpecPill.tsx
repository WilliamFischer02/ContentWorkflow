import type { SpecPill as SpecPillDef } from '../content/streams'

/**
 * Platform-optimal spec as a scannable pill; the full explanation lives in
 * a CSS-only tooltip (hover / keyboard focus). Tones: info (column accent),
 * warn (amber), avoid (red).
 */
export function SpecPill({ spec }: { spec: SpecPillDef }) {
  return (
    <button type="button" className="spec-pill" data-tone={spec.tone ?? 'info'}>
      {spec.tone === 'avoid' && <span aria-hidden>🚫</span>}
      {spec.tone === 'warn' && <span aria-hidden>⚠️</span>}
      {spec.label}
      <span role="tooltip" className="spec-tip">
        {spec.detail}
      </span>
    </button>
  )
}

export function SpecPillRow({ specs }: { specs: SpecPillDef[] }) {
  if (specs.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {specs.map((spec) => (
        <SpecPill key={spec.label} spec={spec} />
      ))}
    </div>
  )
}
