import type { Difficulty, Locale } from '../data/phases'
import type { DestinationId } from '../data/destinations'
import {
  EARTH_RADIUS_KM,
  HELIO_BODY_EXAGGERATION,
  HELIO_LONGITUDE_ASSUMPTION_EN,
  HELIO_LONGITUDE_ASSUMPTION_ZH,
  MOON_DISTANCE_EARTH_RADII,
  MOON_DISTANCE_KM,
  STACK_HEIGHT_M,
  resolveScaleMode,
  type ScaleMode,
} from '../data/astroConstants'
import {
  formatKm,
  formatSpeed,
  isCislunar,
  samplePath,
} from '../lib/transferGeometry'
import { formatAltitudeScale, formatCameraDistance, STACK_KM } from '../lib/kmCamera'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  difficulty: Difficulty
  destinationId: DestinationId
  progress: number
  scaleMode: ScaleMode
  cameraKm?: number
}

export function MeasurementHud({
  locale,
  difficulty,
  destinationId,
  progress,
  scaleMode,
  cameraKm,
}: Props) {
  const resolved = resolveScaleMode(scaleMode, progress)
  const sample = samplePath(progress, destinationId)
  const cislunar = isCislunar(destinationId)

  return (
    <div className="measure-hud" aria-live="polite">
      <div className="measure-mode">
        <span className="mode-pill">
          {cislunar ? t(locale, 'trueKmScale') : resolved === 'planet' ? t(locale, 'scalePlanetActive') : t(locale, 'scaleVehicleActive')}
        </span>
        {scaleMode === 'auto' && !cislunar && (
          <span className="mode-auto">{t(locale, 'scaleAutoHint')}</span>
        )}
      </div>

      {cislunar && (
        <>
          <div className="scale-bar" title={t(locale, 'scaleBarHint')}>
            <div className="scale-bar-track" />
            <span>
              {locale === 'en'
                ? `Stack ${STACK_HEIGHT_M} m (${STACK_KM} km) · Earth R ${EARTH_RADIUS_KM.toLocaleString()} km · Moon ${MOON_DISTANCE_KM.toLocaleString()} km`
                : `全箭 ${STACK_HEIGHT_M} m（${STACK_KM} km）· 地球 R ${EARTH_RADIUS_KM.toLocaleString()} km · 月球 ${MOON_DISTANCE_KM.toLocaleString()} km`}
            </span>
          </div>
          <p className="scale-exag">
            {locale === 'en'
              ? `True ratio stack/R⊕ ≈ ${(STACK_HEIGHT_M / (EARTH_RADIUS_KM * 1000)).toExponential(1)}. Zoom in near pad to see the vehicle; at cislunar distances it is a point — that is correct.`
              : `真實比例 全箭/R⊕ ≈ ${(STACK_HEIGHT_M / (EARTH_RADIUS_KM * 1000)).toExponential(1)}。發射台附近放大可見載具；地月距離時為一點——這是正確的。`}
          </p>
        </>
      )}

      {!cislunar && resolved === 'planet' && (
        <>
          <div className="scale-bar" title={t(locale, 'scaleBarHint')}>
            <div className="scale-bar-track" />
            <span>
              {locale === 'en'
                ? 'Distances: 1 unit = 1 AU · body radii exaggerated'
                : '距離：1 單位 = 1 AU · 天體半徑已放大'}
            </span>
          </div>
          <p className="scale-exag">
            {locale === 'en'
              ? `Planet spheres ×${HELIO_BODY_EXAGGERATION}; orbital distances true AU. One-way Earth→target.`
              : `行星球體 ×${HELIO_BODY_EXAGGERATION}；軌道距離為真實 AU。單程地球→目標。`}
          </p>
          <p className="scale-exag">
            {locale === 'en' ? HELIO_LONGITUDE_ASSUMPTION_EN : HELIO_LONGITUDE_ASSUMPTION_ZH}
          </p>
        </>
      )}

      {difficulty === 'beginner' && (
        <p className="measure-caption">
          {locale === 'en' ? sample.beginnerCaptionEn : sample.beginnerCaptionZh}
        </p>
      )}

      <dl className="measure-grid">
        {cameraKm != null && (
          <div>
            <dt>{t(locale, 'measCamera')}</dt>
            <dd>{formatCameraDistance(cameraKm, locale)}</dd>
          </div>
        )}
        <div>
          <dt>{t(locale, 'measTime')}</dt>
          <dd>{locale === 'en' ? sample.timeLabelEn : sample.timeLabelZh}</dd>
        </div>
        <div>
          <dt>{t(locale, 'measSegment')}</dt>
          <dd>
            <span className={`path-kind-inline ${sample.kind}`}>
              {sample.kind === 'powered' ? t(locale, 'pathPowered') : t(locale, 'pathCoast')}
            </span>
            {' · '}
            {sample.label}
          </dd>
        </div>
        {sample.altitudeKm != null && (
          <div>
            <dt>{t(locale, 'measAltitude')}</dt>
            <dd>{formatAltitudeScale(sample.altitudeKm, locale)}</dd>
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
        {difficulty !== 'beginner' && (
          <div>
            <dt>{t(locale, 'measTraveled')}</dt>
            <dd>{formatKm(sample.distanceTraveledKm, locale)}</dd>
          </div>
        )}
        {difficulty !== 'beginner' && (
          <div>
            <dt>{t(locale, 'measRemaining')}</dt>
            <dd>{formatKm(sample.distanceRemainingKm, locale)}</dd>
          </div>
        )}
        {(difficulty === 'intermediate' || difficulty === 'advanced') &&
          sample.transferA_AU != null && (
            <div>
              <dt>{t(locale, 'measTransferA')}</dt>
              <dd>{sample.transferA_AU.toFixed(3)} AU</dd>
            </div>
          )}
        {(difficulty === 'intermediate' || difficulty === 'advanced') &&
          sample.periapsisKm != null &&
          sample.apoapsisKm != null && (
            <div>
              <dt>{t(locale, 'measPeriApo')}</dt>
              <dd>
                {formatKm(sample.periapsisKm, locale)} / {formatKm(sample.apoapsisKm, locale)}
              </dd>
            </div>
          )}
        {cislunar && difficulty === 'advanced' && (
          <div>
            <dt>Earth–Moon</dt>
            <dd>{MOON_DISTANCE_EARTH_RADII.toFixed(1)} R⊕</dd>
          </div>
        )}
      </dl>
      <p className="measure-note">{locale === 'en' ? sample.noteEn : sample.noteZh}</p>
    </div>
  )
}
