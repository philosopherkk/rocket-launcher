import { formatDays, formatKms, hohmannEarthTo } from './orbital'
import type { Difficulty, Locale } from './phases'

export type DestinationId = 'moon' | 'mars' | 'venus' | 'mercury' | 'jupiter'

export type Destination = {
  id: DestinationId
  /** Mean heliocentric distance (AU); Moon uses null (cislunar) */
  heliocentricAU: number | null
  /** Visual params for R3F (not to scale with reality) */
  visual: {
    color: string
    radius: number
    distanceScale: number
  }
  name: Record<Locale, string>
  short: Record<Locale, string>
  /** SpaceX public role for this destination */
  vehicleNote: Record<Locale, string>
  energy: {
    /** Idealized numbers with labels */
    rows: {
      id: string
      label: Record<Locale, string>
      value: Record<Locale, string>
      note?: Record<Locale, string>
    }[]
    caveats: Record<Locale, string>
  }
  windows: {
    cadence: Record<Locale, string>
    oneWay: Record<Locale, string>
    roundTrip: Record<Locale, string>
    nextHint: Record<Locale, string>
    exampleYears?: string
  }
  copy: Record<
    Locale,
    Record<
      Difficulty,
      {
        overview: string
        energyExplain: string
        windowExplain: string
      }
    >
  >
}

const marsH = hohmannEarthTo(1.524)
const venusH = hohmannEarthTo(0.723)
const mercuryH = hohmannEarthTo(0.387)
const jupiterH = hohmannEarthTo(5.203)

export const destinations: Destination[] = [
  {
    id: 'moon',
    heliocentricAU: null,
    visual: { color: '#b8b3a8', radius: 1.15, distanceScale: 1 },
    name: { en: 'Moon', 'zh-Hant': '月球' },
    short: {
      en: 'Cislunar round-trip (Starship / HLS architecture context)',
      'zh-Hant': '地月往返（Starship／HLS 架構脈絡）',
    },
    vehicleNote: {
      en: 'SpaceX Starship is publicly described for Moon missions; NASA HLS concepts use Starship for lunar landing architectures.',
      'zh-Hant': 'SpaceX 公開描述 Starship 可用於月球任務；NASA HLS 概念以 Starship 作為月面登陸架構。',
    },
    energy: {
      rows: [
        {
          id: 'tli',
          label: { en: 'Trans-lunar injection (LEO→lunar transfer)', 'zh-Hant': '地月轉移點火（近地軌道→月球轉移）' },
          value: { en: '~3.1–3.2 km/s (typical textbook / Apollo-class order)', 'zh-Hant': '約 3.1–3.2 km/s（教科書／阿波羅量級）' },
          note: {
            en: 'Order-of-magnitude educational figure; exact Starship burn tables are not public.',
            'zh-Hant': '教育用數量級；Starship 精確點火表未公開。',
          },
        },
        {
          id: 'loi-land',
          label: { en: 'Lunar orbit / landing burns (combined order)', 'zh-Hant': '月軌／著陸點火（合計量級）' },
          value: { en: 'Roughly ~0.8–2+ km/s depending on profile', 'zh-Hant': '依剖面約 ~0.8–2+ km/s' },
          note: {
            en: 'Wide range: orbit insertion vs direct descent; not a Starship certification number.',
            'zh-Hant': '範圍很寬：先入軌或直接下降；非 Starship 認證數字。',
          },
        },
        {
          id: 'earth-escape-context',
          label: { en: 'Earth ascent to LEO (context)', 'zh-Hant': '地球上升至近地軌道（背景）' },
          value: { en: '~9.4 km/s Δv budget class (with losses) to LEO', 'zh-Hant': '至近地軌道 Δv 預算量級約 ~9.4 km/s（含損失）' },
          note: {
            en: 'Standard rocketry teaching budget; Super Heavy+Starship performance is vehicle-specific.',
            'zh-Hant': '標準火箭教學預算；Super Heavy＋Starship 性能依載具而定。',
          },
        },
      ],
      caveats: {
        en: 'Moon transfers are cislunar (Earth–Moon), not heliocentric Hohmann. Numbers above are educational orders of magnitude from public orbital-mechanics teaching, not SpaceX flight rules.',
        'zh-Hant': '月球轉移屬地月空間，非日心霍曼轉移。以上為公開軌道力學教學的數量級，非 SpaceX 飛行規則。',
      },
    },
    windows: {
      cadence: {
        en: 'Favorable geometries repeat on lunar synodic timescales (~29.5 days); many launch days exist vs interplanetary windows.',
        'zh-Hant': '有利幾何約以朔望月（~29.5 日）尺度重複；可發射日遠多於行星窗口。',
      },
      oneWay: {
        en: 'Apollo-class / public educational transit ~3 days Earth→Moon (profile-dependent).',
        'zh-Hant': '阿波羅級／公開教學地月飛行約 3 日（依剖面而異）。',
      },
      roundTrip: {
        en: 'Short stays of days are possible; Artemis-era surface stays are mission-specific (not a single fixed public duration).',
        'zh-Hant': '可進行數日短停留；Artemis 時期月面停留隨任務而定（非單一固定公開時長）。',
      },
      nextHint: {
        en: 'Unlike Mars, you are not locked to a ~2-year cadence for a minimum-energy path.',
        'zh-Hant': '與火星不同，最低能量路徑並不鎖定在約兩年一次的節奏。',
      },
    },
    copy: {
      en: {
        beginner: {
          overview: 'The Moon is our nearest neighbor. A Starship lunar trip is about leaving Earth, coasting for a few days, landing, then coming home.',
          energyExplain: 'You need a big push to leave Earth orbit toward the Moon, then rocket burns to slow down and land—there is almost no air to help brake.',
          windowExplain: 'Good Moon paths open much more often than trips to Mars. Timing still matters, but you are not waiting years between chances.',
        },
        intermediate: {
          overview: 'Cislunar transfers use Earth–Moon gravity. Public Artemis/HLS materials describe multi-day coasts toward NRHO or lunar vicinity depending on architecture.',
          energyExplain: 'TLI from LEO is roughly 3.1–3.2 km/s class. Landing and ascent add more Δv; exact Starship HLS budgets are not fully published.',
          windowExplain: 'Phasing with the Moon (~29.5-day synodic month) sets repeating geometries. Daily launch pads still face lighting, range, and vehicle constraints.',
        },
        advanced: {
          overview: 'Patched-conic or CR3BP designs (e.g. NRHO rendezvous with Orion) differ from a pure free-return Apollo profile. This app’s scrubber is educational geometry.',
          energyExplain: 'Budget Earth ascent losses, TLI, mid-courses, LOI or powered descent, ascent, TEI, and Earth entry. Do not treat blog “total Δv” tables as Starship truth.',
          windowExplain: 'Low-energy ballistic lunar transfers can take weeks; fast transfers take ~3 days. Window width depends on C3, plane, and rendezvous constraints.',
        },
      },
      'zh-Hant': {
        beginner: {
          overview: '月球是離我們最近的天體。Starship 月球之旅大致是：離開地球、滑行數日、著陸，再回家。',
          energyExplain: '需要一大推力離開地球軌道飛向月球，再用火箭減速著陸——幾乎沒有大氣幫忙煞車。',
          windowExplain: '合適的月球路徑比火星任務常見得多。時機仍重要，但不必等上好幾年才有一次機會。',
        },
        intermediate: {
          overview: '地月轉移使用地－月重力。公開 Artemis／HLS 資料依架構描述數日滑行至 NRHO 或月球附近。',
          energyExplain: '從近地軌道做 TLI 大約是 3.1–3.2 km/s 量級。著陸與上升還要更多 Δv；Starship HLS 精確預算未完全公開。',
          windowExplain: '與月球的相位（朔望月約 29.5 日）形成重複幾何。發射場每日仍受光照、航安與載具限制。',
        },
        advanced: {
          overview: '拼接圓錐或圓型限制三體（如與 Orion 在 NRHO 交會）不同於純阿波羅自由返回。本時間軸為教學幾何。',
          energyExplain: '預算需含地球上升損失、TLI、中途修正、LOI 或動力下降、上升、TEI 與地球再入。勿把部落格「總 Δv」表當成 Starship 事實。',
          windowExplain: '低能量彈道轉移可達數週；快速轉移約 3 日。窗口寬度取決於 C3、軌道面與交會約束。',
        },
      },
    },
  },
  {
    id: 'mars',
    heliocentricAU: 1.524,
    visual: { color: '#c46a3a', radius: 1.35, distanceScale: 1.35 },
    name: { en: 'Mars', 'zh-Hant': '火星' },
    short: {
      en: 'Heliocentric Hohmann-class path + conjunction/opposition round-trips',
      'zh-Hant': '日心霍曼級路徑＋合／衝型往返',
    },
    vehicleNote: {
      en: 'SpaceX publicly designs Starship for Mars cargo and crew; on-orbit refill is part of the public architecture. No crewed Mars flight has occurred.',
      'zh-Hant': 'SpaceX 公開將 Starship 設計用於火星貨運與乘員；軌道補加註屬公開架構。尚未發生載人火星飛行。',
    },
    energy: {
      rows: [
        {
          id: 'hohmann-depart',
          label: { en: 'Ideal Hohmann depart burn (Earth heliocentric)', 'zh-Hant': '理想霍曼出發點火（地球日心圓軌）' },
          value: {
            en: formatKms(marsH.dvDepart_kms),
            'zh-Hant': formatKms(marsH.dvDepart_kms),
          },
          note: {
            en: 'Circular coplanar model at 1.524 AU; excludes Earth escape from LEO/surface.',
            'zh-Hant': '1.524 AU 圓共面模型；不含從近地軌道／地面逃逸。',
          },
        },
        {
          id: 'hohmann-arrive',
          label: { en: 'Ideal Hohmann arrive burn (Mars heliocentric)', 'zh-Hant': '理想霍曼到達點火（火星日心圓軌）' },
          value: {
            en: formatKms(marsH.dvArrive_kms),
            'zh-Hant': formatKms(marsH.dvArrive_kms),
          },
        },
        {
          id: 'hohmann-sum',
          label: { en: 'Sum of two heliocentric burns', 'zh-Hant': '兩次日心點火合計' },
          value: {
            en: formatKms(marsH.heliocentricDv_kms),
            'zh-Hant': formatKms(marsH.heliocentricDv_kms),
          },
          note: {
            en: 'Still omit plane change, mid-courses, landing, and ascent.',
            'zh-Hant': '仍未含軌道面改變、中途修正、著陸與上升。',
          },
        },
        {
          id: 'tof',
          label: { en: 'Ideal one-way Hohmann coast', 'zh-Hant': '理想單程霍曼滑行' },
          value: {
            en: formatDays(marsH.oneWayDays, 'en'),
            'zh-Hant': formatDays(marsH.oneWayDays, 'zh-Hant'),
          },
          note: {
            en: 'NASA JPL education lesson cites ~259 days / half of ~517-day transfer period.',
            'zh-Hant': 'NASA JPL 教育課程引用約 259 日／轉移週期約 517 日的一半。',
          },
        },
      ],
      caveats: {
        en: 'Idealized two-body math for teaching. Real missions use Lambert solutions, launch-period penalties, and (for humans) conjunction vs opposition trades (NASA exploration studies).',
        'zh-Hant': '教學用理想二體計算。真實任務使用 Lambert 解、發射期懲罰，以及（載人）合／衝型取捨（NASA 探索研究）。',
      },
    },
    windows: {
      cadence: {
        en: `Minimum-energy Earth↔Mars opportunities about every ${Math.round(marsH.synodicDays / 30.44)} months (~${Math.round(marsH.synodicDays)} days). NASA Basics of Space Flight: ~25 months.`,
        'zh-Hant': `地球↔火星最低能量機會約每 ${Math.round(marsH.synodicDays / 30.44)} 個月（約 ${Math.round(marsH.synodicDays)} 日）。NASA《太空飛行基礎》約 25 個月。`,
      },
      oneWay: {
        en: `Hohmann-class coast ~${Math.round(marsH.oneWayDays)} days (JPL edu ~259 days). Faster paths cost more Δv.`,
        'zh-Hant': `霍曼級滑行約 ${Math.round(marsH.oneWayDays)} 日（JPL 教育約 259 日）。更快路徑需要更多 Δv。`,
      },
      roundTrip: {
        en: 'Conjunction-class (long stay): ~1,000-day class round trip with hundreds of days at Mars waiting for return alignment. Opposition-class (short stay): ~760 days or less total, ~30–50 days at Mars, higher energy (NASA Mars transportation white paper).',
        'zh-Hant': '合型（長停留）：往返約 1,000 日量級，在火星停留數百日等待返回對齊。衝型（短停留）：總時長約 760 日或更短，火星停留約 30–50 日，能量更高（NASA 火星運輸白皮書）。',
      },
      nextHint: {
        en: 'Example recent/upcoming Earth–Mars window years in the public exploration cadence include 2020, 2022, 2024, 2026, 2028… — exact open/close dates are mission-specific.',
        'zh-Hant': '公開探索節奏中，近期／即將到來的地火窗口年份包括 2020、2022、2024、2026、2028…——精確開關窗日期隨任務而異。',
      },
      exampleYears: '2020, 2022, 2024, 2026, 2028, 2031',
    },
    copy: {
      en: {
        beginner: {
          overview: 'Mars trips wait for Earth and Mars to line up. The thrifty path takes many months each way; a full round trip can take years if you wait for the cheap return.',
          energyExplain: 'Even the “cheap” space path needs carefully timed rocket burns. Coming home at the wrong time costs much more fuel.',
          windowExplain: 'Good Mars launch chances come about every two years. Round trips choose either a long stay (save fuel) or a short stay (spend more fuel, less total time).',
        },
        intermediate: {
          overview: 'Earth–Mars synodic period is ~26 months. Hohmann TOF is ~8–9 months. Starship’s public Mars plan relies on orbital refill before departure.',
          energyExplain: `Ideal heliocentric burns sum to ~${formatKms(marsH.heliocentricDv_kms)} before escape/landing. Conjunction vs opposition changes total mission Δv sharply.`,
          windowExplain: 'Conjunction ≈ long stay / lower energy; opposition ≈ short stay / higher energy, sometimes with Venus flybys in studied profiles (NASA NTRS studies).',
        },
        advanced: {
          overview:
            'Porkchop plots map Earth-departure C3 and arrival v∞ vs TOF across a launch period (NASA Trajectory Browser class). Human architecture papers trade ~1000-day conjunction-class round trips (long Mars stay) vs ≤~760-day opposition-class (short stay, higher energy) — NASA ACR Mars transportation white paper. Ideal Hohmann a≈1.262 AU, coast ~259 days (JPL edu). This app plots that teaching ellipse; real missions use Lambert / ephemeris solutions.',
          energyExplain: `Ideal heliocentric Δv sum ~${formatKms(marsH.heliocentricDv_kms)} (circular coplanar; μ☉ standard). Still add LEO→escape, capture or aerocapture, EDL, ascent, and TEI. Chemical all-propulsive opposition architectures grow heavy; SEP/NTP trades appear in NASA studies — not Starship-certified burn tables. Thin CO₂ atmosphere (~610 Pa) helps little for Starship-class β.`,
          windowExplain:
            'Synodic period ~780 days (~25–26 months; NASA Basics of Space Flight). After conjunction-class arrival you typically loiter hundreds of days for the next cheap Earthbound alignment. Shortening stay raises Δv nonlinearly; some studied opposition profiles use Venus gravity assists. Exact open/close calendars are mission-specific — not invented here.',
        },
      },
      'zh-Hant': {
        beginner: {
          overview: '前往火星要等地球與火星對齊。省燃料的路徑單程要好幾個月；若等便宜的回程，整個往返可能要好幾年。',
          energyExplain: '即使是「便宜」的太空路徑也需要精準時機的火箭點火。錯誤時間回家會耗掉更多燃料。',
          windowExplain: '合適的火星發射機會大約每兩年一次。往返可選長停留（省燃料）或短停留（多耗燃料、總時間較短）。',
        },
        intermediate: {
          overview: '地火會合週期約 26 個月。霍曼飛行時間約 8–9 個月。Starship 公開火星計畫在出發前依賴軌道補加註。',
          energyExplain: `理想日心點火合計約 ${formatKms(marsH.heliocentricDv_kms)}（尚未含逃逸／著陸）。合型與衝型會大幅改變總任務 Δv。`,
          windowExplain: '合型≈長停留／較低能量；衝型≈短停留／較高能量，部分研究剖面含金星飛掠（NASA NTRS）。',
        },
        advanced: {
          overview:
            '豬肉圖描繪發射期內地球出發 C3、到達 v∞ 與飛行時間（NASA Trajectory Browser 類）。載人架構取捨約 1000 日合型往返（長停留）與 ≤約 760 日衝型（短停留、能量更高）——NASA ACR 火星運輸白皮書。理想霍曼 a≈1.262 AU，滑行約 259 日（JPL 教育）。本應用繪製該教學橢圓；真實任務用 Lambert／星曆。',
          energyExplain: `理想日心 Δv 合計約 ${formatKms(marsH.heliocentricDv_kms)}（圓共面；標準 μ☉）。還需加近地→逃逸、捕獲或氣動捕獲、EDL、上升與 TEI。全化學衝型架構質量上升；NASA 研究出現 SEP／NTP 取捨——非 Starship 認證點火表。稀薄 CO₂（約 610 Pa）對 Starship 級 β 幫助有限。`,
          windowExplain:
            '會合週期約 780 日（約 25–26 個月；NASA《太空飛行基礎》）。合型到達後通常停留數百日等待下一個便宜返回對齊。縮短停留使 Δv 非線性上升；部分衝型研究剖面含金星重力助推。精確開關窗隨任務而定——此處不虛構。',
        },
      },
    },
  },
  {
    id: 'venus',
    heliocentricAU: 0.723,
    visual: { color: '#e8c97a', radius: 1.4, distanceScale: 0.85 },
    name: { en: 'Venus', 'zh-Hant': '金星' },
    short: {
      en: 'Inner-planet Hohmann (educational); not a published Starship destination profile',
      'zh-Hant': '內行星霍曼（教學）；非已公布的 Starship 任務剖面',
    },
    vehicleNote: {
      en: 'SpaceX marketing focuses on Moon/Mars. Venus figures here are orbital-mechanics education only—not an announced Starship mission.',
      'zh-Hant': 'SpaceX 公開重點在月球／火星。此處金星數字僅供軌道力學教育——非已宣布的 Starship 任務。',
    },
    energy: {
      rows: [
        {
          id: 'hohmann-depart',
          label: { en: 'Ideal Hohmann depart (slow down from Earth orbit)', 'zh-Hant': '理想霍曼出發（相對地球軌道減速）' },
          value: { en: formatKms(venusH.dvDepart_kms), 'zh-Hant': formatKms(venusH.dvDepart_kms) },
        },
        {
          id: 'hohmann-arrive',
          label: { en: 'Ideal Hohmann arrive at Venus orbit', 'zh-Hant': '理想霍曼到達金星軌道' },
          value: { en: formatKms(venusH.dvArrive_kms), 'zh-Hant': formatKms(venusH.dvArrive_kms) },
        },
        {
          id: 'hohmann-sum',
          label: { en: 'Sum of two heliocentric burns', 'zh-Hant': '兩次日心點火合計' },
          value: { en: formatKms(venusH.heliocentricDv_kms), 'zh-Hant': formatKms(venusH.heliocentricDv_kms) },
        },
        {
          id: 'tof',
          label: { en: 'Ideal one-way Hohmann coast', 'zh-Hant': '理想單程霍曼滑行' },
          value: {
            en: formatDays(venusH.oneWayDays, 'en'),
            'zh-Hant': formatDays(venusH.oneWayDays, 'zh-Hant'),
          },
        },
      ],
      caveats: {
        en: 'Venus has a dense hostile atmosphere and extreme surface temperatures—landing/return energy and thermal protection are separate hard problems beyond Hohmann Δv.',
        'zh-Hant': '金星有濃厚惡劣大氣與極端表面溫度——著陸／返回能量與熱防護是霍曼 Δv 之外的難題。',
      },
    },
    windows: {
      cadence: {
        en: `NASA Basics of Space Flight: Venus launch opportunities about every 19 months (synodic ~${Math.round(venusH.synodicDays)} days in this circular model).`,
        'zh-Hant': `NASA《太空飛行基礎》：金星發射機會約每 19 個月（此圓軌模型會合週期約 ${Math.round(venusH.synodicDays)} 日）。`,
      },
      oneWay: {
        en: `Hohmann-class one-way ~${Math.round(venusH.oneWayDays)} days.`,
        'zh-Hant': `霍曼級單程約 ${Math.round(venusH.oneWayDays)} 日。`,
      },
      roundTrip: {
        en: 'Round-trip phasing must wait for Earth–Venus geometry again; short flybys differ from lander round-trips. No crewed Venus round-trip architecture is assumed here.',
        'zh-Hant': '往返相位須再等地金幾何；短飛掠不同於登陸往返。此處不假設任何載人金星往返架構。',
      },
      nextHint: {
        en: 'Use the synodic cadence as a planning rhythm; precise windows need ephemerides (e.g. NASA Trajectory Browser class tools).',
        'zh-Hant': '以會合週期作為規劃節奏；精確窗口需要星曆（如 NASA Trajectory Browser 類工具）。',
      },
    },
    copy: {
      en: {
        beginner: {
          overview: 'Venus is closer to the Sun than Earth. The thrifty path slows you down so you fall inward, then match Venus’s faster orbital pace.',
          energyExplain: 'Going inward still costs rocket fuel—you must change your solar orbit carefully.',
          windowExplain: 'Good Venus chances come a bit more often than Mars—about every year and a half.',
        },
        intermediate: {
          overview: 'Inner-planet Hohmann: Earth aphelion of transfer, Venus perihelion. Synodic period ~19 months (NASA).',
          energyExplain: `Ideal heliocentric sum ~${formatKms(venusH.heliocentricDv_kms)}. Surface landings face ~90 bar / extreme heat—far beyond Δv tables.`,
          windowExplain: 'Round-trip lander stays are not standardized publicly for crew. Treat this destination as mechanics education.',
        },
        advanced: {
          overview: 'Type-I/II transfers and gravity assists (including for outer planets) complicate the simple Hohmann picture used in this panel.',
          energyExplain: 'Aerocapture at Venus is powerful but thermally brutal. Entry speeds and TPS design dominate vehicle feasibility.',
          windowExplain: 'Porkchop plots vs Venus are denser than Mars; mission design still couples C3, declination, and arrival V∞.',
        },
      },
      'zh-Hant': {
        beginner: {
          overview: '金星比地球更靠近太陽。省燃料的路徑是減速落入內側，再匹配金星較快的公轉。',
          energyExplain: '飛向內側仍要火箭燃料——必須小心改變繞日軌道。',
          windowExplain: '合適的金星機會比火星稍頻繁——大約每一年半一次。',
        },
        intermediate: {
          overview: '內行星霍曼：轉移軌道遠日點在地球、近日點在金星。會合週期約 19 個月（NASA）。',
          energyExplain: `理想日心合計約 ${formatKms(venusH.heliocentricDv_kms)}。表面著陸面對約 90 巴／極端高溫——遠超出 Δv 表。`,
          windowExplain: '載人登陸往返停留並無公開標準化。此目的地視為力學教育。',
        },
        advanced: {
          overview: 'I／II 型轉移與重力助推（含對外行星）會使本面板的簡單霍曼圖像變複雜。',
          energyExplain: '金星氣動捕獲能量大但熱環境嚴酷。再入速度與熱防護主導載具可行性。',
          windowExplain: '相對金星的豬肉圖比火星更密；任務設計仍耦合 C3、赤緯與到達 V∞。',
        },
      },
    },
  },
  {
    id: 'mercury',
    heliocentricAU: 0.387,
    visual: { color: '#9a9590', radius: 0.85, distanceScale: 0.65 },
    name: { en: 'Mercury', 'zh-Hant': '水星' },
    short: {
      en: 'High-Δv inner target (educational Hohmann; assists usually required in practice)',
      'zh-Hant': '高 Δv 內側目標（教學霍曼；實務多用助推）',
    },
    vehicleNote: {
      en: 'Not a published Starship destination. Shown to compare energy scales.',
      'zh-Hant': '非已公布的 Starship 目的地。用於比較能量尺度。',
    },
    energy: {
      rows: [
        {
          id: 'hohmann-sum',
          label: { en: 'Ideal Hohmann heliocentric burn sum', 'zh-Hant': '理想霍曼日心點火合計' },
          value: { en: formatKms(mercuryH.heliocentricDv_kms), 'zh-Hant': formatKms(mercuryH.heliocentricDv_kms) },
          note: {
            en: 'Much larger than Mars/Venus in this simple model—why real probes use gravity assists.',
            'zh-Hant': '在此簡單模型中遠大於火星／金星——這也是真實探測器使用重力助推的原因。',
          },
        },
        {
          id: 'tof',
          label: { en: 'Ideal one-way Hohmann coast', 'zh-Hant': '理想單程霍曼滑行' },
          value: {
            en: formatDays(mercuryH.oneWayDays, 'en'),
            'zh-Hant': formatDays(mercuryH.oneWayDays, 'zh-Hant'),
          },
        },
        {
          id: 'depart',
          label: { en: 'Depart / arrive burns', 'zh-Hant': '出發／到達點火' },
          value: {
            en: `${formatKms(mercuryH.dvDepart_kms)} + ${formatKms(mercuryH.dvArrive_kms)}`,
            'zh-Hant': `${formatKms(mercuryH.dvDepart_kms)} + ${formatKms(mercuryH.dvArrive_kms)}`,
          },
        },
      ],
      caveats: {
        en: 'Direct Hohmann to Mercury is rarely optimal. Missions like MESSENGER / BepiColombo use multi-assist trajectories over years.',
        'zh-Hant': '直接霍曼前往水星很少是最佳解。MESSENGER／BepiColombo 等任務使用歷時數年的多重助推軌跡。',
      },
    },
    windows: {
      cadence: {
        en: `Circular-model synodic period ~${Math.round(mercuryH.synodicDays)} days (~${(mercuryH.synodicDays / 30.44).toFixed(1)} months).`,
        'zh-Hant': `圓軌模型會合週期約 ${Math.round(mercuryH.synodicDays)} 日（約 ${(mercuryH.synodicDays / 30.44).toFixed(1)} 個月）。`,
      },
      oneWay: {
        en: `Ideal Hohmann one-way ~${Math.round(mercuryH.oneWayDays)} days — real missions take years via assists.`,
        'zh-Hant': `理想霍曼單程約 ${Math.round(mercuryH.oneWayDays)} 日——真實任務經助推需數年。`,
      },
      roundTrip: {
        en: 'Crewed Mercury round-trips are not part of public Starship plans. Energy and thermal environment make this a comparison case only.',
        'zh-Hant': '載人水星往返不在公開 Starship 計畫中。能量與熱環境使其僅作比較案例。',
      },
      nextHint: {
        en: 'Prefer mission-designed assist chains over raw Hohmann cadence for real planning.',
        'zh-Hant': '真實規劃應優先任務設計的助推鏈，而非原始霍曼節奏。',
      },
    },
    copy: {
      en: {
        beginner: {
          overview: 'Mercury sits deep in the Sun’s gravity well. Getting there cheaply is hard—spacecraft usually borrow gravity from other planets.',
          energyExplain: 'A simple textbook path shows a very large fuel cost compared with Mars.',
          windowExplain: 'Geometry repeats several times a year in a simple model, but real paths are long multi-assist tours.',
        },
        intermediate: {
          overview: 'Large heliocentric Δv in the coplanar Hohmann model explains assist-heavy designs.',
          energyExplain: `Ideal burn sum ~${formatKms(mercuryH.heliocentricDv_kms)} before planetary escape/capture details.`,
          windowExplain: 'Synodic opportunities are frequent; propellant and thermal constraints dominate.',
        },
        advanced: {
          overview: 'Compare porkchop direct transfers vs resonant assists; solar proximity drives thermal and communications design.',
          energyExplain: 'Oberth benefits from escaping via high-thrust near Earth still leave a steep heliocentric bill without assists.',
          windowExplain: 'Round-trip crewed architectures are speculative and omitted as fact.',
        },
      },
      'zh-Hant': {
        beginner: {
          overview: '水星深在太陽重力井中。便宜到達很困難——探測器通常借用其他行星的重力。',
          energyExplain: '簡單教科書路徑顯示燃料成本遠高於火星。',
          windowExplain: '簡單模型中幾何一年可重複多次，但真實路徑是漫長的多重助推之旅。',
        },
        intermediate: {
          overview: '圓共面霍曼模型中的巨大日心 Δv 解釋了為何設計偏重助推。',
          energyExplain: `理想點火合計約 ${formatKms(mercuryH.heliocentricDv_kms)}（尚未含行星逃逸／捕獲細節）。`,
          windowExplain: '會合機會頻繁；推進劑與熱約束才是主導。',
        },
        advanced: {
          overview: '比較豬肉圖直接轉移與共振助推；靠近太陽驅動熱控與通訊設計。',
          energyExplain: '即使利用地球附近高推力的奧伯特效應逃逸，若无助推，日心代價仍很高。',
          windowExplain: '載人往返架構屬臆測，不以事實呈現。',
        },
      },
    },
  },
  {
    id: 'jupiter',
    heliocentricAU: 5.203,
    visual: { color: '#d2a36b', radius: 2.2, distanceScale: 2.1 },
    name: { en: 'Jupiter', 'zh-Hant': '木星' },
    short: {
      en: 'Outer-planet scale: long TOF, large energy; educational comparison',
      'zh-Hant': '外行星尺度：長飛行時間、大能量；教學比較',
    },
    vehicleNote: {
      en: 'Not a published Starship crewed destination. Starship is publicly aimed at Moon/Mars; Jupiter is shown for energy/time scale contrast.',
      'zh-Hant': '非已公布的 Starship 載人目的地。Starship 公開目標為月球／火星；木星用於能量／時間尺度對比。',
    },
    energy: {
      rows: [
        {
          id: 'hohmann-sum',
          label: { en: 'Ideal Hohmann heliocentric burn sum', 'zh-Hant': '理想霍曼日心點火合計' },
          value: { en: formatKms(jupiterH.heliocentricDv_kms), 'zh-Hant': formatKms(jupiterH.heliocentricDv_kms) },
        },
        {
          id: 'tof',
          label: { en: 'Ideal one-way Hohmann coast', 'zh-Hant': '理想單程霍曼滑行' },
          value: {
            en: formatDays(jupiterH.oneWayDays, 'en'),
            'zh-Hant': formatDays(jupiterH.oneWayDays, 'zh-Hant'),
          },
        },
        {
          id: 'depart-arrive',
          label: { en: 'Depart / arrive burns', 'zh-Hant': '出發／到達點火' },
          value: {
            en: `${formatKms(jupiterH.dvDepart_kms)} + ${formatKms(jupiterH.dvArrive_kms)}`,
            'zh-Hant': `${formatKms(jupiterH.dvDepart_kms)} + ${formatKms(jupiterH.dvArrive_kms)}`,
          },
        },
      ],
      caveats: {
        en: 'Real outer-planet missions often use gravity assists and multi-year cruise (e.g. historical Galileo/Juno class timelines). Ideal Hohmann understates design complexity.',
        'zh-Hant': '真實外行星任務常用重力助推與多年巡航（如歷史上 Galileo／Juno 級時程）。理想霍曼低估設計複雜度。',
      },
    },
    windows: {
      cadence: {
        en: `Earth–Jupiter synodic period ~${Math.round(jupiterH.synodicDays)} days (~${(jupiterH.synodicDays / 365.25).toFixed(2)} years) in this model.`,
        'zh-Hant': `此模型中地木會合週期約 ${Math.round(jupiterH.synodicDays)} 日（約 ${(jupiterH.synodicDays / 365.25).toFixed(2)} 年）。`,
      },
      oneWay: {
        en: `Ideal Hohmann one-way ~${(jupiterH.oneWayDays / 365.25).toFixed(2)} years.`,
        'zh-Hant': `理想霍曼單程約 ${(jupiterH.oneWayDays / 365.25).toFixed(2)} 年。`,
      },
      roundTrip: {
        en: 'A minimum-energy round trip implies multi-year outbound, long wait for return geometry, and multi-year inbound—crewed architectures are not claimed here.',
        'zh-Hant': '最低能量往返意味著數年去程、長時間等待返回幾何，再數年回程——此處不宣稱任何載人架構。',
      },
      nextHint: {
        en: 'Compare with Mars (~years RT) vs Jupiter (much longer) to see why Mars is the public crewed focus.',
        'zh-Hant': '與火星（往返數年量級）對比木星（長得多），可理解為何公開載人焦點在火星。',
      },
    },
    copy: {
      en: {
        beginner: {
          overview: 'Jupiter is far away. Even the thrifty path takes years one way, so round trips are enormous commitments.',
          energyExplain: 'You need a big push to climb outward in the solar system, then more burns to match Jupiter’s orbit.',
          windowExplain: 'Chances to leave on a cheap path repeat a bit more often than once a year, but each trip still lasts a very long time.',
        },
        intermediate: {
          overview: 'Outer-planet Hohmann TOF dominates mission design. Radiation near Jupiter is an additional engineering wall.',
          energyExplain: `Ideal heliocentric sum ~${formatKms(jupiterH.heliocentricDv_kms)}; capture into orbit around Jupiter can demand large further Δv or assists.`,
          windowExplain: 'Synodic ~399 days class; round-trip waits stack years on years.',
        },
        advanced: {
          overview: 'Patched V∞ targeting, Galilean moon tours, and radiation belts dominate beyond simple Hohmann Δv.',
          energyExplain: 'Oberth maneuvers near Jupiter and moon assists (à la historical mission design) reshape the budget.',
          windowExplain: 'No public Starship round-trip Jupiter crew plan—comparison only.',
        },
      },
      'zh-Hant': {
        beginner: {
          overview: '木星非常遙遠。即使省燃料路徑單程也要好幾年，往返是巨大的承諾。',
          energyExplain: '需要大推力向外攀升太陽系，再更多點火以匹配木星軌道。',
          windowExplain: '便宜出發的機會比一年一次稍頻繁，但每次旅行仍然非常漫長。',
        },
        intermediate: {
          overview: '外行星霍曼飛行時間主導任務設計。木星附近輻射是另一道工程高牆。',
          energyExplain: `理想日心合計約 ${formatKms(jupiterH.heliocentricDv_kms)}；被捕獲進入木星軌道還可能需要大量額外 Δv 或助推。`,
          windowExplain: '會合週期約 399 日量級；往返等待會年復一年堆疊。',
        },
        advanced: {
          overview: '拼接 V∞ 瞄準、伽利略衛星巡遊與輻射帶，遠超出簡單霍曼 Δv。',
          energyExplain: '木星附近的奧伯特機動與衛星助推（如歷史任務設計）會重塑預算。',
          windowExplain: '沒有公開的 Starship 載人木星往返計畫——僅供比較。',
        },
      },
    },
  },
]

export function getDestination(id: DestinationId): Destination {
  return destinations.find((d) => d.id === id) ?? destinations[0]
}

export const destinationIds = destinations.map((d) => d.id)
