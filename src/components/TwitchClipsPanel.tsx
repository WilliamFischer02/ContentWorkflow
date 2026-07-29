import { useState } from 'react'

interface Clip {
  id: string
  url: string
  title: string
  view_count: number
  created_at: string
}

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'unconfigured'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; clips: Clip[] }

const CONFIGURED = Boolean(import.meta.env.VITE_TWITCH_CLIENT_ID)

/**
 * Optional Twitch Helix integration. Calls the Vercel serverless function at
 * /api/clips, which holds the client secret server-side. Gracefully no-ops
 * when the env vars aren't set (or when running the plain Vite dev server,
 * where /api routes don't exist).
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

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Recent Twitch clips
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Optional: pulls your latest clips via the Twitch Helix API.
            {!CONFIGURED && ' Not configured — see .env.example.'}
          </p>
        </div>
        <button
          onClick={() => void fetchClips()}
          disabled={state.kind === 'loading'}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-twitch hover:text-twitch disabled:opacity-50"
        >
          {state.kind === 'loading' ? 'Fetching…' : 'Fetch recent Twitch clips'}
        </button>
      </div>

      {state.kind === 'unconfigured' && (
        <p className="mt-3 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
          {state.message}
        </p>
      )}
      {state.kind === 'error' && (
        <p className="mt-3 rounded-md border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">
          {state.message}
        </p>
      )}
      {state.kind === 'ready' &&
        (state.clips.length === 0 ? (
          <p className="mt-3 text-xs text-zinc-500">No clips found.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {state.clips.map((clip) => (
              <li key={clip.id}>
                <a
                  href={clip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-800"
                >
                  <span className="truncate text-twitch">{clip.title}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {clip.view_count.toLocaleString()} views
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ))}
    </section>
  )
}
