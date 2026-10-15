import { useCallback, useEffect, useRef, useState } from 'react'
import type { Difficulty, Locale } from '../data/phases'
import { phaseAtProgress, phaseIndexAtProgress } from '../data/phases'
import { destinationIds, type DestinationId } from '../data/destinations'

const STORAGE_KEY = 'moon-mission-prefs'

type Prefs = { locale: Locale; difficulty: Difficulty; destinationId: DestinationId }

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { locale: 'en', difficulty: 'beginner', destinationId: 'moon' }
    const parsed = JSON.parse(raw) as Prefs
    return {
      locale: parsed.locale === 'zh-Hant' ? 'zh-Hant' : 'en',
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(parsed.difficulty)
        ? parsed.difficulty
        : 'beginner',
      destinationId: destinationIds.includes(parsed.destinationId) ? parsed.destinationId : 'moon',
    }
  } catch {
    return { locale: 'en', difficulty: 'beginner', destinationId: 'moon' }
  }
}

export function useMissionState() {
  const initial = loadPrefs()
  const [locale, setLocale] = useState<Locale>(initial.locale)
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty)
  const [destinationId, setDestinationId] = useState<DestinationId>(initial.destinationId)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, difficulty, destinationId }))
  }, [locale, difficulty, destinationId])

  // Reset playhead when destination changes so the path restart is obvious
  useEffect(() => {
    setPlaying(false)
    setProgress(0)
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
      setProgress((p) => {
        const next = p + dt / 75
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

  const phase = phaseAtProgress(progress)
  const phaseIndex = phaseIndexAtProgress(progress)

  return {
    locale,
    setLocale,
    difficulty,
    setDifficulty,
    destinationId,
    setDestinationId,
    progress,
    setProgress,
    playing,
    setPlaying,
    togglePlay,
    phase,
    phaseIndex,
  }
}
