import { Link, NavLink } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { LinkColor } from '../db/types'
import { openCommandPalette } from '../lib/bus'
import {
  IconBoard,
  IconCommand,
  IconExternal,
  IconHome,
  IconList,
  IconSettings,
  LogoMark,
} from './Icons'

const LINK_COLORS: Record<LinkColor, string> = {
  red: 'hover:border-red-500/70 hover:text-red-400',
  cyan: 'hover:border-cyan-400/70 hover:text-cyan-300',
  pink: 'hover:border-pink-500/70 hover:text-pink-400',
  purple: 'hover:border-twitch/70 hover:text-twitch',
  emerald: 'hover:border-emerald-500/70 hover:text-emerald-400',
  amber: 'hover:border-amber-500/70 hover:text-amber-400',
  zinc: 'hover:border-zinc-500 hover:text-zinc-200',
}

const DOT_COLORS: Record<LinkColor, string> = {
  red: 'bg-red-500',
  cyan: 'bg-cyan-400',
  pink: 'bg-pink-500',
  purple: 'bg-twitch',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-500',
}

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/board', label: 'Board', icon: IconBoard, end: false },
  { to: '/templates', label: 'Templates', icon: IconList, end: false },
  { to: '/settings', label: 'Settings', icon: IconSettings, end: false },
]

export function TopBar() {
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)

  return (
    <header className="sticky top-0 z-20 border-b border-surface-800 bg-surface-950/90 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-base font-bold tracking-tight">
            ContentWorkflow
            <span className="ml-2 hidden text-xs font-normal text-zinc-500 sm:inline">
              {settings?.channelName ?? 'BingusTheWizard'}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-surface-850 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={openCommandPalette}
          className="ms-auto flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900/60 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-surface-700 hover:text-zinc-300"
        >
          <IconCommand className="size-3.5" />
          <span className="hidden md:inline">Search or jump to…</span>
          <kbd className="rounded border border-surface-700 bg-surface-950 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-surface-850 px-4 py-2 md:px-6">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Quick launch
        </span>
        <nav className="flex items-center gap-2" aria-label="Channel quick links">
          {(settings?.quickLinks ?? []).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.note ? `${link.label} — ${link.note}` : link.label}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border border-surface-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors ${LINK_COLORS[link.color]}`}
            >
              <span className={`size-1.5 rounded-full ${DOT_COLORS[link.color]}`} />
              {link.label}
              <IconExternal className="size-3 opacity-40" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
