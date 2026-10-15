/** Prefix a `public/` asset path with Vite `base` (e.g. `/rocket-launcher/`). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}${path.replace(/^\//, '')}`
}
