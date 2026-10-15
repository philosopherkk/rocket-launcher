import { useCallback, useEffect, useRef, useState } from 'react'
import type { Difficulty, Locale } from '../data/phases'
import { phaseAtProgress, phaseIndexAtProgress } from '../data/phases'
import { destinationIds, type DestinationId } from '../data/destinations'
import type { ScaleMode } from '../data/astroConstants'
import {
  BASE_TIMELINE_SECONDS,
  DEFAULT_PLAYBACK_RATE,
  PLAYBACK_RATES,
  type PlaybackRate,
  nextPlaybackRate,
} from '../lib/playback'

const STORAGE_KEY = 'moon-mission-prefs'

type Prefs = {
  locale: Locale
  difficulty: Difficulty
  destinationId: DestinationId
  scaleMode: ScaleMode
  playbackRate?: PlaybackRate
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { locale: 'en', difficulty: 'beginner', destinationId: 'moon', scaleMode: 'auto' }
    }
    const parsed = JSON.parse(raw) as Prefs
    const scaleMode: ScaleMode =
      parsed.scaleMode === 'planet' || parsed.scaleMode === 'vehicle' || parsed.scaleMode === 'auto'
        ? parsed.scaleMode
        : 'auto'
    const playbackRate = PLAYBACK_RATES.includes(parsed.playbackRate as PlaybackRate)
      ? (parsed.playbackRate as PlaybackRate)
      : DEFAULT_PLAYBACK_RATE
    return {
      locale: parsed.locale === 'zh-Hant' ? 'zh-Hant' : 'en',
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(parsed.difficulty)
        ? parsed.difficulty
        : 'beginner',
      destinationId: destinationIds.includes(parsed.destinationId) ? parsed.destinationId : 'moon',
      scaleMode,
      playbackRate,
    }
  } catch {
    return {
      locale: 'en',
      difficulty: 'beginner',
      destinationId: 'moon',
      scaleMode: 'auto',
      playbackRate: DEFAULT_PLAYBACK_RATE,
    }
  }
}

function progressFromUrl(): number | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('progress')
    if (raw == null || raw === '') return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return Math.min(1, Math.max(0, n))
  } catch {
    return null
  }
}

export function useMissionState() {
  const prefs = loadPrefs()
  const [locale, setLocale] = useState<Locale>(prefs.locale)
  const [difficulty, setDifficulty] = useState<Difficulty>(prefs.difficulty)
  const [destinationId, setDestinationId] = useState<DestinationId>(prefs.destinationId)
  const [scaleMode, setScaleMode] = useState<ScaleMode>(prefs.scaleMode)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(
    prefs.playbackRate ?? DEFAULT_PLAYBACK_RATE,
  )
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)
  const prevDestination = useRef<DestinationId | null>(null)
  const rateRef = useRef(playbackRate)
  rateRef.current = playbackRate

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ locale, difficulty, destinationId, scaleMode, playbackRate }),
    )
  }, [locale, difficulty, destinationId, scaleMode, playbackRate])

  // Apply ?progress= on load / address-bar changes (full navigation)
  useEffect(() => {
    const apply = () => {
      const p = progressFromUrl()
      if (p != null) {
        setPlaying(false)
        setProgress(p)
      }
    }
    apply()
    window.addEventListener('popstate', apply)
    return () => window.removeEventListener('popstate', apply)
  }, [])

  // Reset playhead when destination changes after initial mount
  useEffect(() => {
    if (prevDestination.current == null) {
      prevDestination.current = destinationId
      return
    }
    if (prevDestination.current !== destinationId) {
      prevDestination.current = destinationId
      setPlaying(false)
      setProgress(0)
    }
  }, [destinationId])

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
      return
    }

    const tick = (now: number) => {
      if (lastRef.current == null) lastRef.current = now
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      const rate = rateRef.current
      setProgress((p) => {
        const next = p + (dt * rate) / BASE_TIMELINE_SECONDS
        if (next >= 1) {
          setPlaying(false)
          return 1
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing])

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && progress >= 1) setProgress(0)
      return !p
    })
  }, [progress])

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((r) => nextPlaybackRate(r))
  }, [])

  const phase = phaseAtProgress(progress)
  const phaseIndex = phaseIndexAtProgress(progress)

  return {
    locale,
    setLocale,
    difficulty,
    setDifficulty,
    destinationId,
    setDestinationId,
    scaleMode,
    setScaleMode,
    progress,
    setProgress,
    playing,
    setPlaying,
    togglePlay,
    playbackRate,
    setPlaybackRate,
    cyclePlaybackRate,
    phase,
    phaseIndex,
  }
}
