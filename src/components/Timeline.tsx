import { phases, type Locale } from '../data/phases'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  progress: number
  playing: boolean
  phaseIndex: number
  onProgress: (p: number) => void
  onTogglePlay: () => void
}

export function Timeline({
  locale,
  progress,
  playing,
  phaseIndex,
  onProgress,
  onTogglePlay,
}: Props) {
  return (
    <div className="timeline">
      <div className="timeline-top">
        <button type="button" className="play-btn" onClick={onTogglePlay}>
          {playing ? t(locale, 'pause') : t(locale, 'play')}
        </button>
        <span className="timeline-label">{t(locale, 'timeline')}</span>
        <span className="timeline-hint">{t(locale, 'scrubHint')}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(e) => onProgress(Number(e.target.value) / 1000)}
        className="scrubber"
        aria-label={t(locale, 'timeline')}
      />
      <div className="phase-ticks">
        {phases.map((phase, i) => {
          const mid = (phase.start + phase.end) / 2
          const copy = phase.copy[locale].beginner
          return (
            <button
              key={phase.id}
              type="button"
              className={`phase-tick${i === phaseIndex ? ' active' : ''}`}
              style={{ left: `${mid * 100}%` }}
              onClick={() => onProgress(phase.start + 0.001)}
              title={copy.title}
            >
              <span>{i + 1}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
