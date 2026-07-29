# ContentWorkflow 🧙

**BingusTheWizard's content-workflow dashboard** — a local-first web app for running the
stream → clips → short-form pipeline as a solo streamer.

Two parts:

1. **Channel quick-links bar** — one-click, new-tab access to YouTube upload, TikTok upload,
   Instagram (Reel creation is mobile-only), the Twitch clips manager, and the Twitch dashboard.
2. **Ideas / project manager** — every stream "Idea" is a project that instantiates a
   customizable checklist template covering the whole pipeline: choose game → stream →
   review VOD → create clips → make verticals → upload per platform → share everywhere.

All data lives **locally in your browser** (IndexedDB via Dexie.js). No backend, no login,
no cloud — clearing site data clears the dashboard.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Dexie.js](https://dexie.org/) (IndexedDB) with versioned schema, seeded default template
- [React Router](https://reactrouter.com/) (`createBrowserRouter`)
- Hosted on [Vercel](https://vercel.com/) with a SPA rewrite (`vercel.json`)

## Features

- **Ideas CRUD** — title, game, status (backlog / active / done), notes, timestamps.
- **Checklist templates CRUD** — reorder, relabel, retype and add/remove steps. Three step types:
  - `task` — simple checkbox
  - `deep-link` — checkbox + a button that opens a hardcoded URL (YouTube/TikTok upload pages)
  - `link-input` — checkbox + collect multiple labeled URLs (e.g. clip a/b/c), rendered as
    clickable links
- **Per-idea progress** — each Idea gets its own *copy* of the template steps, so checked
  state and pasted links persist independently. **Editing a template never wipes existing
  Ideas' progress** — changes only apply to Ideas created afterwards.
- **Progress bar** per Idea, status filters, dashboard overview.
- **Optional**: "Fetch recent Twitch clips" via a Vercel serverless function (`/api/clips`)
  using the Twitch Helix API — gracefully disabled until configured.

## Local development

Requires **Node.js 20 LTS** (or newer).

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build locally
```

> The `/api/clips` serverless function does not run under `npm run dev` (plain Vite).
> Use `vercel dev` if you want to exercise it locally — the UI handles its absence gracefully.

## Deploying to Vercel

1. Push this repo to GitHub.
2. [Import the repo](https://vercel.com/new) in Vercel — it auto-detects Vite
   (build command `npm run build`, output `dist`).
3. `vercel.json` already contains the catch-all rewrite so deep links like `/ideas/123`
   resolve to the SPA:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
4. Deploy. Done — no further configuration needed for the core app.

### Optional: Twitch clip auto-fetch

1. Register an app at the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
   to get a **Client ID** and **Client Secret**.
2. Find your broadcaster id (`GET /helix/users?login=BingusTheWizard`).
3. In the Vercel project settings, add the env vars from [`.env.example`](.env.example):
   - `VITE_TWITCH_CLIENT_ID` (safe for the client bundle)
   - `TWITCH_CLIENT_SECRET` (**server-side only** — used exclusively by `api/clips.ts`)
   - `TWITCH_BROADCASTER_ID`
4. Redeploy. The "Fetch recent Twitch clips" button on the dashboard now works.
   If the vars are unset the endpoint returns 501 and the UI shows a friendly notice.

## GitHub Pages fallback

GitHub Pages can't do server-side rewrites, so `createBrowserRouter` deep links would 404
on refresh. If you must deploy to Pages instead of Vercel:

1. In `vite.config.ts`, set the base path:
   ```ts
   export default defineConfig({ base: '/ContentWorkflow/', ... })
   ```
2. In `src/router.tsx`, swap `createBrowserRouter` for `createHashRouter`
   (same route table, `#/`-style URLs).
3. Build and publish `dist/` to Pages. The `/api/clips` function is Vercel-only and will
   simply stay disabled.

## Data model

Dexie database `ContentWorkflowDB`, schema v1 (see `src/db/db.ts`):

| Table                | Key  | Indexes                       |
| -------------------- | ---- | ----------------------------- |
| `ideas`              | `id` | `status, createdAt, updatedAt` |
| `checklistTemplates` | `id` | `name`                        |
| `checklistItems`     | `id` | `ideaId, [ideaId+order]`      |

- `ChecklistTemplate.steps` is an embedded, ordered array of `TemplateStep`
  (`task` / `deep-link` / `link-input`, optional `deepLinkUrl`).
- `ChecklistItem` is a per-Idea copy of a step with its own `done` flag and embedded
  `links: [{ id, label, url }]` entries.
- A default "Stream → Clips pipeline" template (steps 0a–10) is seeded on first run.
- Future schema changes go through Dexie's versioned migrations
  (`db.version(n).stores(...).upgrade(...)`).
