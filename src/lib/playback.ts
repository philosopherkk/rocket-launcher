/** Timeline playback rates (multipliers on base duration). */
export const PLAYBACK_RATES = [1, 10, 100, 1000] as const
export type PlaybackRate = (typeof PLAYBACK_RATES)[number]

/** Wall-clock seconds for a full 0→1 scrub at 1×. */
export const BASE_TIMELINE_SECONDS = 120

/** Default: 100× so a Moon round-trip coast is watchable (~1.2 s full run). */
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 100

export function formatPlaybackRate(rate: PlaybackRate, locale: 'en' | 'zh-Hant'): string {
  return locale === 'en' ? `${rate}×` : `${rate}×`
}

export function nextPlaybackRate(current: PlaybackRate): PlaybackRate {
  const i = PLAYBACK_RATES.indexOf(current)
  return PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]
}
