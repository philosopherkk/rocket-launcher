export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type Locale = 'en' | 'zh-Hant'

export type PhaseId =
  | 'prelaunch'
  | 'ascent'
  | 'staging'
  | 'tli'
  | 'lunarApproach'
  | 'surface'
  | 'return'
  | 'reentry'

export type PhaseCopy = {
  title: string
  narrative: string
  physics: string
  engineering: string
}

export type MissionPhase = {
  id: PhaseId
  /** Start of this phase on the 0–1 mission scrubber */
  start: number
  /** End of this phase on the 0–1 mission scrubber */
  end: number
  /** Approximate educational duration label (not an operational timeline) */
  durationLabel: { en: string; 'zh-Hant': string }
  copy: Record<Locale, Record<Difficulty, PhaseCopy>>
}

/**
 * Educational mission profile inspired by publicly described Starship / HLS
 * architecture. Phase timings are illustrative for teaching, not a flight plan.
 */
export const phases: MissionPhase[] = [
  {
    id: 'prelaunch',
    start: 0,
    end: 0.08,
    durationLabel: { en: 'T− hours → T−0', 'zh-Hant': 'T−數小時 → T−0' },
    copy: {
      en: {
        beginner: {
          title: 'Pre-launch on the pad',
          narrative:
            'Starship and Super Heavy stand stacked on the launch mount. Propellant loading and checkouts prepare a fully reusable methane/oxygen launch system for liftoff.',
          physics:
            'The stack must overcome Earth’s gravity. Engines need more upward thrust than the vehicle’s weight.',
          engineering:
            'Ground systems chill and load large amounts of liquid methane and liquid oxygen. The tower supports integration, fueling, and (for booster recovery concepts) catch hardware.',
        },
        intermediate: {
          title: 'Pre-launch / pad operations',
          narrative:
            'Before ignition, teams load subcooled liquid methane (CH₄) and liquid oxygen (LOX) into Super Heavy and Starship. Public SpaceX materials describe Super Heavy propellant capacity of about 3,650 t and Starship about 1,600 t.',
          physics:
            'Subcooling densifies propellant so more mass fits in the tanks. Lift-off requires thrust-to-weight > 1 after accounting for pad hold-downs releasing.',
          engineering:
            'Thermal conditioning, leak checks, engine chill, and range safety logic must all clear. Stainless-steel tanks and cryogenic plumbing see steep temperature gradients during load.',
        },
        advanced: {
          title: 'Pad readiness & cryogenic load',
          narrative:
            'A Starship lunar profile (as described for HLS architectures) may require many prior tanker flights to preload a depot—those tanker flights are out of scope for this scrubber, which begins at the crewed/cargo stack launch.',
          physics:
            'Propellant mass dominates liftoff mass. With Super Heavy thrust listed near 8,240 tf, initial acceleration is modest until propellant is burned off and drag rises then falls through Max-Q.',
          engineering:
            'Challenges include boil-off management, engine-out capability at liftoff, and coordinating tower arms / quick-disconnects. Exact hold-down and abort criteria are not fully public for operational moon flights.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '發射台準備',
          narrative:
            'Starship 與 Super Heavy 直立在發射台上。填充推進劑與系統檢查，為這套可重複使用的甲烷／液氧運載系統起飛做準備。',
          physics: '火箭必須克服地球重力。引擎向上的推力必須大於整車重量。',
          engineering:
            '地面系統需冷卻並裝載大量液態甲烷與液氧。發射塔負責整合、加註，以及（在助推器回收概念中）捕捉相關設備。',
        },
        intermediate: {
          title: '發射前／發射台作業',
          narrative:
            '點火前，團隊將過冷液態甲烷（CH₄）與液氧（LOX）裝入 Super Heavy 與 Starship。SpaceX 公開資料列出 Super Heavy 推進劑約 3,650 公噸、Starship 約 1,600 公噸。',
          physics:
            '過冷可提高推進劑密度，讓槽體裝入更多質量。起飛時推力重量比須大於 1（並考慮夾持釋放）。',
          engineering:
            '熱控、洩漏檢查、引擎預冷與航安邏輯皆須通過。不鏽鋼槽體與低溫管路在加註時會承受劇烈溫差。',
        },
        advanced: {
          title: '發射台就緒與低溫加註',
          narrative:
            '公開的 Starship 月球任務架構（如 HLS）可能需要多次加油機飛行預先裝滿軌道油庫——本教學時間軸從堆疊起飛開始，不模擬那些前置飛行。',
          physics:
            '推進劑質量主導起飛質量。Super Heavy 公開推力約 8,240 公噸力，初期加速度有限，直到推進劑消耗與 Max-Q 氣動峰值過後才明顯增加。',
          engineering:
            '挑戰包含汽化損失管理、起飛引擎失效容錯，以及塔臂／快速接頭協調。作業級月球任務的夾持與中止準則並未完全公開。',
        },
      },
    },
  },
  {
    id: 'ascent',
    start: 0.08,
    end: 0.2,
    durationLabel: { en: '~0–2.5 min (illustrative)', 'zh-Hant': '約 0–2.5 分鐘（示意）' },
    copy: {
      en: {
        beginner: {
          title: 'Liftoff & ascent',
          narrative:
            'All 33 Super Heavy Raptor engines ignite. The stack climbs through the atmosphere. Peak aerodynamic stress (Max-Q) occurs early in flight.',
          physics:
            'Thrust pushes the rocket up; air resistance and gravity pull back. As air thins, drag falls.',
          engineering:
            'Engines must throttle and gimbal to keep the rocket pointed correctly while structure survives Max-Q.',
        },
        intermediate: {
          title: 'Liftoff & atmospheric ascent',
          narrative:
            'SpaceX flight-test timelines show liftoff, Max-Q, then Super Heavy most-engines-cut-off near a few minutes into flight. Exact moon-mission times will differ; treat these as educational markers.',
          physics:
            'Equation of motion: m·a = T − D − m·g·cosθ (simplified). Specific impulse and mixture ratio of CH₄/LOX Raptors set efficiency.',
          engineering:
            'Raptor is a full-flow staged-combustion methalox engine. Public figures list ~250 tf thrust per engine and Super Heavy using 13 center gimbaled engines plus 20 perimeter engines.',
        },
        advanced: {
          title: 'Ascent trajectory & aero loads',
          narrative:
            'Guided pitch program balances gravity losses, drag losses, and steering. Hot-staging (upper stage ignition before full physical separation) has been demonstrated on Starship flight tests.',
          physics:
            'Max-Q is where dynamic pressure q = ½ρv² peaks. Structural margins and engine throttle schedules are designed around that peak.',
          engineering:
            'Challenges: engine-out capability among 33 engines, base heating, acoustic environment, and maintaining mixture ratio under high acceleration. Flight-proven moon ascent timelines are not yet public.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '起飛與上升',
          narrative:
            'Super Heavy 的 33 具 Raptor 引擎點火。火箭穿過大氣層上升。最大氣動應力（Max-Q）出現在飛行早期。',
          physics: '推力向上推；空氣阻力與重力往回拉。空氣變稀薄後，阻力下降。',
          engineering: '引擎必須節流與萬向轉動以保持姿態，結構也要撐過 Max-Q。',
        },
        intermediate: {
          title: '起飛與大氣層上升',
          narrative:
            'SpaceX 飛行測試時間軸顯示起飛、Max-Q，然後在數分鐘內 Super Heavy 多數引擎關機。月球任務實際時間會不同；此處僅作教學標記。',
          physics:
            '簡化運動方程：m·a = T − D − m·g·cosθ。CH₄/LOX Raptor 的比沖與混合比決定效率。',
          engineering:
            'Raptor 為全流量分級燃燒甲烷液氧引擎。公開數據約每具 250 公噸力；Super Heavy 為中央 13 具可萬向轉動＋外圈 20 具。',
        },
        advanced: {
          title: '上升軌跡與氣動載荷',
          narrative:
            '導引俯仰程序在重力損失、阻力損失與轉向之間取捨。熱分離（上一級在完全分離前點火）已在 Starship 飛行測試中展示。',
          physics: 'Max-Q 是動壓 q = ½ρv² 的峰值。結構裕度與節流時序圍繞此峰值設計。',
          engineering:
            '挑戰：33 具引擎的失效容錯、底部加熱、聲振環境，以及高加速度下維持混合比。已驗證的月球任務上升時序尚未公開。',
        },
      },
    },
  },
  {
    id: 'staging',
    start: 0.2,
    end: 0.32,
    durationLabel: { en: 'Staging → LEO / refill context', 'zh-Hant': '級間分離 → 近地軌道／補加註' },
    copy: {
      en: {
        beginner: {
          title: 'Stage separation & orbital insertion',
          narrative:
            'Super Heavy separates and returns toward Earth. Starship continues under its own six Raptor engines toward orbit. For deep-space trips, public plans describe refilling propellant in orbit.',
          physics:
            'Dropping the heavy booster reduces mass so the remaining fuel can push Starship much farther.',
          engineering:
            'Hot-staging and booster boostback/landing or tower-catch concepts are part of the reusable design SpaceX describes publicly.',
        },
        intermediate: {
          title: 'Hot-staging & orbital energy',
          narrative:
            'Starship’s six engines (three sea-level Raptors and three Raptor Vacuum) continue the burn. SpaceX states the system is designed for >100 t to orbit when fully reusable, and for on-orbit refilling before leaving for the Moon or Mars.',
          physics:
            'Orbital insertion needs enough horizontal velocity (~7.8 km/s LEO scale) so centripetal requirement matches gravity. TLI needs still more Δv later.',
          engineering:
            'Booster recovery (boostback, entry burn, landing burn / catch) must not interfere with the ship’s ascent. Ship must manage ullage and engine relights in microgravity for later burns.',
        },
        advanced: {
          title: 'Orbital mechanics & depot architecture',
          narrative:
            'NASA/SpaceX public HLS concepts describe a depot in Earth orbit topped off by tanker Starships before the lander departs for the Moon. Exact tanker counts are mission-dependent and not fixed in this lesson.',
          physics:
            'Vis-viva and patched-conic estimates set Δv budgets; cryogenic boil-off and settling burns affect real propellant margins.',
          engineering:
            'Challenges: autonomous rendezvous/docking or propellant transfer, leak-free cryogenic couplings, and verifying engine relight (demonstrated on some flight tests, still evolving).',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '級間分離與入軌',
          narrative:
            'Super Heavy 分離並返回地球方向。Starship 以自身六具 Raptor 繼續飛向軌道。前往深空前，公開計畫描述會在軌道上補加註推進劑。',
          physics: '拋掉沉重的助推器可降低質量，讓剩餘燃料把 Starship 推得更遠。',
          engineering:
            '熱分離，以及助推器返回／降落或發射塔捕捉，都是 SpaceX 公開描述的可重複使用設計的一部分。',
        },
        intermediate: {
          title: '熱分離與軌道能量',
          narrative:
            'Starship 的六具引擎（三具海平面 Raptor 與三具 Raptor Vacuum）繼續燃燒。SpaceX 表示完全可重複使用構型設計可送 100+ 公噸入軌，並在前往月球或火星前於軌道補加註。',
          physics:
            '入軌需要足夠水平速度（近地軌道量級約 7.8 km/s）使向心力需求與重力匹配。之後的地月轉移還需要更多 Δv。',
          engineering:
            '助推器回收（返回、再入、著陸／捕捉）不得干擾上面級上升。上面級須在微重力下管理氣隙與引擎再點火。',
        },
        advanced: {
          title: '軌道力學與油庫架構',
          narrative:
            'NASA／SpaceX 公開的 HLS 概念描述近地軌道油庫，由加油機 Starship 加滿後，登陸艦再前往月球。加油次數隨任務而異，本課不固定該數字。',
          physics: '活力公式與拼接圓錐估計可用於 Δv 預算；低溫汽化與沉底點火影響實際推進劑裕度。',
          engineering:
            '挑戰：自主交會／對接或推進劑轉移、無洩漏低溫接頭，以及引擎再點火驗證（部分飛行測試已展示，仍在演進）。',
        },
      },
    },
  },
  {
    id: 'tli',
    start: 0.32,
    end: 0.48,
    durationLabel: { en: 'Days of coast (illustrative)', 'zh-Hant': '數日滑行（示意）' },
    copy: {
      en: {
        beginner: {
          title: 'Trans-lunar injection & coast',
          narrative:
            'After building energy in Earth orbit (and refilling, in public lunar architectures), Starship burns to leave for the Moon, then coasts for days along a transfer path.',
          physics:
            'A carefully timed burn stretches the orbit so the far side reaches toward the Moon.',
          engineering:
            'Navigation, communications, and keeping propellant settled for later burns matter during the quiet coast.',
        },
        intermediate: {
          title: 'TLI burn & lunar transfer',
          narrative:
            'Public Artemis/HLS materials describe the uncrewed Starship HLS traveling on the order of about six days to a near-rectilinear halo orbit (NRHO) region to await crew—timelines vary by mission design.',
          physics:
            'Hohmann-like or free-return-related transfers trade flight time against Δv. Mid-course corrections fix navigation errors.',
          engineering:
            'Deep-space communications delay, thermal control in sunlight/eclipse, and fault management without quick ground intervention are key.',
        },
        advanced: {
          title: 'Cislunar transfer dynamics',
          narrative:
            'This visualization shows a patched-conic teaching ellipse (LEO perigee → lunar-distance apogee ≈384,400 km). Real HLS profiles may target NRHO and involve Orion rendezvous; cargo-only Starship profiles differ. Educational geometry — not a certified flight plan. TLI Δv order ~3.1–3.2 km/s from LEO (textbook/Apollo class; Starship burn tables unpublished).',
          physics:
            'Vis-viva on the transfer: v=√[μ(2/r−1/a)]. Lunar SOI ~66,000 km class (textbook) marks where lunar-centered legs dominate in patched-conic intuition. Near NRHO, CR3BP / three-body dynamics and station-keeping matter; two-body patches break down.',
          engineering:
            'Challenges: optical/radiometric navigation, mid-course Δv budget, propellant thermal stratification, and radiation for crew configurations (HLS crew transfer is NASA-led with Orion). Free-return vs non-free-return trades are mission-specific.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '地月轉移點火與滑行',
          narrative:
            '在地球軌道累積能量（公開月球架構中還會補加註）後，Starship 點火前往月球，再滑行數日沿轉移路徑前進。',
          physics: '精確時機的點火會把軌道拉長，使遠地點伸向月球。',
          engineering: '滑行期間需要導航、通訊，並讓推進劑保持沉底以利後續點火。',
        },
        intermediate: {
          title: 'TLI 點火與地月轉移',
          narrative:
            '公開的 Artemis／HLS 資料描述無人 Starship HLS 約需六日量級飛向近直線暈軌道（NRHO）區域等待乘員——實際時程隨任務設計而變。',
          physics: '類似霍曼或自由返回的轉移在飛行時間與 Δv 間取捨。中途修正用來消除導航誤差。',
          engineering: '深空通訊延遲、日照／陰影下的熱控，以及無法快速仰賴地面介入的故障管理很關鍵。',
        },
        advanced: {
          title: '地月空間轉移動力學',
          narrative:
            '本視覺化為拼接圓錐教學橢圓（近地近地點→地月距離遠地點≈384,400 公里）。真實 HLS 可能以 NRHO 為目標並與 Orion 交會；純貨運剖面不同。教學幾何——非認證飛行計畫。從近地軌道 TLI Δv 約 3.1–3.2 km/s（教科書／阿波羅量級；Starship 點火表未公開）。',
          physics:
            '轉移上 vis-viva：v=√[μ(2/r−1/a)]。月球 SOI 約 66,000 公里量級（教科書）標示拼接圓錐中改以月球為中心的區段。近 NRHO 時圓型限制三體／三體動力學與維持軌道重要；二體拼接失效。',
          engineering:
            '挑戰：光學／無線電導航、中途 Δv 預算、推進劑熱分層，以及乘員構型輻射（HLS 乘員轉移由 NASA 與 Orion 主導）。自由返回與非自由返回取捨隨任務而定。',
        },
      },
    },
  },
  {
    id: 'lunarApproach',
    start: 0.48,
    end: 0.62,
    durationLabel: { en: 'Approach & landing burn', 'zh-Hant': '接近與著陸點火' },
    copy: {
      en: {
        beginner: {
          title: 'Lunar approach & landing',
          narrative:
            'Starship slows down and descends to the lunar surface. There is almost no air on the Moon, so wings and parachutes do not help—rockets must do the braking.',
          physics:
            'Moon gravity is about one-sixth of Earth’s, but you still need precise rocket burns to land softly.',
          engineering:
            'Landing legs, engines, and sensors must work together to avoid rocks and slopes. NASA describes an elevator on Starship HLS for crew/cargo to the surface.',
        },
        intermediate: {
          title: 'Powered descent',
          narrative:
            'NASA public concepts show Starship HLS performing a braking burn after leaving low lunar orbit, then final descent. HLS height is described as roughly 50 m (~164 ft).',
          physics:
            'Without atmosphere, there is no aerobraking. All Δv comes from propulsion. Plume–surface interaction can loft dust (regolith).',
          engineering:
            'Hazard detection and avoidance, throttleable Raptors in vacuum, and tall-vehicle tip-over stability on uneven ground are major design drivers.',
        },
        advanced: {
          title: 'Vacuum landing mechanics',
          narrative:
            'Public materials emphasize uncrewed lunar landing demonstration before crewed use. Exact throttle curves and landing-site certification data remain limited in open sources.',
          physics:
            'Gravity-turn / pitch-up profiles minimize gravity losses while keeping line-of-sight sensors useful. Exhaust in vacuum expands widely, affecting cratering and sensor blinding.',
          engineering:
            'Challenges: engine plume ejecta damaging the vehicle or nearby hardware, cryogenic management after long coast, and abort-to-orbit options from low altitude (details not fully public).',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '月球接近與著陸',
          narrative:
            'Starship 減速並下降到月面。月球幾乎沒有大氣，機翼與降落傘幫不上忙——必須靠火箭煞車。',
          physics: '月球重力約為地球的六分之一，但仍需精確火箭點火才能軟著陸。',
          engineering:
            '著陸腿、引擎與感測器須協同避開岩石與斜坡。NASA 描述 Starship HLS 以電梯運送乘員／貨物到月面。',
        },
        intermediate: {
          title: '動力下降',
          narrative:
            'NASA 公開概念顯示 Starship HLS 離開低月軌道後執行煞車點火，再進入最終下降。HLS 高度描述約 50 公尺（約 164 英尺）。',
          physics: '沒有大氣就沒有氣動減速。所有 Δv 來自推進。引擎羽流與月面交互會揚起塵土（表岩屑）。',
          engineering: '危險偵測與迴避、真空中可節流的 Raptor，以及高挑載具在不平地面的傾覆穩定，是主要設計驅動。',
        },
        advanced: {
          title: '真空著陸力學',
          narrative:
            '公開資料強調載人使用前須先完成無人月面著陸演示。精確節流曲線與著陸場認證數據在開放來源中仍有限。',
          physics:
            '重力轉彎／仰頭剖面在降低重力損失與維持感測視線間取捨。真空羽流大幅擴散，影響坑蝕與感測器致盲。',
          engineering:
            '挑戰：羽流噴射物損壞載具或附近硬體、長滑行後的低溫管理，以及低高度中止入軌選項（細節未完全公開）。',
        },
      },
    },
  },
  {
    id: 'surface',
    start: 0.62,
    end: 0.72,
    durationLabel: { en: 'Surface stay (high-level)', 'zh-Hant': '月面停留（高階概述）' },
    copy: {
      en: {
        beginner: {
          title: 'Surface operations',
          narrative:
            'On the Moon, explorers can collect samples and run experiments. Starship HLS concepts include an elevator because the vehicle is as tall as a mid-rise building (~50 m).',
          physics:
            'Lower gravity makes walking and lifting different. Heat and cold swing sharply between sunlight and shadow.',
          engineering:
            'Power, life support (for crew versions), dust protection, and reliable elevators/airlocks are essential. Many details depend on the specific mission.',
        },
        intermediate: {
          title: 'Lunar surface ops (factual scope)',
          narrative:
            'NASA describes Artemis surface work: samples, science, and environmental observation. Public Starship HLS art shows elevator egress. Duration targets have evolved with program plans—treat stay length as mission-specific.',
          physics:
            'Regolith is abrasive and electrostatically sticky. Thermal cycling stresses materials and seals.',
          engineering:
            'Challenges: dust intrusion into mechanisms, communication geometry near polar terrain, and keeping engines/propellant ready for ascent.',
        },
        advanced: {
          title: 'Surface systems constraints',
          narrative:
            'This phase is intentionally high-level: open sources do not provide a full operational checklist for Starship surface systems. Unknowns are labeled rather than invented.',
          physics:
            'Polar lighting can leave permanently shadowed regions extremely cold while nearby ridges are sunlit—affecting power and thermal design.',
          engineering:
            'Open questions publicly include final suit interfaces, cargo offload mass budgets, and long-duration cryogenic storage on the surface for extended stays.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '月面作業',
          narrative:
            '在月球上，探索者可採集樣本與進行實驗。Starship HLS 概念包含電梯，因為載具高度約如中層建築（約 50 公尺）。',
          physics: '低重力使行走與搬運感受不同。日照與陰影之間冷熱變化劇烈。',
          engineering: '電力、生命維持（乘員版）、防塵與可靠的電梯／氣閘很重要。細節取決於具體任務。',
        },
        intermediate: {
          title: '月面作業（事實範圍）',
          narrative:
            'NASA 描述 Artemis 月面工作：樣本、科學與環境觀測。公開 Starship HLS 圖像顯示電梯離艦。停留時長隨計畫演進——應視為任務相關。',
          physics: '表岩屑具磨蝕性且易因靜電附著。熱循環會壓力材料與密封件。',
          engineering: '挑戰：灰塵侵入機構、近極地地形的通訊幾何，以及為上升保持引擎／推進劑就緒。',
        },
        advanced: {
          title: '月面系統限制',
          narrative:
            '本階段刻意保持高階：開放來源並未提供 Starship 月面系統完整作業清單。未知處會標明，不虛構。',
          physics: '極地光照可使永久陰影區極冷，而鄰近山脊仍日照——影響電力與熱控設計。',
          engineering:
            '公開的未決問題包含最終航太服介面、貨物卸載質量預算，以及延長停留時月面長期低溫貯存。',
        },
      },
    },
  },
  {
    id: 'return',
    start: 0.72,
    end: 0.86,
    durationLabel: { en: 'Ascent & Earth return', 'zh-Hant': '上升與返回地球' },
    copy: {
      en: {
        beginner: {
          title: 'Ascent from Moon & return',
          narrative:
            'Starship launches from the Moon and heads back toward Earth. Leaving the Moon takes less fuel than leaving Earth, but the trip home still needs careful aiming.',
          physics:
            'Escape from the Moon needs less speed than from Earth because lunar gravity is weaker.',
          engineering:
            'Engines must restart after sitting on the surface. Navigation aims the craft at the right Earth atmosphere corridor.',
        },
        intermediate: {
          title: 'Lunar ascent & Earth-return transfer',
          narrative:
            'In NASA’s public Artemis III-era HLS storyboard, Starship returns crew to Orion in lunar orbit; Orion then brings crew to Earth. A pure Starship Earth-return landing is a different profile—this lesson shows a simplified Starship-to-Earth educational path and labels the distinction.',
          physics:
            'Lunar ascent Δv is lower than Earth ascent, but rendezvous (if any) and TEI (trans-Earth injection) timing are unforgiving.',
          engineering:
            'Dust-contaminated engines, uneven liftoff attitude, and long-coast reliability dominate risk. Public documents do not publish a full Starship TEI burn table.',
        },
        advanced: {
          title: 'Return trajectory design',
          narrative:
            'Accuracy note: crewed Artemis architecture separates roles (HLS vs Orion reentry). Our scrubber’s “return to Earth ground on Starship” is an educational end-to-end Starship story consistent with SpaceX’s broader reusable goals, not a claim that a specific flight has flown.',
          physics:
            'Entry interface targeting constrains allowable corridor width; errors trade as skip-out vs. excessive heating.',
          engineering:
            'Challenges: autonomous abort modes, deep-space navigation updates, and propellant margins after surface boil-off—figures largely unpublished for operational flights.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '月面上升與返回',
          narrative:
            'Starship 從月球起飛並飛回地球方向。離開月球比離開地球省燃料，但返航仍需精確瞄準。',
          physics: '月球重力較弱，因此逃逸所需速度低於地球。',
          engineering: '引擎必須在月面靜置後再啟動。導航要把飛行器對準正確的地球大氣再入走廊。',
        },
        intermediate: {
          title: '月面上升與返回地球轉移',
          narrative:
            '在 NASA 公開的 Artemis III 時期 HLS 故事板中，Starship 把乘員送回月球軌道的 Orion，再由 Orion 帶回地球。純 Starship 返回地球著陸是不同剖面——本課以簡化的 Starship 到地球教學路徑呈現，並標明差異。',
          physics: '月面上升 Δv 低於地球上升，但交會（若有）與 TEI（奔向地球點火）時機不容差錯。',
          engineering:
            '受塵污染的引擎、不平整起飛姿態，以及長滑行可靠度是主要風險。公開文件並未公布完整 Starship TEI 點火表。',
        },
        advanced: {
          title: '返回軌跡設計',
          narrative:
            '準確性說明：載人 Artemis 架構分工（HLS 與 Orion 再入）。本時間軸「Starship 回到地球地面」是符合 SpaceX 更廣泛可重複使用目標的教學故事，並非宣稱某次特定飛行已完成。',
          physics: '再入介面瞄準限制可允許走廊寬度；誤差會在跳飛與過熱之間取捨。',
          engineering:
            '挑戰：自主中止模式、深空導航更新，以及月面汽化後的推進劑裕度——作業飛行數據大多未公開。',
        },
      },
    },
  },
  {
    id: 'reentry',
    start: 0.86,
    end: 1,
    durationLabel: { en: 'Reentry & landing', 'zh-Hant': '再入與著陸' },
    copy: {
      en: {
        beginner: {
          title: 'Earth reentry & landing',
          narrative:
            'Starship hits Earth’s atmosphere at very high speed, uses its body to slow down, then lands with engines. Heat protection and precise control are critical.',
          physics:
            'The air ahead is squeezed into a glowing shock layer — that compression (not everyday rubbing friction) creates most of the heat. Speed turns into heat and light as the ship descends through the atmospheric layers.',
          engineering:
            'Heat-shield tiles, flaps for steering, and a final landing burn must all work. SpaceX’s public goal is rapid reuse after catch or landing.',
        },
        intermediate: {
          title: 'Atmospheric entry & terminal landing',
          narrative:
            'Flight tests have practiced high-energy atmospheric return and landing burns for Starship. A lunar-return entry is typically more energetic than many LEO returns—exact operational moon-return numbers are not published here as fact.',
          physics:
            'A bow shock converts kinetic energy to enthalpy. Teaching correlations give stagnation convective flux roughly ∝ √(ρ/R_n)·v³. Dynamic pressure q=½ρv² also loads structure. See the Atmosphere panel for layer-by-layer detail.',
          engineering:
            'Tile integrity, plasma communications blackout, flap actuator authority, and engine relight for landing are concurrent challenges.',
        },
        advanced: {
          title: 'Hyperbolic-entry class challenges',
          narrative:
            'Lunar-return Earth entry is ~11 km/s class at interface vs LEO ~7.5–8 km/s (Apollo/textbook public orders). We do not invent Starship peak heat-rate q̇ or bank schedules. Where public data is missing, the lesson states uncertainty and focuses on mechanisms (shock heating, corridor, TPS).',
          physics:
            'Corridor on flight-path angle γ: too shallow → skip-out; too steep → peak q̇, q=½ρv², and g exceedance. Stagnation convective flux teaching scale ∝ √(ρ/R_n)·V³ (Sutton–Graves class); at high V∞ shock-layer radiation adds. Kn falls from free-molecular at interface toward continuum lower down. Heat is post-shock enthalpy, not rubbing friction.',
          engineering:
            'Challenges: TPS gap fillers and tile-loss tolerance (public windward-tile approach), RF blackout (ω_p vs link frequency), flap authority, engine relight, and human-rating if crew aboard — requirements evolve with NASA/SpaceX agreements. Certified lunar-return pulses unpublished.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '地球再入與著陸',
          narrative:
            'Starship 以極高速度進入地球大氣，利用身軀減速，再用引擎著陸。熱防護與精確控制至關重要。',
          physics:
            '前方空氣被擠成發光的激波層——主要是壓縮（不是日常摩擦）產生熱量。船艦穿過各氣層時，速度轉成熱與光消散。',
          engineering:
            '防熱瓦、控制襟翼與最終著陸點火都必須成功。SpaceX 公開目標是著陸或捕捉後快速重複使用。',
        },
        intermediate: {
          title: '大氣再入與終端著陸',
          narrative:
            '飛行測試已演練 Starship 高能量大氣返回與著陸點火。月球返回再入通常比許多近地軌道返回更猛烈——此處不把未公開的作業數據當成事實。',
          physics:
            '弓形激波把動能轉為焓。教學關聯式給出滯止對流熱流大致 ∝ √(ρ/R_n)·v³。動壓 q=½ρv² 也加載結構。氣層細節見「大氣」面板。',
          engineering: '瓦片完整度、電漿通訊黑障、襟翼作動能力，以及著陸引擎再點火是同時存在的挑戰。',
        },
        advanced: {
          title: '高能量再入級挑戰',
          narrative:
            '月球返回地球再入介面約 11 km/s 量級，近地約 7.5–8 km/s（阿波羅／教科書公開量級）。不虛構 Starship 峰值熱流 q̇ 或滾轉程序。公開數據不足時標明不確定性，聚焦機制（激波加熱、走廊、熱防護）。',
          physics:
            '飛行路徑角 γ 走廊：太淺→跳飛；太陡→峰值 q̇、q=½ρv² 與 g 超限。滯止對流教學標度 ∝ √(ρ/R_n)·V³（Sutton–Graves 類）；高 V∞ 時激波層輻射疊加。Kn 從介面自由分子降至下層連續流。熱來自激波後焓，非摩擦。',
          engineering:
            '挑戰：熱防護縫隙填充與掉瓦容錯（公開迎風瓦方案）、射頻黑障（ω_p 相對鏈路頻率）、襟翼能力、引擎再點火，以及乘員載人認證——隨 NASA／SpaceX 協議演進。認證級月球返回熱脈衝未公開。',
        },
      },
    },
  },
]

export function phaseAtProgress(progress: number): MissionPhase {
  const p = Math.min(1, Math.max(0, progress))
  for (const phase of phases) {
    if (p >= phase.start && p < phase.end) return phase
  }
  return phases[phases.length - 1]
}

export function phaseIndexAtProgress(progress: number): number {
  const phase = phaseAtProgress(progress)
  return phases.findIndex((p) => p.id === phase.id)
}
