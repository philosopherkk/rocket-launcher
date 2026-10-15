/**
 * Public vehicle figures only. See docs/data-sources.md for citations.
 * Values mirror SpaceX Starship product page (retrieved for this project).
 */

export type VehicleFact = {
  id: string
  labelKey: string
  valueEn: string
  valueZh: string
  sourceId: string
}

export const vehicleFacts: VehicleFact[] = [
  {
    id: 'stack-height',
    labelKey: 'fact.stackHeight',
    valueEn: '124 m / 407 ft',
    valueZh: '124 公尺 / 407 英尺',
    sourceId: 'spacex-starship',
  },
  {
    id: 'diameter',
    labelKey: 'fact.diameter',
    valueEn: '9 m / 29.5 ft',
    valueZh: '9 公尺 / 29.5 英尺',
    sourceId: 'spacex-starship',
  },
  {
    id: 'payload',
    labelKey: 'fact.payload',
    valueEn: '100+ t (fully reusable config.)',
    valueZh: '100+ 公噸（完全可重複使用構型）',
    sourceId: 'spacex-starship',
  },
  {
    id: 'ship-height',
    labelKey: 'fact.shipHeight',
    valueEn: '52 m / 171 ft',
    valueZh: '52 公尺 / 171 英尺',
    sourceId: 'spacex-starship',
  },
  {
    id: 'ship-propellant',
    labelKey: 'fact.shipPropellant',
    valueEn: '1,600 t / 3.5 Mlb',
    valueZh: '1,600 公噸 / 3.5 Mlb',
    sourceId: 'spacex-starship',
  },
  {
    id: 'ship-thrust',
    labelKey: 'fact.shipThrust',
    valueEn: '1,614 tf / 3.5 Mlbf',
    valueZh: '1,614 公噸力 / 3.5 Mlbf',
    sourceId: 'spacex-starship',
  },
  {
    id: 'ship-engines',
    labelKey: 'fact.shipEngines',
    valueEn: '6 Raptor (3 sea-level + 3 RVac)',
    valueZh: '6 具 Raptor（3 海平面 + 3 RVac）',
    sourceId: 'spacex-starship',
  },
  {
    id: 'booster-height',
    labelKey: 'fact.boosterHeight',
    valueEn: '72 m / 236 ft',
    valueZh: '72 公尺 / 236 英尺',
    sourceId: 'spacex-starship',
  },
  {
    id: 'booster-propellant',
    labelKey: 'fact.boosterPropellant',
    valueEn: '3,650 t / 8 Mlb',
    valueZh: '3,650 公噸 / 8 Mlb',
    sourceId: 'spacex-starship',
  },
  {
    id: 'booster-thrust',
    labelKey: 'fact.boosterThrust',
    valueEn: '8,240 tf / 18.1 Mlbf',
    valueZh: '8,240 公噸力 / 18.1 Mlbf',
    sourceId: 'spacex-starship',
  },
  {
    id: 'booster-engines',
    labelKey: 'fact.boosterEngines',
    valueEn: '33 Raptor (13 center gimbaled)',
    valueZh: '33 具 Raptor（中央 13 具可萬向轉動）',
    sourceId: 'spacex-starship',
  },
  {
    id: 'raptor-thrust',
    labelKey: 'fact.raptorThrust',
    valueEn: '250 tf / 551 klbf per engine',
    valueZh: '每具 250 公噸力 / 551 klbf',
    sourceId: 'spacex-starship',
  },
  {
    id: 'propellant',
    labelKey: 'fact.propellant',
    valueEn: 'Subcooled CH₄ + LOX',
    valueZh: '過冷液態甲烷 + 液氧',
    sourceId: 'spacex-starship',
  },
  {
    id: 'hls-height',
    labelKey: 'fact.hlsHeight',
    valueEn: '~50 m / ~164 ft (NASA description)',
    valueZh: '約 50 公尺 / 約 164 英尺（NASA 描述）',
    sourceId: 'nasa-hls',
  },
]

export const sources = {
  'spacex-starship': {
    nameEn: 'SpaceX — Starship vehicle page',
    nameZh: 'SpaceX — Starship 載具頁面',
    url: 'https://www.spacex.com/vehicles/starship/',
  },
  'nasa-hls': {
    nameEn: 'NASA — Artemis Starship HLS concepts',
    nameZh: 'NASA — Artemis Starship HLS 概念說明',
    url: 'https://www.nasa.gov/directorates/esdmd/artemis-campaign-development-division/human-landing-system-program/nasa-spacex-illustrate-key-moments-of-artemis-lunar-lander-mission/',
  },
  'nasa-hls-ref': {
    nameEn: 'NASA — Human Landing Systems reference',
    nameZh: 'NASA — 載人登陸系統參考頁',
    url: 'https://www.nasa.gov/reference/human-landing-systems/',
  },
} as const
