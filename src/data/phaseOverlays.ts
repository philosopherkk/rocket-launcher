import { getDestination, type DestinationId } from './destinations'
import type { Difficulty, Locale, PhaseCopy, PhaseId } from './phases'

type OverlayMap = Partial<
  Record<DestinationId, Partial<Record<PhaseId, Record<Locale, Record<Difficulty, PhaseCopy>>>>>
>

/** Destination-specific replacements for transfer/landing/return phases. Moon uses base phases.ts copy. */
export const phaseOverlays: OverlayMap = {
  mars: {
    tli: {
      en: {
        beginner: {
          title: 'Trans-Mars injection & long coast',
          narrative:
            'After leaving Earth (and refilling in the public Starship architecture), the ship burns onto a months-long path toward Mars, then coasts.',
          physics: 'A timed burn stretches the solar orbit so the far point reaches Mars’s distance.',
          engineering: 'Navigation, communications delay, and keeping systems healthy for ~8–9 months matter more than on a lunar trip.',
        },
        intermediate: {
          title: 'TMI & Hohmann-class cruise',
          narrative:
            'Idealized Hohmann coasts are ~8–9 months (JPL education ~259 days). Faster paths spend more Δv. Launch energy opportunities repeat ~every 25–26 months.',
          physics: 'Heliocentric departure Δv is order ~2.9 km/s in a circular coplanar model—plus Earth escape separately.',
          engineering: 'Deep-space reliability, radiation, and cryogenic propellant management dominate; Starship Mars flights remain future public plans.',
        },
        advanced: {
          title: 'Interplanetary departure & cruise',
          narrative:
            'Porkchop-selected C3 and TOF replace a single Hohmann number. Mid-course corrections fix ephemeris and execution errors.',
          physics: 'Patched two-body + n-body corrections; arrival V∞ sets capture/landing difficulty.',
          engineering: 'Conjunction vs opposition return planning must start before departure—stay time is an energy decision.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '奔火點火與長滑行',
          narrative: '離開地球後（公開 Starship 架構還會補加註），船艦點火進入長達數月的火星路徑，然後滑行。',
          physics: '精準時機的點火把繞日軌道拉長，使遠日點到達火星距離。',
          engineering: '導航、通訊延遲，以及維持系統健康約 8–9 個月，比月球旅行更關鍵。',
        },
        intermediate: {
          title: 'TMI 與霍曼級巡航',
          narrative: '理想霍曼滑行約 8–9 個月（JPL 教育約 259 日）。更快路徑耗更多 Δv。發射能量機會約每 25–26 個月重複。',
          physics: '圓共面模型中日心出發 Δv 約 ~2.9 km/s——地球逃逸另計。',
          engineering: '深空可靠度、輻射與低溫推進劑管理占主導；Starship 火星飛行仍屬未來公開計畫。',
        },
        advanced: {
          title: '行星際出發與巡航',
          narrative: '豬肉圖選定的 C3 與飛行時間取代單一霍曼數字。中途修正消除星曆與執行誤差。',
          physics: '拼接二體＋n 體修正；到達 V∞ 決定捕獲／著陸難度。',
          engineering: '合／衝型返回規劃必須在出發前開始——停留時間是一種能量決策。',
        },
      },
    },
    lunarApproach: {
      en: {
        beginner: {
          title: 'Mars approach & landing',
          narrative: 'The ship slows into Mars space and descends. Mars has a thin atmosphere—useful but not enough alone for a heavy vehicle.',
          physics: 'Thin air gives some drag; rockets and heat shields still do most of the work for a large lander.',
          engineering: 'Dust, landing accuracy, and entry heating are major challenges. Public Starship Mars landing details continue to evolve.',
        },
        intermediate: {
          title: 'Mars arrival & EDL',
          narrative:
            'Educational placeholder for entry, descent, and landing. Ideal heliocentric arrival burn ~2.6 km/s class before atmosphere/propulsive capture trades.',
          physics: 'Ballistic coefficient and lift modulate heating and range. Pure propulsive capture is Δv-heavy.',
          engineering: 'EDL for Starship-class vehicles is an active development topic; treat specific timelines as unknown unless published.',
        },
        advanced: {
          title: 'Hyperbolic approach & EDL trades',
          narrative: 'Arrival V∞ varies across the launch period. Aerocapture vs propulsive MOI vs direct EDL are architecture trades—not settled public Starship numbers.',
          physics: 'Heating ~ V³-class intuition; thin CO₂ atmosphere limits heritage capsule techniques at huge mass.',
          engineering: 'Unknowns: final TPS, engine relight after cruise, pad/plume interactions on regolith—label rather than invent.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '火星接近與著陸',
          narrative: '船艦減速進入火星空間並下降。火星大氣稀薄——有用但不足以單獨減速重型載具。',
          physics: '稀薄空氣提供一些阻力；大型著陸器仍主要靠火箭與熱盾。',
          engineering: '塵土、著陸精度與再入加熱是主要挑戰。公開的 Starship 火星著陸細節仍在演進。',
        },
        intermediate: {
          title: '火星到達與 EDL',
          narrative: '進入、下降與著陸的教育占位。理想日心到達點火約 2.6 km/s 量級，之後還有大氣／推進捕獲取捨。',
          physics: '彈道係數與升力調節加熱與航程。純推進捕獲 Δv 很高。',
          engineering: 'Starship 級 EDL 仍是活躍開發主題；除非已公布，否則時序視為未知。',
        },
        advanced: {
          title: '雙曲線接近與 EDL 取捨',
          narrative: '到達 V∞ 隨發射期變化。氣動捕獲／推進入軌／直接 EDL 屬架構取捨——非已定案的公開 Starship 數字。',
          physics: '加熱可用 ~V³ 級直覺；稀薄二氧化碳大氣限制大質量沿用傳統返回艙技術。',
          engineering: '未知：最終熱防護、巡航後引擎再點火、表岩屑羽流作用——標明而非虛構。',
        },
      },
    },
    surface: {
      en: {
        beginner: {
          title: 'Mars surface operations',
          narrative: 'Public Starship goals include cargo and crew on Mars. Surface time on a cheap round trip can be many months while waiting to go home.',
          physics: 'Mars gravity is about 0.38 g. Cold temperatures and dust affect people and machines.',
          engineering: 'Power, habitats, dust, and propellant for the return burn are central. Details depend on future missions.',
        },
        intermediate: {
          title: 'Mars stay (conjunction vs opposition)',
          narrative:
            'NASA studies: conjunction-class stays can exceed ~300 days while awaiting return alignment; opposition-class stays may be ~30–50 days at higher energy.',
          physics: 'Return Δv and Earth entry speed trade against stay duration.',
          engineering: 'ISRU (making propellant) appears in SpaceX public Mars narratives; flight-proven surface ISRU at scale is not yet demonstrated.',
        },
        advanced: {
          title: 'Surface logistics & return readiness',
          narrative: 'Long stays stress reliability and spares; short stays stress propulsion performance. Neither class is a flown Starship template.',
          physics: 'Dust storms and thermal cycling affect power and mechanisms.',
          engineering: 'Open: certified ascent from Mars, crew health over ~1000-day class missions, and abort options.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '火星表面作業',
          narrative: '公開的 Starship 目標包含火星貨運與乘員。若走便宜往返，表面停留可能長達數月以等待回家。',
          physics: '火星重力約 0.38 g。低溫與灰塵影響人與機器。',
          engineering: '電力、棲息地、灰塵與返回點火推進劑是核心。細節取決於未來任務。',
        },
        intermediate: {
          title: '火星停留（合型 vs 衝型）',
          narrative: 'NASA 研究：合型停留可超過約 300 日等待返回對齊；衝型停留可能約 30–50 日但能量更高。',
          physics: '返回 Δv 與地球再入速度會與停留時長取捨。',
          engineering: 'ISRU（現場製推進劑）出現在 SpaceX 公開火星敘事中；規模化已驗證的表面 ISRU 尚未示範。',
        },
        advanced: {
          title: '表面後勤與返回就緒',
          narrative: '長停留考驗可靠度與備件；短停留考驗推進性能。兩者都不是已飛行的 Starship 範本。',
          physics: '塵暴與熱循環影響電力與機構。',
          engineering: '未決：火星上升認證、約 1000 日級任務的乘員健康，以及中止選項。',
        },
      },
    },
    return: {
      en: {
        beginner: {
          title: 'Mars ascent & Earth return',
          narrative: 'Leaving Mars and aiming home needs another long coast. If you leave at the wrong time, you need much more fuel.',
          physics: 'Mars escape is easier than Earth escape, but the solar-orbit change back to Earth is still large.',
          engineering: 'Engines must work after months on Mars. Navigation aims at a safe Earth reentry corridor.',
        },
        intermediate: {
          title: 'TEI opportunity & cruise home',
          narrative: 'Conjunction returns wait for geometry; opposition returns leave earlier at higher Δv. One-way home coasts are again many months.',
          physics: 'Earth arrival speeds can be higher on energetic returns—heat shield demand rises.',
          engineering: 'Public Starship Earth-return-from-Mars profiles are conceptual; numbers here stay at class level.',
        },
        advanced: {
          title: 'Return-leg trajectory design',
          narrative: 'Optimal round-trip design is a coupled double-rendezvous problem (NASA NTRS mission-planning literature).',
          physics: 'Minimize total Δv subject to stay ≥ constraint and entry speed limits.',
          engineering: 'Abort-to-Earth options shrink once committed to a long stay—mission rules must be explicit.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '火星上升與返回地球',
          narrative: '離開火星並瞄準回家需要另一段長滑行。若時機錯誤，需要多得多的燃料。',
          physics: '逃離火星比逃離地球容易，但改回地球的繞日軌道仍代價很大。',
          engineering: '引擎必須在火星待數月後仍能工作。導航要對準安全的地球再入走廊。',
        },
        intermediate: {
          title: 'TEI 機會與返航巡航',
          narrative: '合型返回等待幾何；衝型較早離開但 Δv 更高。單程回家同樣是數月滑行。',
          physics: '高能量返回的地球到達速度可能更高——熱盾需求上升。',
          engineering: '公開的 Starship 火星返回地球剖面屬概念性；此處維持量級描述。',
        },
        advanced: {
          title: '回程軌跡設計',
          narrative: '最佳往返設計是耦合的雙重交會問題（NASA NTRS 任務規劃文獻）。',
          physics: '在停留≥約束與再入速度限制下最小化總 Δv。',
          engineering: '一旦投入長停留，中止回地球選項變少——任務規則必須明確。',
        },
      },
    },
  },
  jupiter: {
    surface: {
      en: {
        beginner: {
          title: 'Jupiter flyby / capture orbit',
          narrative:
            'There is no solid surface on Jupiter. Missions either fly past or enter orbit around the planet — not a landing.',
          physics: 'Deep gravity well and intense radiation; crewed Starship surface landing is not a physical option.',
          engineering: 'Galilean moon tours or orbiters use gravity assists and heavy shielding — not Starship HLS-style landings.',
        },
        intermediate: {
          title: 'Flyby or Jovian orbit (no landing)',
          narrative: 'Public Starship goals focus on Moon/Mars. Jupiter is shown for energy/time scale only.',
          physics: 'Ideal Hohmann arrival is a heliocentric velocity match, not a surface touchdown.',
          engineering: 'Capture into orbit around Jupiter can demand large further Δv or multi-assist tours.',
        },
        advanced: {
          title: 'Outer-planet arrival (comparison)',
          narrative: 'Historical missions (Galileo, Juno class) used assists and multi-year cruises.',
          physics: 'Radiation belts and deep gravity dominate feasibility beyond Δv tables.',
          engineering: 'No public Starship Jupiter surface architecture — omit landing from teaching copy.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '木星飛掠／捕獲軌道',
          narrative: '木星沒有固體表面。任務只能飛掠或進入行星軌道——無法「著陸」。',
          physics: '深重力井與強輻射；載人 Starship 不可能在木星表面著陸。',
          engineering: '伽利略衛星巡遊或軌道器需重力助推與厚重屏蔽——非 HLS 式著陸。',
        },
        intermediate: {
          title: '飛掠或木星軌道（無著陸）',
          narrative: '公開 Starship 目標在月球／火星。木星僅用於能量／時間尺度比較。',
          physics: '理想霍曼到達是日心速度匹配，非表面著陸。',
          engineering: '被捕獲進入木星軌道還可能需要大量 Δv 或多重助推。',
        },
        advanced: {
          title: '外行星到達（比較）',
          narrative: '歷史任務（Galileo、Juno 級）使用助推與多年巡航。',
          physics: '輻射帶與深重力主導可行性，遠超 Δv 表。',
          engineering: '無公開 Starship 木星表面架構——教學文案省略著陸。',
        },
      },
    },
  },
}

function genericPlanetaryCopy(
  phaseId: PhaseId,
  destinationId: DestinationId,
  locale: Locale,
  difficulty: Difficulty,
): PhaseCopy | null {
  if (destinationId === 'moon' || destinationId === 'mars') return null
  if (!['tli', 'lunarApproach', 'surface', 'return'].includes(phaseId)) return null
  const dest = getDestination(destinationId)
  const name = dest.name[locale]
  const overview = dest.copy[locale][difficulty].overview

  if (locale === 'en') {
    const titles: Record<string, string> = {
      tli: `Transfer toward ${name}`,
      lunarApproach: `${name} approach`,
      surface: `At ${name} (high-level)`,
      return: `Return from ${name}`,
    }
    return {
      title: titles[phaseId],
      narrative: `${overview} This scrubber shows an educational path—not a published Starship crew mission to ${name}.`,
      physics: dest.copy.en[difficulty].energyExplain,
      engineering: dest.copy.en[difficulty].windowExplain,
    }
  }

  const titles: Record<string, string> = {
    tli: `前往${name}的轉移`,
    lunarApproach: `${name}接近`,
    surface: `在${name}（高階）`,
    return: `從${name}返回`,
  }
  return {
    title: titles[phaseId],
    narrative: `${overview} 本時間軸為教育路徑——並非已公布的 Starship 載人前往${name}任務。`,
    physics: dest.copy['zh-Hant'][difficulty].energyExplain,
    engineering: dest.copy['zh-Hant'][difficulty].windowExplain,
  }
}

export function resolvePhaseCopy(
  phaseId: PhaseId,
  base: PhaseCopy,
  destinationId: DestinationId,
  locale: Locale,
  difficulty: Difficulty,
): PhaseCopy {
  const overlay = phaseOverlays[destinationId]?.[phaseId]?.[locale]?.[difficulty]
  if (overlay) return overlay
  return genericPlanetaryCopy(phaseId, destinationId, locale, difficulty) ?? base
}
