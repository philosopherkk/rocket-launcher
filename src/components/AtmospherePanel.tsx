import {
  atmosphereContext,
  atmosphereIntro,
  earthLayers,
  getBodyAtmosphere,
  heatingTopics,
} from '../data/atmosphere'
import type { DestinationId } from '../data/destinations'
import type { Difficulty, Locale, PhaseId } from '../data/phases'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  difficulty: Difficulty
  destinationId: DestinationId
  phaseId: PhaseId
}

export function AtmospherePanel({ locale, difficulty, destinationId, phaseId }: Props) {
  const ctx = atmosphereContext(phaseId)
  const intro = atmosphereIntro[ctx][locale][difficulty]
  const body = getBodyAtmosphere(destinationId)
  const showEarthLayers = destinationId === 'moon' || ctx === 'ascent' || ctx === 'entry'
  const showHeating = ctx === 'entry' || ctx === 'ascent' || phaseId === 'lunarApproach'

  return (
    <section className="atmosphere-panel" aria-label={t(locale, 'atmosphereTitle')}>
      <header>
        <p className="eyebrow">{t(locale, 'atmosphereTitle')}</p>
        <h2>{t(locale, 'atmosphereSubtitle')}</h2>
        <p className="duration">{intro}</p>
      </header>

      <article className="atmo-body">
        <h3>{body.title[locale]}</h3>
        <p>{body.summary[locale][difficulty]}</p>
        <ul className="atmo-bullets">
          {body.bullets.map((b) => (
            <li key={b.label.en}>
              <span className="fact-label">{b.label[locale]}</span>
              <span className="fact-value">{b.value[locale]}</span>
            </li>
          ))}
        </ul>
      </article>

      {showEarthLayers && (
        <article>
          <h3>{t(locale, 'earthLayersTitle')}</h3>
          <p className="caveat">{t(locale, 'earthLayersNote')}</p>
          <ol className="layer-list">
            {earthLayers.map((layer) => (
              <li key={layer.id}>
                <div className="layer-head">
                  <strong>{layer.name[locale]}</strong>
                  <span>{layer.altitudeKm[locale]}</span>
                </div>
                <p>{layer.role[locale][difficulty]}</p>
              </li>
            ))}
          </ol>
        </article>
      )}

      {showHeating && (
        <article>
          <h3>{t(locale, 'heatingTitle')}</h3>
          <div className="heating-topics">
            {heatingTopics
              .filter((topic) => {
                if (ctx === 'ascent') return topic.id === 'dynamic-pressure' || topic.id === 'not-friction'
                return true
              })
              .map((topic) => (
                <div key={topic.id} className="heating-card">
                  <h4>{topic.title[locale]}</h4>
                  <p>{topic.body[locale][difficulty]}</p>
                </div>
              ))}
          </div>
        </article>
      )}
    </section>
  )
}
