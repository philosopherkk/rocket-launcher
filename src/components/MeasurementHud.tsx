import type { Difficulty, Locale } from '../data/phases'
import type { DestinationId } from '../data/destinations'
import {
  EARTH_RADIUS_KM,
  HELIO_BODY_EXAGGERATION,
  MOON_DISTANCE_EARTH_RADII,
  MOON_DISTANCE_KM,
  resolveScaleMode,
  type ScaleMode,
} from '../data/astroConstants'
import {
  formatKm,
  formatSpeed,
  isCislunar,
  samplePath,
} from '../lib/transferGeometry'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  difficulty: Difficulty
  destinationId: DestinationId
  progress: number
  scaleMode: ScaleMode
}

export function MeasurementHud({
  locale,
  difficulty,
  destinationId,
  progress,
  scaleMode,
}: Props) {
  const resolved = resolveScaleMode(scaleMode, progress)
  const sample = samplePath(progress, destinationId)
  const cislunar = isCislunar(destinationId)

  return (
    <div className="measure-hud" aria-live="polite">
      <div className="measure-mode">
        <span className="mode-pill">
          {resolved === 'planet' ? t(locale, 'scalePlanetActive') : t(locale, 'scaleVehicleActive')}
        </span>
        {scaleMode === 'auto' && <span className="mode-auto">{t(locale, 'scaleAutoHint')}</span>}
      </div>

      {resolved === 'planet' && (
        <>
          <div className="scale-bar" title={t(locale, 'scaleBarHint')}>
            <div className="scale-bar-track" />
            <span>
              {cislunar
                ? locale === 'en'
                  ? `Scale bar ≈ ${EARTH_RADIUS_KM.toLocaleString()} km (1 R⊕)`
                  : `比例尺 ≈ ${EARTH_RADIUS_KM.toLocaleString()} 公里（1 R⊕）`
                : locale === 'en'
                  ? 'Distances: 1 unit = 1 AU · body radii exaggerated'
                  : '距離：1 單位 = 1 AU · 天體半徑已放大'}
            </span>
          </div>
          {!cislunar && (
            <p className="scale-exag">
              {locale === 'en'
                ? `Planet spheres ×${HELIO_BODY_EXAGGERATION} so they stay visible; orbital distances are true AU.`
                : `行星球體放大 ${HELIO_BODY_EXAGGERATION} 倍以便可見；軌道距離為真實 AU。`}
            </p>
          )}
          {cislunar && (
            <p className="scale-exag">
              {locale === 'en'
                ? `Earth–Moon distance ${MOON_DISTANCE_KM.toLocaleString()} km ≈ ${MOON_DISTANCE_EARTH_RADII.toFixed(1)} R⊕ (mean). Vehicle is a marker only.`
                : `地月距離 ${MOON_DISTANCE_KM.toLocaleString()} 公里 ≈ ${MOON_DISTANCE_EARTH_RADII.toFixed(1)} R⊕（平均）。載具僅為標記。`}
            </p>
          )}
        </>
      )}

      {resolved === 'vehicle' && (
        <p className="scale-exag">
          {locale === 'en'
            ? 'Vehicle mode: Starship/Super Heavy at public proportions (9 m Ø, 52 m / 72 m / 124 m). Earth is a local backdrop, not full-planet scale.'
            : '載具模式：Starship／Super Heavy 採公開比例（直徑 9 m，52／72／124 m）。地球為局部背景，非全行星比例。'}
        </p>
      )}

      <dl className="measure-grid">
        <div>
          <dt>{t(locale, 'measSegment')}</dt>
          <dd>{sample.label}</dd>
        </div>
        {sample.altitudeKm != null && (
          <div>
            <dt>{t(locale, 'measAltitude')}</dt>
            <dd>{formatKm(sample.altitudeKm, locale)}</dd>
          </div>
        )}
        {sample.heliocentricAu != null && (
          <div>
            <dt>{t(locale, 'measHelioR')}</dt>
            <dd>{sample.heliocentricAu.toFixed(3)} AU</dd>
          </div>
        )}
        {sample.speedKmS != null && (
          <div>
            <dt>{t(locale, 'measSpeed')}</dt>
            <dd>{formatSpeed(sample.speedKmS, locale)}</dd>
          </div>
        )}
        <div>
          <dt>{t(locale, 'measTraveled')}</dt>
          <dd>{formatKm(sample.distanceTraveledKm, locale)}</dd>
        </div>
        <div>
          <dt>{t(locale, 'measRemaining')}</dt>
          <dd>{formatKm(sample.distanceRemainingKm, locale)}</dd>
        </div>
        {difficulty === 'advanced' && sample.transferA_AU != null && (
          <div>
            <dt>{t(locale, 'measTransferA')}</dt>
            <dd>{sample.transferA_AU.toFixed(3)} AU</dd>
          </div>
        )}
        {difficulty === 'advanced' && sample.periapsisKm != null && sample.apoapsisKm != null && (
          <div>
            <dt>{t(locale, 'measPeriApo')}</dt>
            <dd>
              {formatKm(sample.periapsisKm, locale)} / {formatKm(sample.apoapsisKm, locale)}
            </dd>
          </div>
        )}
      </dl>
      <p className="measure-note">{locale === 'en' ? sample.noteEn : sample.noteZh}</p>
    </div>
  )
}
