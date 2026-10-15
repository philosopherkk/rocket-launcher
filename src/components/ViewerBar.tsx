import { useCallback, useEffect, useState } from 'react'
import type { Locale } from '../data/phases'
import { t } from '../data/i18n'

export const ZOOM_MIN = -2
export const ZOOM_MAX = 2
/** Multiplier applied to camera stand-off distance: zoomIn → smaller distance */
export function zoomDistanceFactor(zoomLevel: number): number {
  return Math.pow(1.35, -zoomLevel)
}

type Props = {
  locale: Locale
  playing: boolean
  zoomLevel: number
  fullscreenTarget: HTMLElement | null
  onTogglePlay: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export function ViewerBar({
  locale,
  playing,
  zoomLevel,
  fullscreenTarget,
  onTogglePlay,
  onZoomIn,
  onZoomOut,
  onZoomReset,
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
      // Fullscreen may be blocked by the browser; ignore.
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
        <span>
          {playing ? t(locale, 'pause') : t(locale, 'resume')}
        </span>
      </button>

      <div className="viewer-group" role="group" aria-label={t(locale, 'zoom')}>
        <button
          type="button"
          className="viewer-btn"
          onClick={onZoomOut}
          disabled={zoomLevel <= ZOOM_MIN}
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
          onClick={onZoomReset}
          aria-label={t(locale, 'zoomReset')}
          title={t(locale, 'zoomReset')}
        >
          {t(locale, 'zoomLevel').replace('{n}', String(zoomLevel))}
        </button>
        <button
          type="button"
          className="viewer-btn"
          onClick={onZoomIn}
          disabled={zoomLevel >= ZOOM_MAX}
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
