/**
 * The weekly 3-stream pipeline: step definitions, platform-optimal specs,
 * copy-paste title/description templates, and viral title patterns —
 * curated per game (Marvel Rivals / Minecraft / Chess).
 *
 * Content lives in code (not the DB) so it ships with deploys; only the
 * per-week checkbox state persists (see db/streams.ts).
 */
import {
  INSTAGRAM_URL,
  TIKTOK_UPLOAD_URL,
  TWITCH_CLIPS_URL,
  TWITCH_DASHBOARD_URL,
  YOUTUBE_UPLOAD_URL,
} from '../db/seed'

export type StreamGame = 'rivals' | 'minecraft' | 'chess'

export const STREAM_GAMES: StreamGame[] = ['rivals', 'minecraft', 'chess']

/** Ideal clips to pull from one 4-hour stream: 2/hour. Three streams a week
 *  yields 24 clips ≈ one post per platform per day without burnout. */
export const CLIP_TARGET = 8

export type PillTone = 'info' | 'warn' | 'avoid'

/** A platform-optimal spec: short pill label + tooltip detail. */
export interface SpecPill {
  label: string
  detail: string
  tone?: PillTone
}

/** A copy-pastable text block ({PLACEHOLDERS} get filled in by hand). */
export interface CopyTemplate {
  label: string
  text: string
}

export interface SubStep {
  id: string
  label: string
}

export type StepKind = 'stream' | 'clips' | 'post' | 'vod' | 'task'

export interface StreamStepDef {
  id: string
  kind: StepKind
  title: string
  /** One-line purpose shown under the title when expanded. */
  blurb: string
  specs: SpecPill[]
  templates?: CopyTemplate[]
  /** Three high-CTR title patterns for this platform, ready to riff on. */
  viralTitles?: string[]
  subSteps?: SubStep[]
  clipTarget?: number
  link?: { label: string; url: string }
}

export interface StreamDef {
  game: StreamGame
  name: string
  tagline: string
  /** CSS theme class on the column root (textures + accent vars). */
  themeClass: string
  defaultDay: number // 0=Sun … 6=Sat
  emoji: string
  resources: { label: string; url: string }[]
  steps: StreamStepDef[]
}

export const TWITCH_CHANNEL_URL = 'https://twitch.tv/bingusthewizard'
export const TIKTOK_HANDLE_URL = 'https://www.tiktok.com/@bingusthewizardtv'

/* ------------------------------------------------------------------ */
/* Platform-optimal specs (game-independent, sourced from platform     */
/* creator guidance + completion/CTR patterns)                         */
/* ------------------------------------------------------------------ */

const TWITCH_SPECS: SpecPill[] = [
  {
    label: 'Same 3 days, same time',
    detail:
      'Schedule consistency is the single biggest Twitch growth lever — viewers build a habit before they build loyalty.',
  },
  {
    label: 'Title = hook + game',
    detail:
      "'ROAD TO GM — ranked all night' beats 'playing games'. Put the stakes in the title and update it when the segment changes.",
  },
  {
    label: 'Mark clips as they happen',
    detail:
      'Hit !clip / stream markers the moment chat pops off. Future-you will not remember the timestamp at hour 3 of VOD review.',
  },
  {
    label: 'End with a raid',
    detail:
      'Raid a similar-sized streamer in your category at the end. Networking compounds and costs nothing.',
  },
]

const CLIP_SPECS: SpecPill[] = [
  {
    label: '2 clips per hour',
    detail: `${CLIP_TARGET} clips from a 4-hour stream is the sustainable pro cadence — 24 clips/week across 3 streams feeds roughly one post per platform per day.`,
  },
  {
    label: 'Clip 15–40s raw',
    detail:
      'Clip generously at the source, then trim to each platform’s sweet spot in the editor. You can cut down; you can’t add back.',
  },
  {
    label: 'One payoff per clip',
    detail:
      'A clip is ONE moment: a clutch, a fail, a big reaction, or a teachable beat. Montages belong in long-form.',
  },
  {
    label: 'If chat popped, it clips',
    detail:
      'Emotion predicts completion rate better than gameplay quality. If you shouted or chat spammed, it’s a clip.',
  },
]

const TIKTOK_SPECS: SpecPill[] = [
  {
    label: '21–34s sweet spot',
    detail:
      'TikTok’s own creator data: completion rate peaks between 21 and 34 seconds. Under ~20s can loop well; over 60s needs a real story arc.',
  },
  {
    label: 'Hook in first 3s',
    detail:
      'The scroll decision happens in under 2 seconds. Open mid-action with the payoff teased on screen — never an intro.',
  },
  { label: '9:16 · 1080×1920', detail: 'Full-frame vertical. Fill the screen; no letterboxing.' },
  {
    label: '3–5 hashtags',
    detail:
      'Mix niche (#marvelrivals-style) with one broad (#gaming). Caption keywords matter — TikTok is a search engine now.',
  },
  {
    label: 'Post 6–10pm local',
    detail:
      'Peak scroll window for gaming audiences. Consistency of posting beats perfect timing.',
  },
  {
    label: 'Avoid “kill / gun” text',
    tone: 'avoid',
    detail:
      'Moderation downranks violent phrasing in captions and text overlays. Say “eliminated”, “KO’d”, “deleted”, “sent to the lobby”.',
  },
  {
    label: 'No cross-platform watermarks',
    tone: 'avoid',
    detail:
      'Content with another platform’s watermark gets reduced distribution. Export clean from your editor.',
  },
]

const SHORTS_SPECS: SpecPill[] = [
  {
    label: '15–60s ideal',
    detail:
      'Shorts allows up to 3 minutes, but clip content performs best at 15–60s — and under ~35s loops, which inflates average % viewed.',
  },
  {
    label: 'Hook in first 2s',
    detail:
      'First frame should already be the action, with on-screen text stating the stakes. Swipe decisions are instant.',
  },
  {
    label: 'Loop cleanly',
    detail:
      'Replays count toward retention. End the clip where the start makes sense again and people watch it twice.',
  },
  {
    label: 'Keyword-first title',
    detail:
      'Front-load game + moment (“Marvel Rivals 1v5…”). Shorts titles are indexed for YouTube search.',
  },
  {
    label: 'Pin a comment',
    detail:
      'Pin a question (“should I have ulted earlier?”) right after posting — early engagement velocity boosts distribution.',
  },
  {
    label: 'No TikTok watermark',
    tone: 'avoid',
    detail: 'YouTube explicitly deprioritizes watermarked cross-posts. Export a clean master.',
  },
]

const REELS_SPECS: SpecPill[] = [
  {
    label: '15–30s ideal',
    detail:
      'Reels under 90s are eligible for full recommendation reach; 15–30s clips have the best completion rates.',
  },
  {
    label: 'Captions burned in',
    detail:
      'Most Reels viewers start muted. Burn in captions/subtitles or the first 3 seconds are wasted.',
  },
  {
    label: '4:5 safe zone',
    detail:
      'The feed crops 9:16 to 4:5. Keep the action and any text center-frame so the crop never hides the payoff.',
  },
  { label: '3–5 hashtags', detail: 'Niche + broad mix, same as TikTok. Put keywords in the caption text too.' },
  {
    label: 'Share to Story',
    detail: 'Re-share the Reel to your Story for a free second distribution pass to followers.',
  },
  {
    label: 'No TikTok watermark',
    tone: 'avoid',
    detail:
      'Instagram has confirmed it downranks visibly recycled TikToks. Always export the clean version.',
  },
]

const VOD_SPECS: SpecPill[] = [
  {
    label: 'Custom thumbnail',
    detail:
      '1280×720, under 2MB. Big expressive face + ≤3 words. Thumbnail and title ARE your click-through rate — aim above ~4%.',
  },
  {
    label: 'Title ≤60 chars',
    detail: 'Front-load game + hook so nothing truncates in the feed or search results.',
  },
  {
    label: 'First 125 chars matter',
    detail:
      'That’s what shows in search results. Lead the description with a keyword-rich hook sentence; links go below the fold.',
  },
  {
    label: 'Chapters from 0:00',
    detail:
      'Three or more timestamps (starting at 0:00) unlock chapter markers — viewers skip to highlights instead of leaving.',
  },
  {
    label: 'End screen last 20s',
    detail: 'Point the end screen at last week’s VOD or your best Short. Session time is a ranking signal.',
  },
  {
    label: 'Publish in a fixed slot',
    detail: 'Upload VODs on a consistent day/time. It trains both the algorithm and your audience.',
  },
]

const ENGAGE_SPECS: SpecPill[] = [
  {
    label: 'First 24h matter most',
    detail:
      'Every platform measures early response velocity. Replies in the first day multiply distribution; replies next week do nothing.',
  },
  {
    label: 'Reply, heart, pin',
    detail:
      'Reply to every substantive comment, heart the rest, pin the best thread-starter on TikTok and Shorts.',
  },
  {
    label: 'Recycle questions',
    detail:
      'Comments asking “how did you…?” are next week’s clip ideas — answer with a video reply when the platform supports it.',
  },
]

const ANALYTICS_SPECS: SpecPill[] = [
  {
    label: 'Short-form: watch avg %',
    detail:
      'Average % viewed is THE short-form ranking signal. Anything above ~90% (loops help) — make more exactly like it.',
  },
  {
    label: 'VOD: watch CTR',
    detail:
      'Long-form lives on click-through rate. Under ~4%? Iterate the thumbnail/title before blaming the content.',
  },
  {
    label: 'Double down weekly',
    detail:
      'The best clip of this week defines next week’s title and thumbnail angle. Momentum compounds; novelty resets it.',
  },
]

/* ------------------------------------------------------------------ */
/* Shared step scaffolding                                             */
/* ------------------------------------------------------------------ */

const PREFLIGHT: SubStep[] = [
  { id: 'title', label: 'Twitch title, category & tags set' },
  { id: 'announce', label: 'Announced on Discord + socials' },
  { id: 'markers', label: 'Clip moments marked live (!clip / markers)' },
]

const ENGAGE_SUBS: SubStep[] = [
  { id: 'tiktok', label: 'TikTok comments answered' },
  { id: 'youtube', label: 'YouTube (Shorts + VOD) comments answered' },
  { id: 'reels', label: 'Instagram comments answered' },
]

interface PlatformContent {
  templates: CopyTemplate[]
  viralTitles: string[]
}

interface GameContent {
  game: StreamGame
  name: string
  tagline: string
  themeClass: string
  defaultDay: number
  emoji: string
  resources: { label: string; url: string }[]
  /** Extra game-specific guardrail pills merged into the stream step. */
  streamExtras: SpecPill[]
  tiktok: PlatformContent
  shorts: PlatformContent
  reels: PlatformContent
  vod: PlatformContent
}

function socialsFooter(): string {
  return [
    `🔴 Live 3x a week → ${TWITCH_CHANNEL_URL}`,
    `🎬 Daily clips → ${TIKTOK_HANDLE_URL}`,
    `▶️ Full streams → youtube.com/@BingusTheWizard`,
  ].join('\n')
}

function buildSteps(c: GameContent): StreamStepDef[] {
  return [
    {
      id: 'stream',
      kind: 'stream',
      title: '4-Hour Stream',
      blurb: `Go live on Twitch — ${c.name}, 4 hours. Everything below feeds off this session.`,
      specs: [...TWITCH_SPECS, ...c.streamExtras],
      subSteps: PREFLIGHT,
      link: { label: 'Twitch dashboard', url: TWITCH_DASHBOARD_URL },
    },
    {
      id: 'clips',
      kind: 'clips',
      title: `Select ${CLIP_TARGET} clips`,
      blurb:
        'Sweep the VOD + markers and lock in the week’s clip pool. These 8 feed every platform below.',
      specs: CLIP_SPECS,
      clipTarget: CLIP_TARGET,
      link: { label: 'Twitch clips manager', url: TWITCH_CLIPS_URL },
    },
    {
      id: 'post-tiktok',
      kind: 'post',
      title: 'Post clips to TikTok',
      blurb: 'Vertical cuts with burned-in captions. Spread the 8 clips across the week — don’t dump them all at once.',
      specs: TIKTOK_SPECS,
      templates: c.tiktok.templates,
      viralTitles: c.tiktok.viralTitles,
      link: { label: 'TikTok Studio upload', url: TIKTOK_UPLOAD_URL },
    },
    {
      id: 'post-shorts',
      kind: 'post',
      title: 'Post clips to YouTube Shorts',
      blurb: 'Same masters, re-titled for YouTube search. Shorts funnel subscribers to the full VODs.',
      specs: SHORTS_SPECS,
      templates: c.shorts.templates,
      viralTitles: c.shorts.viralTitles,
      link: { label: 'YouTube upload', url: YOUTUBE_UPLOAD_URL },
    },
    {
      id: 'post-reels',
      kind: 'post',
      title: 'Post clips to Instagram Reels',
      blurb: 'Clean exports (no watermarks), captions on, action in the 4:5 center. Share each Reel to your Story.',
      specs: REELS_SPECS,
      templates: c.reels.templates,
      viralTitles: c.reels.viralTitles,
      link: { label: 'Instagram', url: INSTAGRAM_URL },
    },
    {
      id: 'vod',
      kind: 'vod',
      title: 'Post full stream to YouTube',
      blurb: 'The 4-hour VOD, packaged properly: thumbnail, keyword title, chapters, end screen.',
      specs: VOD_SPECS,
      templates: c.vod.templates,
      viralTitles: c.vod.viralTitles,
      link: { label: 'YouTube upload', url: YOUTUBE_UPLOAD_URL },
    },
    {
      id: 'engage',
      kind: 'task',
      title: 'Engagement pass',
      blurb: 'One focused session replying across all three platforms while the posts are still “new”.',
      specs: ENGAGE_SPECS,
      subSteps: ENGAGE_SUBS,
    },
    {
      id: 'analytics',
      kind: 'task',
      title: 'Log analytics & pick next angle',
      blurb: 'Ten minutes with the numbers: what won, what flopped, and what next week’s titles lean into.',
      specs: ANALYTICS_SPECS,
    },
  ]
}

/* ------------------------------------------------------------------ */
/* Marvel Rivals                                                       */
/* ------------------------------------------------------------------ */

const RIVALS: GameContent = {
  game: 'rivals',
  name: 'Marvel Rivals',
  tagline: 'Hero-shooter chaos — clip the outplays',
  themeClass: 'theme-rivals',
  defaultDay: 1, // Monday
  emoji: '💥',
  resources: [
    { label: 'Rivals Tracker', url: 'https://tracker.gg/marvel-rivals' },
    { label: 'Patch notes', url: 'https://www.marvelrivals.com/gameupdate/' },
    { label: 'r/marvelrivals', url: 'https://www.reddit.com/r/marvelrivals/' },
  ],
  streamExtras: [
    {
      label: 'Play meta or menace',
      tone: 'warn',
      detail:
        'Clips come from either dominating the meta pick or doing something unhinged with an off-meta hero. The middle is unclippable.',
    },
  ],
  tiktok: {
    templates: [
      {
        label: 'Title / caption',
        text: 'the {HERO} play that ended the whole lobby 😭 | Marvel Rivals',
      },
      {
        label: 'Description',
        text: '{ONE-LINER — e.g. “he really thought the shield would save him”}\n\n#marvelrivals #marvelrivalsclips #{HERO} #heroshooter #gamingclips #fyp',
      },
    ],
    viralTitles: [
      'bro thought he was safe from the {HERO} 💀',
      'POV: you queue ranked and get THIS {HERO} on your team',
      'day {N} of clipping every {HERO} highlight until Marvel notices',
    ],
  },
  shorts: {
    templates: [
      {
        label: 'Title',
        text: 'This {HERO} Play Should Be Illegal 🤯 #marvelrivals',
      },
      {
        label: 'Description',
        text: '{MOMENT} — live on my Marvel Rivals ranked climb.\n\n' + socialsFooter() + '\n\n#marvelrivals #shorts #gaming',
      },
    ],
    viralTitles: [
      'The {HERO} 1v5 That Broke My Chat 🤯',
      'When a {RANK} {HERO} Actually Cooks…',
      '99% of {HERO} Players Can’t Do This',
    ],
  },
  reels: {
    templates: [
      {
        label: 'Caption',
        text: 'this is why you never diff a {HERO} main 😤\n\n{ONE-LINER}\n\n#marvelrivals #gamingclips #reels #heroshooter #twitchclips',
      },
    ],
    viralTitles: [
      'this is why you never diff a {HERO} main 😤',
      'the save of the century (watch till the end)',
      'ranked lobbies fear this one trick',
    ],
  },
  vod: {
    templates: [
      {
        label: 'VOD title',
        text: 'I Played {HERO} Until I Hit {RANK} — Marvel Rivals Full Stream',
      },
      {
        label: 'VOD description',
        text:
          'Marvel Rivals ranked: {HOOK — what happened this session, keywords first}.\n\n' +
          '⏱ CHAPTERS\n0:00 — Going live / warmup\n{T} — {SEGMENT}\n{T} — {BIG MOMENT}\n{T} — {CLOSER}\n\n' +
          socialsFooter() +
          '\n\n#marvelrivals #twitch #vod',
      },
    ],
    viralTitles: [
      'I Queued Marvel Rivals Ranked for 4 Hours and This Lobby Broke Me',
      'Road to {RANK}: ONLY {HERO} (this got out of hand)',
      'Marvel Rivals Ranked, But Chat Picks My Hero',
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Minecraft                                                           */
/* ------------------------------------------------------------------ */

const MINECRAFT: GameContent = {
  game: 'minecraft',
  name: 'Minecraft',
  tagline: 'Cozy builds & chaos — clip the moments',
  themeClass: 'theme-minecraft',
  defaultDay: 3, // Wednesday
  emoji: '⛏️',
  resources: [
    { label: 'Minecraft Wiki', url: 'https://minecraft.wiki/' },
    { label: 'Chunk Base tools', url: 'https://www.chunkbase.com/apps/seed-map' },
    { label: 'r/Minecraft', url: 'https://www.reddit.com/r/Minecraft/' },
  ],
  streamExtras: [
    {
      label: 'Hide seed & coords',
      tone: 'avoid',
      detail:
        'F3 off before anything clippable. Leaked seeds/coords invite stream-sniping and griefing on shared worlds.',
    },
    {
      label: 'Name an on-stream goal',
      detail:
        '“Tonight we finish the tower roof” gives the stream an arc — and gives the VOD its title before you even start.',
    },
  ],
  tiktok: {
    templates: [
      {
        label: 'Title / caption',
        text: 'day {N} of building {PROJECT} in survival 🧱',
      },
      {
        label: 'Description',
        text: '{ONE-LINER — e.g. “the roof finally stopped looking cursed”}\n\n#minecraft #minecraftbuilds #survivalminecraft #minecrafttok #gamingtok #fyp',
      },
    ],
    viralTitles: [
      'rating chat’s build ideas until one breaks me',
      'day {N} of the survival world — it’s getting out of hand',
      'POV: you find diamonds in the last 10 minutes of a 4-hour stream',
    ],
  },
  shorts: {
    templates: [
      {
        label: 'Title',
        text: 'I Built {PROJECT} in Survival Minecraft (4-Hour Stream)',
      },
      {
        label: 'Description',
        text: '{MOMENT} — from my weekly Minecraft build stream.\n\n' + socialsFooter() + '\n\n#minecraft #shorts #minecraftbuilds',
      },
    ],
    viralTitles: [
      'I Built {PROJECT} in Survival Minecraft (No Creative)',
      'Minecraft, But Chat Controls the Build',
      'The Most Satisfying {PROJECT} Transformation',
    ],
  },
  reels: {
    templates: [
      {
        label: 'Caption',
        text: 'the {PROJECT} glow-up nobody asked for 🧱✨\n\n{ONE-LINER}\n\n#minecraft #minecraftbuilds #reels #minecraftideas #gaming',
      },
    ],
    viralTitles: [
      'the {PROJECT} glow-up nobody asked for 🧱✨',
      'POV: 4 hours of mining for THIS',
      'smallest detail, biggest difference — build tip #{N}',
    ],
  },
  vod: {
    templates: [
      {
        label: 'VOD title',
        text: 'I Spent 4 Hours Building {PROJECT} in Survival Minecraft — Day {N}',
      },
      {
        label: 'VOD description',
        text:
          'Survival Minecraft, day {N}: {HOOK — the goal + how it went, keywords first}.\n\n' +
          '⏱ CHAPTERS\n0:00 — Going live / world tour\n{T} — {GATHERING / PREP}\n{T} — {THE BUILD}\n{T} — {REVEAL}\n\n' +
          socialsFooter() +
          '\n\n#minecraft #survivalminecraft #vod',
      },
    ],
    viralTitles: [
      'I Spent 4 Hours Building {PROJECT} in Survival — Worth It?',
      'Hardcore Minecraft Day {N}: One Mistake Ends Everything',
      'Building My Dream {PROJECT} While Chat Judges Me',
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Chess                                                               */
/* ------------------------------------------------------------------ */

const CHESS: GameContent = {
  game: 'chess',
  name: 'Chess',
  tagline: 'Rating climb — clip the brilliancies',
  themeClass: 'theme-chess',
  defaultDay: 5, // Friday
  emoji: '♟️',
  resources: [
    { label: 'Chess.com', url: 'https://www.chess.com/' },
    { label: 'Lichess analysis', url: 'https://lichess.org/analysis' },
    { label: 'Opening explorer', url: 'https://www.chess.com/explorer' },
    { label: 'r/chess', url: 'https://www.reddit.com/r/chess/' },
  ],
  streamExtras: [
    {
      label: 'Flame positions, not players',
      tone: 'avoid',
      detail:
        'Blur or crop opponent usernames in clips where you’re trash-talking. Harassment reports take down clips (and accounts).',
    },
    {
      label: 'Never title “cheater”',
      tone: 'avoid',
      detail:
        'Accusation titles get mass-reported and age terribly. “The engine said 99.2 accuracy” says it without saying it.',
    },
  ],
  tiktok: {
    templates: [
      {
        label: 'Title / caption',
        text: 'he thought the rook was free 💀 | chess',
      },
      {
        label: 'Description',
        text: '{ONE-LINER — e.g. “the fork he never saw coming”}\n\n#chess #chesstok #chessclips #rapidchess #ratingclimb #fyp',
      },
    ],
    viralTitles: [
      'he thought I blundered my queen… 💀',
      'rating climb day {N}: {ELO} → ??? (it’s not going well)',
      'POV: your opponent premoves into mate in 2',
    ],
  },
  shorts: {
    templates: [
      {
        label: 'Title',
        text: 'The Rook Sacrifice That Broke His Brain 🧠 #chess',
      },
      {
        label: 'Description',
        text: '{MOMENT} — from my live rating climb.\n\n' + socialsFooter() + '\n\n#chess #shorts #chesstok',
      },
    ],
    viralTitles: [
      'The Rook Sacrifice That Broke His Brain 🧠',
      'I Found a Brilliant Move With 3 Seconds Left',
      '{ELO} Elo Chess Is a Different Kind of Chaos',
    ],
  },
  reels: {
    templates: [
      {
        label: 'Caption',
        text: 'the most disrespectful checkmate I’ve ever delivered ♟️\n\n{ONE-LINER}\n\n#chess #chesstok #reels #checkmate #ratingclimb',
      },
    ],
    viralTitles: [
      'the most disrespectful checkmate I’ve ever delivered',
      'chess speedrun day {N}: climbing to {ELO}',
      'watch the eval bar have a heart attack',
    ],
  },
  vod: {
    templates: [
      {
        label: 'VOD title',
        text: 'Road to {ELO}: 4 Hours of Rated Chess (Full Stream)',
      },
      {
        label: 'VOD description',
        text:
          'Rated chess climb toward {ELO}: {HOOK — best game / worst blunder, keywords first}.\n\n' +
          '⏱ CHAPTERS\n0:00 — Going live / warmup puzzles\n{T} — {FIRST RATED GAMES}\n{T} — {BEST GAME}\n{T} — {LOSS REVIEW}\n\n' +
          socialsFooter() +
          '\n\n#chess #ratingclimb #vod',
      },
    ],
    viralTitles: [
      'Road to {ELO}: 4 Hours of Rated Chess (It Got Personal)',
      'I Played Chess Until My Elo Made Sense — Day {N}',
      'Rapid Chess Climb + Reviewing Every Loss Live',
    ],
  },
}

/* ------------------------------------------------------------------ */

function toDef(c: GameContent): StreamDef {
  return {
    game: c.game,
    name: c.name,
    tagline: c.tagline,
    themeClass: c.themeClass,
    defaultDay: c.defaultDay,
    emoji: c.emoji,
    resources: c.resources,
    steps: buildSteps(c),
  }
}

export const STREAMS: Record<StreamGame, StreamDef> = {
  rivals: toDef(RIVALS),
  minecraft: toDef(MINECRAFT),
  chess: toDef(CHESS),
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
