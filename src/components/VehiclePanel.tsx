import { sources, vehicleFacts } from '../data/vehicle'
import type { Locale } from '../data/phases'
import { t } from '../data/i18n'

type Props = { locale: Locale }

export function VehiclePanel({ locale }: Props) {
  return (
    <aside className="vehicle-panel">
      <h2>{t(locale, 'vehicleData')}</h2>
      <ul>
        {vehicleFacts.map((fact) => (
          <li key={fact.id}>
            <span className="fact-label">{t(locale, fact.labelKey as Parameters<typeof t>[1])}</span>
            <span className="fact-value">{locale === 'en' ? fact.valueEn : fact.valueZh}</span>
          </li>
        ))}
      </ul>
      <h3>{t(locale, 'sources')}</h3>
      <ul className="sources">
        {Object.values(sources).map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {locale === 'en' ? s.nameEn : s.nameZh}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
