/** Timeline playback rates (multipliers on base duration). */
export const PLAYBACK_RATES = [1, 10, 100, 1000] as const
export type PlaybackRate = (typeof PLAYBACK_RATES)[number]

/** Wall-clock seconds for a full 0→1 scrub at 1×. */
export const BASE_TIMELINE_SECONDS = 120

/** Default 10×: full scrub ~12 s so the whole transit stays watchable; 100×/1000× for fast coast. */
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 10

export function formatPlaybackRate(rate: PlaybackRate, locale: 'en' | 'zh-Hant'): string {
  return locale === 'en' ? `${rate}×` : `${rate}×`
}

export function nextPlaybackRate(current: PlaybackRate): PlaybackRate {
  const i = PLAYBACK_RATES.indexOf(current)
  return PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]
}
