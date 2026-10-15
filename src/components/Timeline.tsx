import { useMemo } from 'react'
import { phases, isPhaseApplicable, type Locale, type MissionPhase } from '../data/phases'
import { t } from '../data/i18n'
import type { DestinationId } from '../data/destinations'
import { formatPlaybackRate, PLAYBACK_RATES, type PlaybackRate } from '../lib/playback'
import { samplePath } from '../lib/transferGeometry'
import { craftKmAt } from '../lib/craftKm'
import { isCislunar } from '../lib/transferGeometry'

type Props = {
  locale: Locale
  destinationId: DestinationId
  progress: number
  playing: boolean
  playbackRate: PlaybackRate
  phaseIndex: number
  phase: MissionPhase
  onProgress: (p: number) => void
  onTogglePlay: () => void
  onPlaybackRate: (rate: PlaybackRate) => void
  onReset?: () => void
}

export function Timeline({
  locale,
  destinationId,
  progress,
  playing,
  playbackRate,
  phaseIndex,
  phase,
  onProgress,
  onTogglePlay,
  onPlaybackRate,
  onReset,
}: Props) {
  const missionTime = useMemo(() => {
    if (isCislunar(destinationId)) {
      const c = craftKmAt(progress)
      return locale === 'en' ? c.timeLabelEn : c.timeLabelZh
    }
    const s = samplePath(progress, destinationId)
    return locale === 'en' ? s.timeLabelEn : s.timeLabelZh
  }, [destinationId, progress, locale])

  const phaseTitle = phase.copy[locale].beginner.title
  const valueText = `${phaseTitle} · ${missionTime}`

  const copyLink = () => {
    const q = new URLSearchParams({
      dest: destinationId,
      lang: locale,
      level: 'beginner',
    })
    const url = `${window.location.origin}${window.location.pathname}?${q.toString()}`
    void navigator.clipboard?.writeText(url)
  }

  return (
    <div className="timeline">
      <div className="timeline-top">
        <button type="button" className="play-btn" onClick={onTogglePlay} aria-pressed={playing}>
          {playing ? t(locale, 'pause') : progress > 0 && progress < 1 ? t(locale, 'resume') : t(locale, 'play')}
        </button>
        <div className="rate-group" role="group" aria-label={t(locale, 'playbackRate')}>
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              className={`rate-btn${playbackRate === rate ? ' active' : ''}`}
              onClick={() => onPlaybackRate(rate)}
              aria-pressed={playbackRate === rate}
              title={t(locale, 'playbackRateHint')}
            >
              {formatPlaybackRate(rate, locale)}
            </button>
          ))}
        </div>
        <span className="timeline-label">{t(locale, 'timeline')}</span>
        <span className="timeline-hint">{t(locale, 'scrubHint')}</span>
        <span className="timeline-warp-badge" title={t(locale, 'timeWarpHint')}>
          {t(locale, 'timeWarpBadge')}
        </span>
        <span className="timeline-mission-time" aria-live="polite">
          {t(locale, 'measTime')}: {missionTime}
        </span>
        <button type="button" className="rate-btn" onClick={copyLink}>
          {t(locale, 'copyLink')}
        </button>
        {onReset && (
          <button type="button" className="rate-btn" onClick={onReset}>
            {t(locale, 'resetLab')}
          </button>
        )}
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(e) => onProgress(Number(e.target.value) / 1000)}
        className="scrubber"
        aria-label={t(locale, 'timeline')}
        aria-valuetext={valueText}
      />
      <div className="phase-ticks">
        {phases.map((ph, i) => {
          const mid = (ph.start + ph.end) / 2
          const copy = ph.copy[locale].beginner
          const applicable = isPhaseApplicable(destinationId, ph.id)
          return (
            <button
              key={ph.id}
              type="button"
              disabled={!applicable}
              className={`phase-tick${i === phaseIndex ? ' active' : ''}${applicable ? '' : ' inactive'}`}
              style={{ left: `${mid * 100}%` }}
              onClick={() => applicable && onProgress(ph.start + 0.001)}
              title={applicable ? copy.title : t(locale, 'phaseNotModeled')}
            >
              <span>{i + 1}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
