/**
 * The Creator Toolkit: every external destination this workflow touches,
 * organized by job. Channel-specific URLs come from db/seed constants.
 */
import {
  INSTAGRAM_URL,
  TIKTOK_PROFILE_URL,
  TIKTOK_UPLOAD_URL,
  TWITCH_CLIPS_URL,
  TWITCH_DASHBOARD_URL,
  YOUTUBE_UPLOAD_URL,
} from '../db/seed'

export interface ToolkitLink {
  label: string
  url: string
  desc: string
}

export interface ToolkitCategory {
  id: string
  title: string
  blurb: string
  accent: string // tailwind text color class for the dot/heading
  links: ToolkitLink[]
}

const YT_CHANNEL_ID = 'UClmDqtKtCpuRq7X8E0DBRjA'
const YT_STUDIO = `https://studio.youtube.com/channel/${YT_CHANNEL_ID}`

export const TOOLKIT: ToolkitCategory[] = [
  {
    id: 'publish',
    title: 'Publish & manage',
    blurb: 'Where the content actually goes out. One tab each, every stream day.',
    accent: 'text-twitch',
    links: [
      { label: 'YouTube Studio', url: YT_STUDIO, desc: 'Channel home: uploads, thumbnails, comments.' },
      { label: 'YouTube upload', url: YOUTUBE_UPLOAD_URL, desc: 'Straight to the upload dialog (Shorts + VODs).' },
      { label: 'TikTok Studio upload', url: TIKTOK_UPLOAD_URL, desc: 'Web uploader — drafts, captions, scheduling.' },
      { label: 'TikTok profile', url: TIKTOK_PROFILE_URL, desc: '@bingusthewizardtv — check how the grid reads.' },
      { label: 'Instagram', url: INSTAGRAM_URL, desc: 'Reels publishing (composer is best on mobile).' },
      { label: 'Twitch dashboard', url: TWITCH_DASHBOARD_URL, desc: 'Stream manager: title, category, tags, markers.' },
      { label: 'Twitch clips manager', url: TWITCH_CLIPS_URL, desc: 'Your raw clip pool from every stream.' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    blurb: 'The Sunday-review tabs. Watch avg % viewed on shorts, CTR on VODs.',
    accent: 'text-emerald-400',
    links: [
      { label: 'YouTube Analytics', url: `${YT_STUDIO}/analytics/tab-overview/period-default`, desc: 'CTR, retention curves, traffic sources.' },
      { label: 'TikTok analytics', url: 'https://www.tiktok.com/tiktokstudio/analytics', desc: 'Completion rate, follower activity windows.' },
      { label: 'Twitch channel analytics', url: 'https://dashboard.twitch.tv/u/BingusTheWizard/channel-analytics', desc: 'Viewer trends, raid performance, notifications.' },
      { label: 'SullyGnome', url: 'https://sullygnome.com/', desc: 'Third-party Twitch stats — category saturation by hour.' },
      { label: 'TwitchTracker', url: 'https://twitchtracker.com/', desc: 'Your channel’s long-term growth curves.' },
    ],
  },
  {
    id: 'clip-edit',
    title: 'Clip & edit',
    blurb: 'VOD → vertical masters with captions. Export clean (no watermarks) once, post 3×.',
    accent: 'text-cyan-300',
    links: [
      { label: 'CapCut', url: 'https://www.capcut.com/', desc: 'Fast vertical edits + auto-captions. The daily driver.' },
      { label: 'StreamLadder', url: 'https://streamladder.com/', desc: 'Twitch clip → 9:16 with facecam layouts.' },
      { label: 'Eklipse', url: 'https://eklipse.gg/', desc: 'AI auto-detects clippable moments in the VOD.' },
      { label: 'Kapwing', url: 'https://www.kapwing.com/', desc: 'Browser editor — good for quick subtitle fixes.' },
      { label: 'OBS Studio', url: 'https://obsproject.com/', desc: 'Replay buffer + local recording settings.' },
    ],
  },
  {
    id: 'design',
    title: 'Thumbnails & design',
    blurb: 'One strong thumbnail per VOD: big face, ≤3 words, readable at 120px wide.',
    accent: 'text-pink-400',
    links: [
      { label: 'Photopea', url: 'https://www.photopea.com/', desc: 'Free Photoshop in the browser — layered thumbnail work.' },
      { label: 'Canva', url: 'https://www.canva.com/', desc: 'Fast templates for thumbnails, panels, schedules.' },
      { label: 'remove.bg', url: 'https://www.remove.bg/', desc: 'One-click cutouts of your facecam pose.' },
    ],
  },
  {
    id: 'audio',
    title: 'Music & SFX',
    blurb: 'Stream-safe only — copyrighted tracks mute VODs and demonetize clips.',
    accent: 'text-amber-400',
    links: [
      { label: 'StreamBeats', url: 'https://www.streambeats.com/', desc: 'Harris Heller’s free DMCA-safe library.' },
      { label: 'Pretzel Rocks', url: 'https://www.pretzel.rocks/', desc: 'Licensed stream music player with track logging.' },
      { label: 'YouTube Audio Library', url: `${YT_STUDIO}/music`, desc: 'Free tracks + SFX cleared for YouTube.' },
      { label: 'Freesound', url: 'https://freesound.org/', desc: 'CC sound effects for edits and alerts.' },
    ],
  },
  {
    id: 'research',
    title: 'Research & trends',
    blurb: 'Ten minutes before titling anything: what’s the format of the week?',
    accent: 'text-violet-300',
    links: [
      { label: 'TikTok Creative Center', url: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en', desc: 'Trending hashtags/sounds by region + category.' },
      { label: 'Google Trends', url: 'https://trends.google.com/trends/', desc: 'Is the game spiking? Ride patch-day searches.' },
      { label: 'YouTube Gaming', url: 'https://www.youtube.com/gaming', desc: 'What thumbnails/titles are winning right now.' },
      { label: 'vidIQ', url: 'https://vidiq.com/', desc: 'Keyword scores + competitor title tracking.' },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    blurb: 'The reply loop: announce before, engage after, recycle questions into clips.',
    accent: 'text-red-400',
    links: [
      { label: 'Discord', url: 'https://discord.com/channels/@me', desc: 'Server announcements before + after streams.' },
      { label: 'Post on X', url: 'https://x.com/intent/post', desc: 'Compose window — going-live + best-clip posts.' },
      { label: 'r/marvelrivals', url: 'https://www.reddit.com/r/marvelrivals/', desc: 'Rivals clip threads + meta discussion.' },
      { label: 'r/Minecraft', url: 'https://www.reddit.com/r/Minecraft/', desc: 'Build showcases (read the self-promo rules).' },
      { label: 'r/chess', url: 'https://www.reddit.com/r/chess/', desc: 'Game analysis threads; brilliancies travel here.' },
    ],
  },
]
