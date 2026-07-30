import type { AppSettings, ChecklistTemplate, QuickLink, TemplateStep } from './types'

/** Legacy placeholder URLs from schema v1 — migrated to the real channel URLs in v2. */
export const LEGACY_YOUTUBE_UPLOAD_URL = 'https://studio.youtube.com/channel/UC/videos/upload'
export const LEGACY_TIKTOK_UPLOAD_URL = 'https://www.tiktok.com/tiktokstudio/upload'

export const YOUTUBE_UPLOAD_URL =
  'https://studio.youtube.com/channel/UClmDqtKtCpuRq7X8E0DBRjA/videos/upload'
export const TIKTOK_UPLOAD_URL = 'https://www.tiktok.com/tiktokstudio/upload?from=webapp&tab=video'
export const TIKTOK_PROFILE_URL = 'https://www.tiktok.com/@bingusthewizardtv'
export const INSTAGRAM_URL = 'https://www.instagram.com/'
export const TWITCH_CLIPS_URL = 'https://dashboard.twitch.tv/u/BingusTheWizard/content/clips'
export const TWITCH_DASHBOARD_URL = 'https://dashboard.twitch.tv/'

export function defaultQuickLinks(): QuickLink[] {
  return [
    { id: crypto.randomUUID(), label: 'YouTube upload', url: YOUTUBE_UPLOAD_URL, color: 'red' },
    { id: crypto.randomUUID(), label: 'TikTok upload', url: TIKTOK_UPLOAD_URL, color: 'cyan' },
    { id: crypto.randomUUID(), label: 'TikTok profile', url: TIKTOK_PROFILE_URL, color: 'cyan' },
    {
      id: crypto.randomUUID(),
      label: 'Instagram',
      url: INSTAGRAM_URL,
      color: 'pink',
      note: 'Reel creation is mobile-only',
    },
    { id: crypto.randomUUID(), label: 'Twitch clips', url: TWITCH_CLIPS_URL, color: 'purple' },
    {
      id: crypto.randomUUID(),
      label: 'Twitch dashboard',
      url: TWITCH_DASHBOARD_URL,
      color: 'purple',
    },
  ]
}

export function defaultSettings(): AppSettings {
  return {
    id: 'app',
    channelName: 'BingusTheWizard',
    quickLinks: defaultQuickLinks(),
  }
}

interface StepSeed {
  label: string
  type: TemplateStep['type']
  deepLinkUrl?: string
}

const DEFAULT_STEPS: StepSeed[] = [
  { label: '0a. Choose game to stream', type: 'task' },
  { label: '0b. Decide title & thumbnail idea', type: 'task' },
  { label: '1. Stream the session', type: 'task' },
  { label: '2. Review VOD / mark timestamps', type: 'task' },
  { label: '3. Create Twitch clips', type: 'link-input' },
  { label: '4. Generate vertical clips (StreamLadder/Eklipse)', type: 'task' },
  { label: '5. Edit captions & hooks per platform', type: 'task' },
  { label: '6. Upload YouTube Short', type: 'deep-link', deepLinkUrl: YOUTUBE_UPLOAD_URL },
  { label: '7. Upload TikTok', type: 'deep-link', deepLinkUrl: TIKTOK_UPLOAD_URL },
  { label: '8. Upload Instagram Reel', type: 'task' },
  { label: '9. Write titles/descriptions/hashtags', type: 'task' },
  { label: '10. Share clips to Discord/subreddits/forums', type: 'link-input' },
]

export function buildDefaultTemplate(): ChecklistTemplate {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: 'Stream → Clips pipeline',
    steps: DEFAULT_STEPS.map((step, index) => ({
      id: crypto.randomUUID(),
      order: index,
      label: step.label,
      type: step.type,
      ...(step.deepLinkUrl ? { deepLinkUrl: step.deepLinkUrl } : {}),
    })),
    createdAt: now,
    updatedAt: now,
  }
}
