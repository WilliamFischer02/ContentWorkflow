import { useEffect, useState } from 'react'
import { formatRelativeTime } from '../lib/dates'
import { IconExternal, IconPlay } from './Icons'

interface Clip {
  id: string
  url: string
  title: string
  view_count: number
  created_at: string
  thumbnail_url?: string
  duration?: number
}

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'unconfigured'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; clips: Clip[] }

const CONFIGURED = Boolean(import.meta.env.VITE_TWITCH_CLIENT_ID)

/**
 * Twitch Helix integration via the Vercel serverless function at /api/clips
 * (client secret stays server-side). Auto-fetches once when credentials are
 * configured; gracefully no-ops on the plain Vite dev server or when unset.
 */
export function TwitchClipsPanel() {
  const [state, setState] = useState<FetchState>({ kind: 'idle' })

  async function fetchClips() {
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/clips')
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        setState({
          kind: 'unconfigured',
          message:
            'The /api/clips function is not available here. It runs on Vercel deployments (or `vercel dev`) with Twitch credentials configured.',
        })
        return
      }
      const body = (await res.json()) as { clips?: Clip[]; error?: string }
      if (!res.ok) {
        if (res.status === 501) {
          setState({
            kind: 'unconfigured',
            message: body.error ?? 'Twitch API credentials are not configured.',
          })
        } else {
          setState({ kind: 'error', message: body.error ?? `Request failed (${res.status})` })
        }
        return
      }
      setState({ kind: 'ready', clips: body.clips ?? [] })
    } catch {
      setState({
        kind: 'unconfigured',
        message:
          'Could not reach /api/clips. This feature needs a Vercel deployment with Twitch credentials (see .env.example).',
      })
    }
  }

  useEffect(() => {
    if (CONFIGURED) void fetchClips()
  }, [])

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            <IconPlay className="size-3.5 text-twitch" />
            Recent Twitch clips
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Latest clips from your channel via the Twitch Helix API.
            {!CONFIGURED && ' Not configured — see Settings / .env.example.'}
          </p>
        </div>
        <button
          onClick={() => void fetchClips()}
          disabled={state.kind === 'loading'}
          className="btn-ghost"
        >
          {state.kind === 'loading' ? 'Fetching…' : 'Refresh'}
        </button>
      </div>

      {state.kind === 'loading' && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton aspect-video rounded-lg" />
          ))}
        </div>
      )}
      {state.kind === 'unconfigured' && (
        <p className="mt-3 rounded-lg border border-surface-800 bg-surface-950 p-3 text-xs text-zinc-400">
          {state.message}
        </p>
      )}
      {state.kind === 'error' && (
        <p className="mt-3 rounded-lg border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">
          {state.message}
        </p>
      )}
      {state.kind === 'ready' &&
        (state.clips.length === 0 ? (
          <p className="mt-3 text-xs text-zinc-500">
            No clips found yet — clip some stream moments and they'll show up here.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {state.clips.map((clip, index) => (
              <li
                key={clip.id}
                className="anim-fade-up"
                style={{ '--stagger': index } as React.CSSProperties}
              >
                <a
                  href={clip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-lg border border-surface-800 bg-surface-950 transition-all hover:border-twitch/50 hover:shadow-glow"
                >
                  {clip.thumbnail_url ? (
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={clip.thumbnail_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {clip.duration !== undefined && (
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold">
                          {Math.round(clip.duration)}s
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-surface-900">
                      <IconPlay className="size-6 text-zinc-700" />
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="truncate text-xs font-medium group-hover:text-twitch">
                      {clip.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
                      {clip.view_count.toLocaleString()} views ·{' '}
                      {formatRelativeTime(new Date(clip.created_at).getTime())}
                      <IconExternal className="ms-auto size-2.5 opacity-40" />
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ))}
    </section>
  )
}
