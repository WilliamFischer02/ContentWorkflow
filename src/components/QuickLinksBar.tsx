import { Link } from 'react-router-dom'
import {
  INSTAGRAM_URL,
  TIKTOK_UPLOAD_URL,
  TWITCH_CLIPS_URL,
  TWITCH_DASHBOARD_URL,
  YOUTUBE_UPLOAD_URL,
} from '../db/seed'

interface QuickLink {
  label: string
  url: string
  accent: string
  note?: string
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'YouTube upload', url: YOUTUBE_UPLOAD_URL, accent: 'hover:border-red-500/70 hover:text-red-400' },
  { label: 'TikTok upload', url: TIKTOK_UPLOAD_URL, accent: 'hover:border-cyan-400/70 hover:text-cyan-300' },
  {
    label: 'Instagram',
    url: INSTAGRAM_URL,
    accent: 'hover:border-pink-500/70 hover:text-pink-400',
    note: 'Reel creation is mobile-only',
  },
  { label: 'Twitch clips', url: TWITCH_CLIPS_URL, accent: 'hover:border-twitch/70 hover:text-twitch' },
  { label: 'Twitch dashboard', url: TWITCH_DASHBOARD_URL, accent: 'hover:border-twitch/70 hover:text-twitch' },
]

export function QuickLinksBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="text-twitch">🧙</span>
          <span>
            ContentWorkflow
            <span className="ml-2 hidden text-xs font-normal text-zinc-500 sm:inline">
              BingusTheWizard
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Channel quick links">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.note ? `${link.label} — ${link.note}` : link.label}
              className={`rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors ${link.accent}`}
            >
              {link.label}
              {link.note && <span className="ml-1 text-zinc-500">*</span>}
            </a>
          ))}
        </nav>
        <div className="ms-auto">
          <Link
            to="/templates"
            className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-twitch/70 hover:text-twitch"
          >
            Templates
          </Link>
        </div>
      </div>
    </header>
  )
}
