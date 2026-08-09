/** Monday-anchored week math for the weekly stream pipeline. */

const DAY_MS = 24 * 60 * 60 * 1000

/** ISO date (YYYY-MM-DD, local) of the Monday of the week containing `ts`. */
export function weekStartISO(ts = Date.now()): string {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun
  const back = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - back)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Shift a week-start ISO date by N weeks. */
export function shiftWeek(weekStart: string, weeks: number): string {
  const d = new Date(`${weekStart}T12:00:00`)
  d.setDate(d.getDate() + weeks * 7)
  return weekStartISO(d.getTime())
}

/** "Aug 3 – Aug 9" label for a week. */
export function describeWeek(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00`)
  const end = new Date(start.getTime() + 6 * DAY_MS)
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

/** The concrete date of a 0–6 day-of-week within a given week. */
export function dateOfWeekday(weekStart: string, dayOfWeek: number): Date {
  const monday = new Date(`${weekStart}T12:00:00`)
  // Week runs Mon(1) … Sun(0→offset 6).
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  return new Date(monday.getTime() + offset * DAY_MS)
}
