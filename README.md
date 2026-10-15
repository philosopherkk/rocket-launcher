# Starship Destinations Lab

Educational interactive site: SpaceX Starship / Super Heavy journeys with selectable destinations (Moon, Mars, Venus, Mercury, Jupiter), Δv energy estimates, flight-window / round-trip classes, English + Traditional Chinese, difficulty-scaled explanations, and a WebGL 3D journey.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints. With the GitHub Pages project `base`, that is usually `http://localhost:5173/rocket-launcher/`.

```bash
npm run build
npm run preview
```

### GitHub Pages / `BASE_URL`

This app is deployed as a **project site** (`https://philosopherkk.github.io/rocket-launcher/`). Vite sets `base: '/rocket-launcher/'`, so every `public/` asset must be resolved with `import.meta.env.BASE_URL` (see `src/lib/publicUrl.ts`). Absolute root paths like `/textures/...` 404 on Pages and can abort React mount.

The 3D canvas paints **procedural** Earth/Moon maps immediately, then upgrades to the small NASA/public JPGs in `public/textures/` (≤512px) in the background with a ~4s timeout. Flaky CDN downloads never block Suspense or blank the scene.

## Features

- Destination picker with energy (Δv) and flight-window panels
- Mars conjunction vs opposition round-trip classes (NASA public studies)
- Idealized Hohmann math for heliocentric targets (clearly labeled)
- Mission timeline scrubber + play/pause (8 phases)
- Beginner / Intermediate / Advanced copy depth
- `en` and `zh-Hant`
- Public Starship vehicle facts with source links
- React Three Fiber scene (illustrative geometry)

## Accuracy

Only publicly documented vehicle numbers are shown as facts. Hohmann Δv/TOF are idealized circular coplanar calculations. Venus/Mercury/Jupiter are comparison cases — not published Starship crew missions. See `docs/data-sources.md`.

## Stack

Vite · React · TypeScript · Three.js · React Three Fiber · Drei
