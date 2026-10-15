import { useCallback, useEffect, useState } from 'react'
import type { Locale } from '../data/phases'
import { t } from '../data/i18n'
import {
  clampLogDist,
  LOG_DIST_MAX,
  LOG_DIST_MIN,
  LOG_DIST_STEP,
  logDistToKm,
  formatCameraDistance,
} from '../lib/kmCamera'
import { formatPlaybackRate, type PlaybackRate } from '../lib/playback'

export { clampLogDist, LOG_DIST_STEP, logDistToKm }
export const ZOOM_STEP = LOG_DIST_STEP

/** @deprecated kept for any residual imports — prefer logDist */
export function zoomDistanceFactor(zoomLevel: number): number {
  return Math.pow(1.28, -zoomLevel)
}

type Props = {
  locale: Locale
  playing: boolean
  playbackRate: PlaybackRate
  logDist: number
  userCamera: boolean
  cameraKm: number
  fullscreenTarget: HTMLElement | null
  onTogglePlay: () => void
  onCyclePlaybackRate: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
}

export function ViewerBar({
  locale,
  playing,
  playbackRate,
  logDist,
  userCamera,
  cameraKm,
  fullscreenTarget,
  onTogglePlay,
  onCyclePlaybackRate,
  onZoomIn,
  onZoomOut,
  onResetView,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const el = document.fullscreenElement
      setFullscreen(!!el && (!!fullscreenTarget ? el === fullscreenTarget : true))
    }
    document.addEventListener('fullscreenchange', sync)
    sync()
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [fullscreenTarget])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (fullscreenTarget?.requestFullscreen) {
        await fullscreenTarget.requestFullscreen()
      }
    } catch {
      /* ignore */
    }
  }, [fullscreenTarget])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.code === 'Space') {
        e.preventDefault()
        onTogglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onTogglePlay])

  return (
    <div className="viewer-bar" role="toolbar" aria-label={t(locale, 'viewerBar')}>
      <button
        type="button"
        className={`viewer-btn viewer-btn-play${playing ? ' is-playing' : ''}`}
        onClick={onTogglePlay}
        aria-pressed={playing}
        aria-label={playing ? t(locale, 'pause') : t(locale, 'play')}
        title={playing ? t(locale, 'pause') : t(locale, 'play')}
      >
        <span className="viewer-icon" aria-hidden>
          {playing ? '❚❚' : '▶'}
        </span>
        <span>{playing ? t(locale, 'pause') : t(locale, 'resume')}</span>
      </button>

      <button
        type="button"
        className="viewer-btn viewer-btn-rate"
        onClick={onCyclePlaybackRate}
        aria-label={t(locale, 'playbackRate')}
        title={t(locale, 'playbackRateHint')}
      >
        <span>{formatPlaybackRate(playbackRate, locale)}</span>
      </button>

      <div className="viewer-group" role="group" aria-label={t(locale, 'zoom')}>
        <button
          type="button"
          className="viewer-btn"
          onClick={onZoomOut}
          disabled={logDist >= LOG_DIST_MAX - 1e-6}
          aria-label={t(locale, 'zoomOut')}
          title={t(locale, 'zoomOut')}
        >
          <span className="viewer-icon" aria-hidden>
            −
          </span>
          <span className="viewer-btn-label">{t(locale, 'zoomOut')}</span>
        </button>
        <button
          type="button"
          className="viewer-btn viewer-btn-quiet"
          onClick={onResetView}
          aria-label={t(locale, 'resetView')}
          title={t(locale, 'resetView')}
        >
          {formatCameraDistance(cameraKm || logDistToKm(logDist), locale)}
        </button>
        <button
          type="button"
          className="viewer-btn"
          onClick={onZoomIn}
          disabled={logDist <= LOG_DIST_MIN + 1e-6}
          aria-label={t(locale, 'zoomIn')}
          title={t(locale, 'zoomIn')}
        >
          <span className="viewer-icon" aria-hidden>
            +
          </span>
          <span className="viewer-btn-label">{t(locale, 'zoomIn')}</span>
        </button>
      </div>

      <button
        type="button"
        className={`viewer-btn${userCamera ? ' is-user-cam' : ''}`}
        onClick={onResetView}
        aria-label={t(locale, 'resetView')}
        title={t(locale, 'orbitHint')}
      >
        <span className="viewer-icon" aria-hidden>
          ↻
        </span>
        <span>{t(locale, 'resetView')}</span>
      </button>

      <button
        type="button"
        className="viewer-btn"
        onClick={toggleFullscreen}
        aria-pressed={fullscreen}
        aria-label={fullscreen ? t(locale, 'exitFullscreen') : t(locale, 'enterFullscreen')}
        title={fullscreen ? t(locale, 'exitFullscreen') : t(locale, 'enterFullscreen')}
      >
        <span className="viewer-icon" aria-hidden>
          {fullscreen ? '⧉' : '⛶'}
        </span>
        <span>{fullscreen ? t(locale, 'exitFullscreen') : t(locale, 'enterFullscreen')}</span>
      </button>
    </div>
  )
}
