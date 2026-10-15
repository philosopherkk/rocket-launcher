import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
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

const STORAGE_KEY = 'rocket-launcher-prefs'
const LEGACY_STORAGE_KEY = 'moon-mission-prefs'

const HUD_SYNC_INTERVAL_MS = 100
const MAX_DT_S = 0.1

type Prefs = {
  locale: Locale
  difficulty: Difficulty
  destinationId: DestinationId
  scaleMode: ScaleMode
  playbackRate?: PlaybackRate
}

function loadPrefs(): Prefs {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        raw = legacy
        localStorage.setItem(STORAGE_KEY, legacy)
      }
    }
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

function localeFromNavigator(): Locale {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const lang of langs) {
      if (lang.toLowerCase().startsWith('zh')) return 'zh-Hant'
    }
  } catch {
    /* ignore */
  }
  return 'en'
}

function prefsFromUrl(): Partial<Prefs> {
  try {
    const q = new URLSearchParams(window.location.search)
    const out: Partial<Prefs> = {}
    const dest = q.get('dest')
    if (dest && destinationIds.includes(dest as DestinationId)) {
      out.destinationId = dest as DestinationId
    }
    const lang = q.get('lang')
    if (lang === 'zh-Hant' || lang === 'en') out.locale = lang
    const level = q.get('level')
    if (level === 'beginner' || level === 'intermediate' || level === 'advanced') {
      out.difficulty = level
    }
    return out
  } catch {
    return {}
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

export type MissionState = {
  locale: Locale
  setLocale: (l: Locale) => void
  difficulty: Difficulty
  setDifficulty: (d: Difficulty) => void
  destinationId: DestinationId
  setDestinationId: (id: DestinationId) => void
  scaleMode: ScaleMode
  setScaleMode: (m: ScaleMode) => void
  /** Throttled UI progress (~10 Hz during playback) */
  progress: number
  setProgress: (p: number) => void
  /** Authoritative playhead for Canvas / useFrame */
  progressRef: RefObject<number>
  playing: boolean
  setPlaying: (p: boolean) => void
  togglePlay: () => void
  playbackRate: PlaybackRate
  setPlaybackRate: (r: PlaybackRate) => void
  cyclePlaybackRate: () => void
  phase: ReturnType<typeof phaseAtProgress>
  phaseIndex: number
  resetPrefs: () => void
}

export function useMissionState(): MissionState {
  const [locale, setLocale] = useState<Locale>(() => {
    const url = prefsFromUrl().locale
    if (url) return url
    const stored = loadPrefs().locale
    if (stored !== 'en') return stored
    return localeFromNavigator()
  })
  const [difficulty, setDifficulty] = useState<Difficulty>(
    () => prefsFromUrl().difficulty ?? loadPrefs().difficulty,
  )
  const [destinationId, setDestinationId] = useState<DestinationId>(
    () => prefsFromUrl().destinationId ?? loadPrefs().destinationId,
  )
  const [scaleMode, setScaleMode] = useState<ScaleMode>(() => loadPrefs().scaleMode)
  const [progress, setProgressState] = useState(0)
  const progressRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(
    () => loadPrefs().playbackRate ?? DEFAULT_PLAYBACK_RATE,
  )
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)
  const lastHudSyncRef = useRef(0)
  const prevDestination = useRef<DestinationId | null>(null)
  const rateRef = useRef(playbackRate)
  const playingRef = useRef(playing)
  rateRef.current = playbackRate
  playingRef.current = playing

  const setProgress = useCallback((p: number) => {
    const clamped = Math.min(1, Math.max(0, p))
    progressRef.current = clamped
    setProgressState(clamped)
    lastHudSyncRef.current = performance.now()
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ locale, difficulty, destinationId, scaleMode, playbackRate }),
    )
  }, [locale, difficulty, destinationId, scaleMode, playbackRate])

  useEffect(() => {
    const apply = () => {
      const p = progressFromUrl()
      if (p != null) {
        setPlaying(false)
        setProgress(p)
      }
      const urlPrefs = prefsFromUrl()
      if (urlPrefs.locale) setLocale(urlPrefs.locale)
      if (urlPrefs.difficulty) setDifficulty(urlPrefs.difficulty)
      if (urlPrefs.destinationId) setDestinationId(urlPrefs.destinationId)
    }
    apply()
    window.addEventListener('popstate', apply)
    return () => window.removeEventListener('popstate', apply)
  }, [setProgress])

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
  }, [destinationId, setProgress])

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
      return
    }

    const tick = (now: number) => {
      if (lastRef.current == null) lastRef.current = now
      let dt = (now - lastRef.current) / 1000
      lastRef.current = now
      if (dt > MAX_DT_S) dt = MAX_DT_S

      const rate = rateRef.current
      let next = progressRef.current + (dt * rate) / BASE_TIMELINE_SECONDS
      if (next >= 1) {
        next = 1
        progressRef.current = 1
        setPlaying(false)
        setProgressState(1)
        lastHudSyncRef.current = now
        return
      }
      progressRef.current = next

      if (now - lastHudSyncRef.current >= HUD_SYNC_INTERVAL_MS) {
        lastHudSyncRef.current = now
        setProgressState(next)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing])

  const togglePlay = useCallback(() => {
    if (!playingRef.current) {
      if (progressRef.current >= 1) setProgress(0)
      setPlaying(true)
    } else {
      setPlaying(false)
    }
  }, [setProgress])

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((r) => nextPlaybackRate(r))
  }, [])

  const resetPrefs = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    setLocale(localeFromNavigator())
    setDifficulty('beginner')
    setDestinationId('moon')
    setScaleMode('auto')
    setPlaybackRate(DEFAULT_PLAYBACK_RATE)
    setPlaying(false)
    setProgress(0)
  }, [setProgress])

  const phase = phaseAtProgress(progress, destinationId)
  const phaseIndex = phaseIndexAtProgress(progress, destinationId)

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
    progressRef,
    playing,
    setPlaying,
    togglePlay,
    playbackRate,
    setPlaybackRate,
    cyclePlaybackRate,
    phase,
    phaseIndex,
    resetPrefs,
  }
}
