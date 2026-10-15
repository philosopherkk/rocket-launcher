# Starship Destinations Lab

Educational interactive site: SpaceX Starship / Super Heavy journeys with selectable destinations (Moon, Mars, Venus, Mercury, Jupiter), Δv energy estimates, flight-window / round-trip classes, English + Traditional Chinese, difficulty-scaled explanations, and a WebGL 3D journey.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

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
