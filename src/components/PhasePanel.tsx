import type { DestinationId } from '../data/destinations'
import { resolvePhaseCopy } from '../data/phaseOverlays'
import type { Difficulty, Locale, MissionPhase } from '../data/phases'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  difficulty: Difficulty
  phase: MissionPhase
  phaseIndex: number
  destinationId: DestinationId
}

export function PhasePanel({ locale, difficulty, phase, phaseIndex, destinationId }: Props) {
  const base = phase.copy[locale][difficulty]
  const copy = resolvePhaseCopy(phase.id, base, destinationId, locale, difficulty)
  return (
    <section className="phase-panel" aria-live="polite">
      <header>
        <p className="eyebrow">
          {t(locale, 'phase')} {phaseIndex + 1} / 8
        </p>
        <h2>{copy.title}</h2>
        <p className="duration">
          {t(locale, 'duration')}: {phase.durationLabel[locale]}
        </p>
      </header>
      <div className="phase-blocks">
        <article>
          <h3>{t(locale, 'narrative')}</h3>
          <p>{copy.narrative}</p>
        </article>
        <article>
          <h3>{t(locale, 'physics')}</h3>
          <p>{copy.physics}</p>
        </article>
        <article>
          <h3>{t(locale, 'engineering')}</h3>
          <p>{copy.engineering}</p>
        </article>
      </div>
    </section>
  )
}
