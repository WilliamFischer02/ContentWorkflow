import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Optional Vercel serverless function: fetches the broadcaster's recent
 * Twitch clips via the Helix API using the client-credentials flow.
 * The client secret lives only in server-side env vars — never in the
 * client bundle. Responds 501 (gracefully handled by the UI) when the
 * required env vars are not configured.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.VITE_TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const broadcasterId = process.env.TWITCH_BROADCASTER_ID

  if (!clientId || !clientSecret || !broadcasterId) {
    res.status(501).json({
      error:
        'Twitch API not configured. Set VITE_TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET and TWITCH_BROADCASTER_ID in your Vercel project env vars.',
    })
    return
  }

  try {
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })
    if (!tokenRes.ok) {
      res.status(502).json({ error: `Twitch token request failed (${tokenRes.status})` })
      return
    }
    const { access_token } = (await tokenRes.json()) as { access_token: string }

    const clipsRes = await fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${encodeURIComponent(broadcasterId)}&first=10`,
      {
        headers: {
          'Client-Id': clientId,
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
    if (!clipsRes.ok) {
      res.status(502).json({ error: `Twitch clips request failed (${clipsRes.status})` })
      return
    }
    const data = (await clipsRes.json()) as {
      data: Array<{ id: string; url: string; title: string; view_count: number; created_at: string }>
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({
      clips: data.data.map(({ id, url, title, view_count, created_at }) => ({
        id,
        url,
        title,
        view_count,
        created_at,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
  }
}
