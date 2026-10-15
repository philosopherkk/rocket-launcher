import { destinations, getDestination, type DestinationId } from '../data/destinations'
import type { Difficulty, Locale } from '../data/phases'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  difficulty: Difficulty
  destinationId: DestinationId
  onDestination: (id: DestinationId) => void
}

export function DestinationPanel({ locale, difficulty, destinationId, onDestination }: Props) {
  const dest = getDestination(destinationId)
  const blurb = dest.copy[locale][difficulty]

  return (
    <section className="destination-panel">
      <header className="destination-header">
        <div>
          <p className="eyebrow">{t(locale, 'destination')}</p>
          <h2>{dest.name[locale]}</h2>
          <p className="duration">{dest.short[locale]}</p>
        </div>
        <div className="destination-pills" role="tablist" aria-label={t(locale, 'destination')}>
          {destinations.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={d.id === destinationId}
              className={`dest-pill${d.id === destinationId ? ' active' : ''}`}
              onClick={() => onDestination(d.id)}
            >
              {d.name[locale]}
            </button>
          ))}
        </div>
      </header>

      <p className="dest-overview">{blurb.overview}</p>
      <p className="vehicle-note">{dest.vehicleNote[locale]}</p>

      <div className="dest-grid">
        <article>
          <h3>{t(locale, 'energyTitle')}</h3>
          <p className="dest-explain">{blurb.energyExplain}</p>
          <ul className="energy-rows">
            {dest.energy.rows.map((row) => (
              <li key={row.id}>
                <span className="fact-label">{row.label[locale]}</span>
                <span className="fact-value">{row.value[locale]}</span>
                {row.note && <span className="fact-note">{row.note[locale]}</span>}
              </li>
            ))}
          </ul>
          <p className="caveat">{dest.energy.caveats[locale]}</p>
        </article>

        <article>
          <h3>{t(locale, 'windowsTitle')}</h3>
          <p className="dest-explain">{blurb.windowExplain}</p>
          <dl className="window-dl">
            <div>
              <dt>{t(locale, 'windowCadence')}</dt>
              <dd>{dest.windows.cadence[locale]}</dd>
            </div>
            <div>
              <dt>{t(locale, 'windowOneWay')}</dt>
              <dd>{dest.windows.oneWay[locale]}</dd>
            </div>
            <div>
              <dt>{t(locale, 'windowRoundTrip')}</dt>
              <dd>{dest.windows.roundTrip[locale]}</dd>
            </div>
            <div>
              <dt>{t(locale, 'windowHint')}</dt>
              <dd>{dest.windows.nextHint[locale]}</dd>
            </div>
          </dl>
          {dest.windows.exampleYears && (
            <p className="example-years">
              {t(locale, 'exampleWindows')}: {dest.windows.exampleYears}
            </p>
          )}
        </article>
      </div>
    </section>
  )
}
