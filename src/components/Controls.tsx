import type { Difficulty, Locale } from '../data/phases'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  difficulty: Difficulty
  onLocale: (l: Locale) => void
  onDifficulty: (d: Difficulty) => void
}

export function Controls({ locale, difficulty, onLocale, onDifficulty }: Props) {
  return (
    <div className="controls">
      <label className="control">
        <span>{t(locale, 'language')}</span>
        <select
          value={locale}
          onChange={(e) => onLocale(e.target.value as Locale)}
          aria-label={t(locale, 'language')}
        >
          <option value="en">English</option>
          <option value="zh-Hant">繁體中文</option>
        </select>
      </label>
      <label className="control">
        <span>{t(locale, 'difficulty')}</span>
        <select
          value={difficulty}
          onChange={(e) => onDifficulty(e.target.value as Difficulty)}
          aria-label={t(locale, 'difficulty')}
        >
          <option value="beginner">{t(locale, 'beginner')}</option>
          <option value="intermediate">{t(locale, 'intermediate')}</option>
          <option value="advanced">{t(locale, 'advanced')}</option>
        </select>
      </label>
    </div>
  )
}
