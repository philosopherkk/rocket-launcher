import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { publicUrl } from '../lib/publicUrl'
import { beginTextureUpgrade, endTextureUpgrade } from '../lib/textureStatus'

/** Abort NASA map upgrade after this many ms — keep procedural. */
const UPGRADE_TIMEOUT_MS = 4000
/** Show “textures loading…” chip if upgrade still pending. */
const LOADING_CHIP_MS = 2000

export type TexturePhase = 'procedural' | 'loading' | 'upgraded' | 'failed'

type SafeState = {
  map: THREE.Texture
  phase: TexturePhase
  /** True when upgrade has been pending longer than LOADING_CHIP_MS */
  showLoadingChip: boolean
}

type SafeMultiState = {
  maps: THREE.Texture[]
  phase: TexturePhase
  showLoadingChip: boolean
}

function applyMapDefaults(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * Fetch a public texture with timeout, decode to THREE.Texture.
 * Never throws to the caller — resolves null on failure/timeout/abort.
 */
async function loadTextureWithTimeout(
  url: string,
  timeoutMs: number,
  parentSignal: AbortSignal,
): Promise<THREE.Texture | null> {
  if (parentSignal.aborted) return null

  const controller = new AbortController()
  const onParentAbort = () => controller.abort()
  parentSignal.addEventListener('abort', onParentAbort)

  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'force-cache',
      credentials: 'same-origin',
    })
    if (!res.ok) {
      console.warn(`[textures] HTTP ${res.status} for ${url}`)
      return null
    }
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    try {
      return await new Promise<THREE.Texture | null>((resolve) => {
        const loader = new THREE.TextureLoader()
        loader.load(
          objectUrl,
          (loaded) => resolve(applyMapDefaults(loaded)),
          undefined,
          () => {
            console.warn(`[textures] decode failed for ${url}`)
            resolve(null)
          },
        )
      })
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch (err) {
    const name = err instanceof Error ? err.name : ''
    if (name === 'AbortError') {
      console.warn(`[textures] timed out / aborted ${url} — keeping procedural`)
    } else {
      console.warn(`[textures] failed to load ${url}`, err)
    }
    return null
  } finally {
    window.clearTimeout(timer)
    parentSignal.removeEventListener('abort', onParentAbort)
  }
}

/**
 * Instant procedural map; upgrade to NASA/public JPG in the background
 * with a hard timeout so Suspense / UI never wait on flaky Pages CDN.
 */
export function useSafeTexture(
  relativePath: string,
  fallback: () => THREE.Texture,
): SafeState {
  const [state, setState] = useState<SafeState>(() => ({
    map: fallback(),
    phase: 'procedural',
    showLoadingChip: false,
  }))

  useEffect(() => {
    let cancelled = false
    const ac = new AbortController()
    const url = publicUrl(relativePath)

    setState((prev) => ({ ...prev, phase: 'loading', showLoadingChip: false }))
    beginTextureUpgrade()

    const chipTimer = window.setTimeout(() => {
      if (!cancelled) {
        setState((prev) =>
          prev.phase === 'loading' ? { ...prev, showLoadingChip: true } : prev,
        )
      }
    }, LOADING_CHIP_MS)

    loadTextureWithTimeout(url, UPGRADE_TIMEOUT_MS, ac.signal).then((loaded) => {
      if (cancelled) {
        loaded?.dispose()
        endTextureUpgrade(false)
        return
      }
      window.clearTimeout(chipTimer)
      if (loaded) {
        endTextureUpgrade(false)
        setState((prev) => {
          if (prev.map !== loaded) prev.map.dispose()
          return { map: loaded, phase: 'upgraded', showLoadingChip: false }
        })
      } else {
        endTextureUpgrade(true)
        setState((prev) => ({
          map: prev.map,
          phase: 'failed',
          showLoadingChip: false,
        }))
      }
    })

    return () => {
      cancelled = true
      window.clearTimeout(chipTimer)
      ac.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fallback factory is stable
  }, [relativePath])

  return state
}

export function useSafeTextures(
  relativePaths: string[],
  fallbacks: () => THREE.Texture[],
): SafeMultiState {
  const [state, setState] = useState<SafeMultiState>(() => ({
    maps: fallbacks(),
    phase: 'procedural',
    showLoadingChip: false,
  }))

  useEffect(() => {
    let cancelled = false
    const ac = new AbortController()
    const urls = relativePaths.map((p) => publicUrl(p))
    const standIns = fallbacks()

    setState((prev) => ({ ...prev, phase: 'loading', showLoadingChip: false }))
    beginTextureUpgrade()

    const chipTimer = window.setTimeout(() => {
      if (!cancelled) {
        setState((prev) =>
          prev.phase === 'loading' ? { ...prev, showLoadingChip: true } : prev,
        )
      }
    }, LOADING_CHIP_MS)

    Promise.all(urls.map((url) => loadTextureWithTimeout(url, UPGRADE_TIMEOUT_MS, ac.signal))).then(
      (results) => {
        if (cancelled) {
          results.forEach((t) => t?.dispose())
          endTextureUpgrade(false)
          return
        }
        window.clearTimeout(chipTimer)
        const maps = results.map((t, i) => t ?? standIns[i])
        const anyOk = results.some((t) => t != null)
        endTextureUpgrade(!anyOk)
        setState((prev) => {
          prev.maps.forEach((t) => {
            if (!maps.includes(t) && !standIns.includes(t)) t.dispose()
          })
          return {
            maps,
            phase: anyOk ? 'upgraded' : 'failed',
            showLoadingChip: false,
          }
        })
      },
    )

    return () => {
      cancelled = true
      window.clearTimeout(chipTimer)
      ac.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relativePaths.join('|')])

  return state
}
