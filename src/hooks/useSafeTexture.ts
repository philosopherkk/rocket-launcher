import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { publicUrl } from '../lib/publicUrl'

type SafeState = {
  map: THREE.Texture
  /** True only after a confirmed load failure (not while waiting). */
  failed: boolean
}

/**
 * Load a public texture under BASE_URL. On 404 / decode failure, keep the
 * procedural fallback so texture errors never throw and blank `#root`.
 */
export function useSafeTexture(
  relativePath: string,
  fallback: () => THREE.Texture,
): SafeState {
  const [state, setState] = useState<SafeState>(() => ({
    map: fallback(),
    failed: false,
  }))

  useEffect(() => {
    let cancelled = false
    const url = publicUrl(relativePath)
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (loaded) => {
        if (cancelled) {
          loaded.dispose()
          return
        }
        loaded.colorSpace = THREE.SRGBColorSpace
        setState((prev) => {
          if (prev.map !== loaded) prev.map.dispose()
          return { map: loaded, failed: false }
        })
      },
      undefined,
      () => {
        if (!cancelled) {
          console.warn(`[textures] failed to load ${url} — using procedural fallback`)
          setState((prev) => ({ map: prev.map, failed: true }))
        }
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fallback factory is stable
  }, [relativePath])

  return state
}

type SafeMultiState = {
  maps: THREE.Texture[]
  failed: boolean
}

export function useSafeTextures(
  relativePaths: string[],
  fallbacks: () => THREE.Texture[],
): SafeMultiState {
  const [state, setState] = useState<SafeMultiState>(() => ({
    maps: fallbacks(),
    failed: false,
  }))

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    const urls = relativePaths.map((p) => publicUrl(p))
    const standIns = fallbacks()

    Promise.all(
      urls.map(
        (url, i) =>
          new Promise<{ tex: THREE.Texture; ok: boolean }>((resolve) => {
            loader.load(
              url,
              (loaded) => {
                loaded.colorSpace = THREE.SRGBColorSpace
                resolve({ tex: loaded, ok: true })
              },
              undefined,
              () => {
                console.warn(`[textures] failed to load ${url} — using procedural fallback`)
                resolve({ tex: standIns[i], ok: false })
              },
            )
          }),
      ),
    ).then((results) => {
      if (cancelled) {
        results.forEach((r) => {
          if (!standIns.includes(r.tex)) r.tex.dispose()
        })
        return
      }
      const maps = results.map((r) => r.tex)
      const failed = results.some((r) => !r.ok)
      setState((prev) => {
        prev.maps.forEach((t) => {
          if (!maps.includes(t) && !standIns.includes(t)) t.dispose()
        })
        return { maps, failed }
      })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relativePaths.join('|')])

  return state
}
