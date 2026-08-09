import { TOOLKIT } from '../content/toolkit'
import { IconExternal } from '../components/Icons'

const DOT: Record<string, string> = {
  'text-twitch': 'bg-twitch',
  'text-emerald-400': 'bg-emerald-400',
  'text-cyan-300': 'bg-cyan-300',
  'text-pink-400': 'bg-pink-400',
  'text-amber-400': 'bg-amber-400',
  'text-violet-300': 'bg-violet-300',
  'text-red-400': 'bg-red-400',
}

export function ToolkitPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="anim-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">
          Creator{' '}
          <span className="bg-gradient-to-r from-twitch to-brand-glow bg-clip-text text-transparent">
            toolkit
          </span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Every destination in the workflow, organized by job — publishing, numbers, editing,
          design, sound, research, and community. All links open in a new tab.
        </p>
      </div>

      {TOOLKIT.map((category, index) => (
        <section
          key={category.id}
          className="anim-fade-up"
          style={{ '--stagger': index + 1 } as React.CSSProperties}
          aria-labelledby={`toolkit-${category.id}`}
        >
          <div className="mb-3">
            <h2
              id={`toolkit-${category.id}`}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${category.accent}`}
            >
              <span className={`size-2 rounded-full ${DOT[category.accent] ?? 'bg-zinc-400'}`} />
              {category.title}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">{category.blurb}</p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {category.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card card-hover group flex h-full flex-col px-4 py-3"
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {link.label}
                    <IconExternal className="size-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300" />
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-zinc-500">{link.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
