# ContentWorkflow 🧙

**BingusTheWizard's content-workflow dashboard** — a local-first, commercial-grade web app for
running the stream → clips → short-form pipeline as a solo streamer.

**Live:** deployed on Vercel from `main` (auto-deploys on every push).

## What it does

- **Quick-launch bar** — one-click, new-tab access to the real channel destinations: YouTube
  Studio upload, TikTok Studio upload, TikTok profile, Instagram (Reel creation is mobile-only),
  Twitch clips manager, Twitch dashboard. Fully editable in Settings.
- **Ideas as projects** — every stream idea gets title, game, status, **priority**, **target
  date**, **tags**, notes, and its own instance of a pipeline checklist.
- **Two views** — a list sidebar with search/filter/sort, and a **Kanban board** with
  drag-and-drop between Backlog / In progress / Done.
- **Pipeline checklists** — three step types (`task`, `deep-link`, `link-input`), per-step
  **notes**, a "Next up" highlight, hide-completed, animated progress, and a confetti
  celebration at 100%.
- **Templates** — full CRUD over pipeline templates. Each idea gets a *copy* of the steps, so
  editing a template never touches existing ideas' progress.
- **Command palette** — `⌘K` / `Ctrl K` to jump to any idea or page; `N` for a new idea.
- **Twitch clips** — recent clips with thumbnails via the Helix API (serverless, secret stays
  server-side; auto-noops when unconfigured).
- **Data ownership** — JSON backup export/import and full reset from Settings. Everything lives
  in the browser's IndexedDB; no account, no server-side storage.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com/) with a custom design-token theme, CSS keyframe
  animation system (staggered entrances, reduced-motion aware), Inter variable font
- [Dexie.js](https://dexie.org/) (IndexedDB) with **versioned schema migrations** (currently v2)
- [React Router](https://reactrouter.com/) (`createBrowserRouter`)
- Vercel hosting + `vercel.json` SPA rewrite + `/api/clips` serverless function

## Local development

Requires **Node.js 20 LTS** (or newer).

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build locally
```

> `/api/clips` doesn't run under plain `npm run dev` — use `vercel dev` to exercise it locally.
> The UI handles its absence gracefully.

## Deploying to Vercel

The repo is import-ready: Vercel auto-detects Vite, `vercel.json` provides the SPA rewrite.
Once the GitHub repo is connected, every push to `main` deploys automatically.

### Twitch clip fetching (optional)

Set these in the Vercel project's Environment Variables (see `.env.example`), then redeploy:

| Variable | Where it lives | Purpose |
| --- | --- | --- |
| `VITE_TWITCH_CLIENT_ID` | client bundle | feature detection + Helix client id |
| `TWITCH_CLIENT_SECRET` | **server only** | client-credentials flow in `api/clips.ts` |
| `TWITCH_BROADCASTER_ID` | server only | whose clips to fetch |

## GitHub Pages fallback

Pages can't do server rewrites: set `base: '/ContentWorkflow/'` in `vite.config.ts`, swap
`createBrowserRouter` → `createHashRouter` in `src/router.tsx`, publish `dist/`. The clips
function is Vercel-only and stays disabled there.

## Data model (Dexie, schema v2)

| Table | Key | Indexes |
| --- | --- | --- |
| `ideas` | `id` | `status, priority, dueDate, createdAt, updatedAt` |
| `checklistTemplates` | `id` | `name` |
| `checklistItems` | `id` | `ideaId, [ideaId+order]` |
| `settings` | `id` | singleton row `'app'` (channel name, quick links) |

Schema history:

- **v1** — ideas / templates / items with embedded `steps` and `links` arrays.
- **v2** — adds `priority`, `dueDate`, `tags` to ideas; `note` to checklist items; the
  `settings` table; and migrates the v1 placeholder upload URLs to the real channel URLs.
  The upgrade runs automatically and preserves all existing data (covered by an automated
  browser test that seeds a v1 database and verifies the migration).

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `⌘K` / `Ctrl K` | Command palette (search ideas, navigate, export) |
| `N` | New idea |
| `↑ ↓ ↵` | Navigate palette results |
| `Esc` | Close dialogs |
