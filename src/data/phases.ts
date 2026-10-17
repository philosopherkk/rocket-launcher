import type { DestinationId } from './destinations'

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

/** Phases not modelled on one-way heliocentric scrubbers (return / Earth reentry). */
const HELIO_INACTIVE: PhaseId[] = ['return', 'reentry']

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
    end: 0.3,
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
    start: 0.3,
    end: 0.48,
    durationLabel: { en: 'TLI & multi-day coast', 'zh-Hant': 'TLI 與數日巡航' },
    copy: {
      en: {
        beginner: {
          title: 'Trans-lunar injection & coast',
          narrative:
            'After parking in LEO (and refilling, in public lunar architectures), Starship burns prograde to leave for the Moon, then coasts for days on a long ellipse.',
          physics:
            'The burn raises the far side of the orbit (apoapsis) out to about the Moon’s distance. Speed jumps from ~7.7 km/s in LEO to ~10.8 km/s just after TLI (teaching vis-viva).',
          engineering:
            'The burn must start in a narrow window. Propellant must be settled, and the ship needs enough refill propellant in LEO to afford the Δv.',
        },
        intermediate: {
          title: 'TLI burn & lunar transfer',
          narrative:
            'Public Artemis/HLS materials describe uncrewed Starship HLS traveling on the order of about six days toward a near-rectilinear halo orbit (NRHO) region—timelines vary. This lab shows a simpler patched-conic ellipse into low lunar orbit for teaching.',
          physics:
            'Ideal TLI Δv from ~300 km LEO is ~3.1–3.2 km/s (Apollo/textbook class; computed here from vis-viva μ⊕≈3.986×10⁵ km³/s²). Mid-course corrections fix navigation drift over the multi-day coast.',
          engineering:
            'Challenges: TLI window timing, deep-space comms delay, thermal control in sun/eclipse, cryogenic stratification after LEO refill, and mid-course Δv budget. Starship operational burn tables are unpublished.',
        },
        advanced: {
          title: 'Cislunar transfer dynamics (expert)',
          narrative:
            'This visualization uses a patched-conic teaching ellipse: circular LEO periapsis (~300 km altitude) → apoapsis at mean Earth–Moon distance ≈384,400 km (NASA/IAU fact-sheet class). Half-period ≈ π√(a³/μ⊕) ~5 days teaching. Real NASA/SpaceX HLS CONOPS often target NRHO and Orion rendezvous rather than a circular 100 km LLO — labeled idealized, not flown.\n\nTLI Δv order ~3.1–3.2 km/s from LEO matches Apollo/textbook public orders (e.g. NASA Basics of Space Flight / historical Apollo mission reports). We do not invent Starship-specific heat rates or certified burn tables. On-orbit refilling (public SpaceX/NASA HLS architecture) is assumed so the stack can afford departure Δv.',
          physics:
            'Vis-viva on the transfer: v=√[μ(2/r−1/a)]. At periapsis just after TLI, speed is ~10.8 km/s; near apoapsis geocentric speed falls to a few hundred m/s before lunar gravity dominates. Lunar SOI ~66,000 km class (textbook Laplace SOI) marks where a lunar-centered patch is the better intuition.\n\nIf the TLI burn is short, apoapsis undershoots the Moon and LOI becomes impossible without a costly mid-course. If late or mis-pointed, the arrival asymptote misses the perilune corridor and LOI Δv grows sharply or the pass becomes a flyby.',
          engineering:
            'Engineering challenges: (1) TLI window — Earth–Moon geometry and LEO node must align; missing the window costs days of wait or extra mid-course. (2) Mid-course — optical/radiometric navigation over multi-day coast; propellant for TCCMs. (3) Cryogenics — boil-off and settling after LEO tanker refill. (4) Fault management without quick ground loop. (5) Free-return vs non-free-return trades (mission-specific; Apollo 13 free-return is the classic public example). HLS crew transfer remains NASA-led with Orion in public materials.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '地月轉移點火與滑行',
          narrative:
            '在近地軌道停泊（公開月球架構中還會補加註）後，Starship 沿切線點火前往月球，再沿長橢圓滑行數日。',
          physics:
            '點火把遠地點抬到約地月距離。速度從近地軌道約 7.7 km/s 升到 TLI 後約 10.8 km/s（教學 vis-viva）。',
          engineering: '點火必須落在狹窄窗口。推進劑需沉底，且近地軌道補加註後才夠支付 Δv。',
        },
        intermediate: {
          title: 'TLI 點火與地月轉移',
          narrative:
            '公開 Artemis／HLS 資料描述無人 Starship HLS 約需六日量級飛向近直線暈軌道（NRHO）——時程隨任務而變。本實驗室以較簡的拼接圓錐橢圓進入低月軌供教學。',
          physics:
            '從約 300 km 近地軌道理想 TLI Δv 約 3.1–3.2 km/s（阿波羅／教科書量級；此處以 μ⊕≈3.986×10⁵ km³/s² 的 vis-viva 計算）。數日巡航中以中途修正消除導航漂移。',
          engineering:
            '挑戰：TLI 窗口時機、深空通訊延遲、日照／陰影熱控、近地補加註後的低溫分層，以及中途 Δv 預算。Starship 作業點火表未公開。',
        },
        advanced: {
          title: '地月空間轉移動力學（進階）',
          narrative:
            '本視覺化使用拼接圓錐教學橢圓：近地圓軌近地點（高度約 300 km）→ 遠地點約地月平均距離 384,400 km（NASA／IAU 事實表量級）。半週期 ≈ π√(a³/μ⊕)，教學約 5 日。真實 NASA／SpaceX HLS 作戰概念常以 NRHO 與 Orion 交會為目標，而非 100 km 圓形低月軌——已標示理想化，非真實飛行。\n\n從近地軌道 TLI Δv 約 3.1–3.2 km/s，與阿波羅／教科書公開數量級相符。我們不虛構 Starship 專屬熱流或認證點火表。假設軌道上補加註（公開 SpaceX／NASA HLS 架構），使飛行器負擔得起出發 Δv。',
          physics:
            '轉移上 vis-viva：v=√[μ(2/r−1/a)]。TLI 後近地點速度約 10.8 km/s；近遠地點地心速度降至數百 m/s，其後月球重力主導。月球 SOI 約 66,000 km 量級（教科書）標示改以月球為中心的區段。\n\n若 TLI 點火不足，遠地點低於月球，LOI 將不可能或需昂貴中途修正。若過晚或指向偏差，到達漸近線錯過近月點走廊，LOI Δv 急增或變成飛掠。',
          engineering:
            '工程挑戰：（1）TLI 窗口——地月幾何與近地軌道交點須對齊；錯過窗口需等待數日或額外中途修正。（2）中途修正——數日巡航的光學／無線電導航與 TCCM 推進劑。（3）低溫——近地加油後的汽化與沉底。（4）無法快速仰賴地面迴路的故障管理。（5）自由返回與非自由返回取捨（任務相關；阿波羅 13 自由返回為經典公開案例）。公開資料中 HLS 乘員轉移仍由 NASA 與 Orion 主導。',
        },
      },
    },
  },
  {
    id: 'lunarApproach',
    start: 0.48,
    end: 0.62,
    durationLabel: { en: 'Approach & LOI burn', 'zh-Hant': '接近與 LOI 點火' },
    copy: {
      en: {
        beginner: {
          title: 'Lunar approach & orbit insertion',
          narrative:
            'Near the Moon, Starship fires engines backward to slow down and enter a circular lunar orbit — not a straight dive to the surface. Wings and parachutes cannot help; there is essentially no air.',
          physics:
            'Without an atmosphere there is no aerobraking. A braking burn (LOI) drops speed into a closed lunar orbit (~100 km altitude in this teaching model).',
          engineering:
            'The burn must be the right size and timed near closest approach. Too little Δv and you fly past; too much and the orbit dips into the Moon.',
        },
        intermediate: {
          title: 'LOI into low lunar orbit',
          narrative:
            'This lab’s outbound end-state is circular low lunar orbit (LLO) at ~100 km (Apollo-class teaching altitude). Public Artemis HLS materials more often discuss NRHO staging with Orion — we label LLO as idealized for two-body teaching. LOI Δv order ~0.9 km/s class (Apollo public order-of-magnitude).',
          physics:
            'Circular LLO speed √(μ☾/r) ≈ 1.63 km/s at 100 km (μ☾≈4902.8 km³/s²). Approach is faster; LOI removes the excess. Periapsis/apoapsis both equal the LLO radius after a successful circularization.',
          engineering:
            'Challenges: LOI accuracy (timing & pointing), autonomous burn cutoff, mid-course residual errors, and having propellant left after TLI + coast (LEO refill). A late/short burn leaves a flyby or highly elliptical lunar orbit instead of circular LLO.',
        },
        advanced: {
          title: 'Lunar orbit insertion mechanics (expert)',
          narrative:
            'Outbound teaching profile ends in circular low lunar orbit (LLO), not a surface straight-line or a flyby “dot.” We use ~100 km altitude — the Apollo parking-orbit class cited in public NASA historical materials — with μ☾≈4902.8 km³/s² so circular speed is ≈1.63 km/s. LOI Δv is shown as ~0.9 km/s class (Apollo LOI public order). Idealized patched-conic: we do not simulate full CR3BP capture into NRHO.\n\nNASA’s public Artemis / HLS storyboard emphasizes NRHO rendezvous with Orion and later powered descent from lunar orbit for landing demonstrations. This scrubber’s LLO is a two-body teaching simplification so students can see a closed lunar orbit after braking. Starship-specific LOI throttle schedules and heat rates are unpublished; we do not invent them.\n\nSources class: NASA Moon fact sheet (radius, μ), NASA Artemis/HLS public CONOPS pages, Apollo-era LOI/LLO public orders, NASA Basics of Space Flight (trajectory intuition).',
          physics:
            'Patched-conic intuition: on the Earth-centered transfer, speed near apoapsis is low geocentric; relative to the Moon the approach is hyperbolic until LOI. A retrograde burn at perilune lowers energy into an ellipse or circle about the Moon. For circularization at perilune altitude h: v_circ=√(μ☾/(R☾+h)).\n\nIf LOI is short, eccentricity stays high — perilune may be safe once but apolune stretches, and the next perilune can impact terrain or require another costly burn. If LOI is late (past perilune), you raise or miss the intended perilune and may exit the SOI on a flyby. If LOI is early/long, perilune drops and lithobraking (impact) becomes the failure mode.\n\nUnits: altitudes in km above mean lunar radius 1737.4 km; speeds in km/s; Δv in km/s. Assumptions: coplanar, no mascon perturbations, impulsive LOI, circular target — all labeled teaching idealizations.',
          engineering:
            'Engineering challenges stack from earlier phases into LOI:\n(1) LEO orbital refueling — public SpaceX/NASA HLS architecture relies on tanker flights so Starship can afford Earth-departure + LOI (+ later descent) Δv; without refill, the budget fails before LOI.\n(2) Mid-course residuals — navigation error shows up as perilune miss distance; TCCMs must leave LOI feasible.\n(3) LOI accuracy — engine restart after multi-day coast, propellant settling, burn-time cutoff, and attitude control. A few seconds late or short turns “circular LLO” into ellipse or escape.\n(4) Autonomy — light-time delay limits closed-loop ground control during the burn.\n(5) What fails: short burn → flyby or elliptical lunar orbit; long burn → impact; wrong plane → costly plane-change later; wrong epoch → miss the Moon entirely. Descent to the surface (HLS landing) is a separate later burn from lunar orbit in public concepts — not this LOI step.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '月球接近與入軌',
          narrative:
            '接近月球時，Starship 向後點火減速，進入圓形月軌——不是直線衝向月面。幾乎沒有大氣，機翼與降落傘幫不上忙。',
          physics: '沒有大氣就沒有氣動減速。煞車點火（LOI）把速度降到封閉月軌（本教學模型約 100 km 高度）。',
          engineering: '點火大小與時機必須靠近最近點。Δv 太小會飛掠而過；太大則軌道會插入月球。',
        },
        intermediate: {
          title: 'LOI 進入低月軌',
          narrative:
            '本實驗室單程終態為約 100 km 圓形低月軌（LLO，阿波羅量級教學高度）。公開 Artemis HLS 資料較常討論與 Orion 的 NRHO 停泊——我們將 LLO 標為二體教學理想化。LOI Δv 約 0.9 km/s 量級（阿波羅公開數量級）。',
          physics:
            '100 km 圓形低月軌速度 √(μ☾/r) ≈ 1.63 km/s（μ☾≈4902.8 km³/s²）。接近時更快；LOI 去掉多餘速度。成功圓化後近月點／遠月點皆等於 LLO 半徑。',
          engineering:
            '挑戰：LOI 精度（時機與指向）、自主熄火、中途殘差，以及 TLI＋巡航後仍有推進劑（近地補加註）。過晚／過短點火會變成飛掠或高橢圓月軌，而非圓形 LLO。',
        },
        advanced: {
          title: '月球軌道插入力學（進階）',
          narrative:
            '單程教學剖面終態為圓形低月軌（LLO），不是直線衝月面或飛掠「一點」。我們採用約 100 km 高度——公開 NASA 歷史資料中的阿波羅停泊軌道量級——μ☾≈4902.8 km³/s²，圓軌速度 ≈1.63 km/s。LOI Δv 以約 0.9 km/s 量級呈現（阿波羅 LOI 公開數量級）。理想拼接圓錐：不模擬完整 CR3BP 捕獲進入 NRHO。\n\nNASA 公開 Artemis／HLS 故事板強調與 Orion 的 NRHO 交會，以及之後自月軌動力下降的著陸演示。本時間軸的 LLO 是二體教學簡化，讓學生看到煞車後的封閉月軌。Starship 專屬 LOI 節流與熱流未公開；我們不虛構。\n\n來源類別：NASA 月球事實表（半徑、μ）、NASA Artemis／HLS 公開作戰概念、阿波羅時期 LOI／LLO 公開數量級、NASA Basics of Space Flight（軌跡直覺）。',
          physics:
            '拼接圓錐直覺：地心轉移在遠地點地心速度低；相對月球則接近為雙曲線，直到 LOI。在近月點逆向點火降低能量，成為繞月橢圓或圓軌。在近月點高度 h 圓化：v_circ=√(μ☾/(R☾+h))。\n\n若 LOI 過短，偏心率偏高——近月點或許安全一次，但遠月點拉長，下一次近月點可能撞地或需再耗費推進劑。若 LOI 過晚（已過近月點），會抬高或錯過預定近月點，甚至飛出 SOI。若過早／過長，近月點下降，撞擊成為失效模式。\n\n單位：高度為距月球平均半徑 1737.4 km 之上的 km；速度與 Δv 為 km/s。假設：共面、無質量瘤擾動、脈衝 LOI、圓形目標——皆標示為教學理想化。',
          engineering:
            '工程挑戰由前段累積到 LOI：\n（1）近地軌道補加註——公開 SpaceX／NASA HLS 架構仰賴加油機，使 Starship 負擔得起地球出發＋LOI（＋之後下降）Δv；無補加註則預算在 LOI 前就失敗。\n（2）中途殘差——導航誤差表現為近月點偏差；TCCM 須使 LOI 仍可行。\n（3）LOI 精度——數日巡航後引擎再啟動、推進劑沉底、點火時長切斷與姿態控制。遲到或過短數秒，就會把「圓形 LLO」變成橢圓或逃逸。\n（4）自主性——光速延遲限制點火期間地面閉環。\n（5）失效模式：過短→飛掠或橢圓月軌；過長→撞擊；錯誤軌道面→之後昂貴變軌；錯誤曆元→完全錯過月球。月面下降（HLS 著陸）在公開概念中是自月軌的另一次點火——不是本 LOI 步驟。',
        },
      },
    },
  },
  {
    id: 'surface',
    start: 0.62,
    end: 0.76,
    durationLabel: { en: 'Lunar orbit (post-LOI)', 'zh-Hant': '月軌（LOI 後）' },
    copy: {
      en: {
        beginner: {
          title: 'In lunar orbit',
          narrative:
            'After LOI, Starship stays in a circular path around the Moon. You can watch it complete orbits — this is the end of the outbound trip in this lesson (landing would be a later burn).',
          physics:
            'In a circular lunar orbit, speed stays near 1.6 km/s at ~100 km altitude. The Moon’s weaker gravity means orbital speed is much lower than LEO.',
          engineering:
            'The ship must keep communications, power, and propellant ready for the next burn (descent or return). Public HLS concepts often park in different orbits (e.g. NRHO) before landing.',
        },
        intermediate: {
          title: 'Low lunar orbit operations',
          narrative:
            'Outbound teaching end-state: circular LLO ~100 km, v≈1.63 km/s, periapsis=apoapsis. Scrubber shows multiple revolutions so insertion is visible. NASA public HLS materials emphasize NRHO staging — LLO here is idealized two-body teaching.',
          physics:
            'Period of circular LLO is 2π√(r³/μ☾) ~2 hours class at 100 km. Mascons (mass concentrations) perturb real low lunar orbits — not modeled here.',
          engineering:
            'Challenges: station-keeping intuition (even if not animated), thermal cycling in lunar day/night for long stays, and preserving cryogenic propellant for descent or TEI. Surface landing is a separate powered-descent phase in public HLS concepts.',
        },
        advanced: {
          title: 'Post-LOI lunar orbit (expert)',
          narrative:
            'The craft remains on the drawn LLO ring after LOI — the outbound timeline’s closed end-state. Altitude ~100 km, circular, μ☾-based speed ≈1.63 km/s. This is intentionally not a surface touchdown and not a flyby.\n\nPublic Artemis architecture: Starship HLS may operate from NRHO with Orion; uncrewed landing demos include descent from lunar orbit. Our LLO is the simplest orbit students can see close around the Moon after a braking burn. Assumptions (coplanar circular LLO, no mascons, impulsive LOI) are labeled in the HUD.\n\nReturn on this scrubber (next phases) is an educational Earth-return arc after LLO, distinct from the Orion-centric crewed return in NASA’s public Artemis III-era storyboard.',
          physics:
            'Closed orbit condition after LOI: specific energy ε=v²/2−μ☾/r < 0 and e≈0 when periapsis≈apoapsis≈R☾+100 km. Watching several revolutions confirms capture. If energy remained positive, the path would be a hyperbola (flyby) — the failure mode of a missed LOI.\n\nCompare LEO (~7.7 km/s at 300 km) vs LLO (~1.63 km/s at 100 km): the factor is roughly √(μ☾ r_LEO / μ⊕ r_LLO), illustrating why lunar orbital speeds feel “slow” after cislunar coast.',
          engineering:
            'After capture: maintain attitude for thermal/comms, manage residuals so the orbit does not decay into terrain, and keep engines qualified for the next burn. For crewed HLS, NASA materials describe elevator egress only after landing — not while in LLO. Propellant margins after LOI determine whether descent or TEI is still affordable; LEO refill upstream is the public architectural answer to that budget.',
        },
      },
      'zh-Hant': {
        beginner: {
          title: '在月軌上',
          narrative:
            'LOI 之後，Starship 留在繞月圓軌。你可以看它繞行數圈——這是本課單程的終點（著陸會是之後另一次點火）。',
          physics: '圓形月軌在約 100 km 高度速度約 1.6 km/s。月球重力較弱，軌道速度遠低於近地軌道。',
          engineering:
            '載具須維持通訊、電力與推進劑，為下一次點火（下降或返回）就緒。公開 HLS 概念著陸前常停在不同軌道（如 NRHO）。',
        },
        intermediate: {
          title: '低月軌作業',
          narrative:
            '單程教學終態：約 100 km 圓形 LLO，v≈1.63 km/s，近=遠。時間軸顯示多圈以便看見入軌。NASA 公開 HLS 強調 NRHO 停泊——此處 LLO 為理想二體教學。',
          physics: '100 km 圓形 LLO 週期 2π√(r³/μ☾) 約 2 小時量級。質量瘤會擾動真實低月軌——此處未建模。',
          engineering:
            '挑戰：軌道維持直覺（即使未動畫）、長停留時月晝／月夜熱循環，以及為下降或 TEI 保存低溫推進劑。月面著陸在公開 HLS 概念中是另一次動力下降階段。',
        },
        advanced: {
          title: 'LOI 後月軌（進階）',
          narrative:
            'LOI 之後飛行器留在繪出的 LLO 環上——單程時間軸的封閉終態。高度約 100 km、圓形、依 μ☾ 的速度 ≈1.63 km/s。刻意不是月面著陸，也不是飛掠。\n\n公開 Artemis 架構：Starship HLS 可能自 NRHO 與 Orion 作業；無人著陸演示包含自月軌下降。我們的 LLO 是學生在煞車後能在月球近旁看見的最簡單軌道。假設（共面圓形 LLO、無質量瘤、脈衝 LOI）已在 HUD 標示。\n\n本時間軸其後的返回是離開 LLO 後的教學返地弧，有別於 NASA 公開 Artemis III 時期以 Orion 為中心的載人返回故事板。',
          physics:
            'LOI 後封閉軌道條件：比能 ε=v²/2−μ☾/r < 0，且當近≈遠≈R☾+100 km 時 e≈0。繞行數圈可確認捕獲。若能量仍為正，路徑會是雙曲線（飛掠）——即 LOI 失敗模式。\n\n比較近地軌道（300 km 約 7.7 km/s）與 LLO（100 km 約 1.63 km/s）：因子大致 √(μ☾ r_LEO / μ⊕ r_LLO)，說明地月巡航後月軌速度為何顯得「慢」。',
          engineering:
            '捕獲後：維持熱控／通訊姿態、管理殘差以免軌道衰減撞地，並保持引擎具備下次點火資格。載人 HLS 的公開資料描述電梯僅在著陸後使用——不是在 LLO。LOI 後的推進劑裕度決定下降或 TEI 是否仍負擔得起；上游近地補加註是公開架構對該預算的答案。',
        },
      },
    },
  },
  {
    id: 'return',
    start: 0.76,
    end: 0.88,
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
    start: 0.88,
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

export function isPhaseApplicable(destinationId: DestinationId, phaseId: PhaseId): boolean {
  if (destinationId === 'moon') return true
  return !HELIO_INACTIVE.includes(phaseId)
}

export function phaseAtProgress(progress: number, destinationId: DestinationId = 'moon'): MissionPhase {
  const p = Math.min(1, Math.max(0, progress))
  const lastActive =
    [...phases].reverse().find((phase) => isPhaseApplicable(destinationId, phase.id)) ??
    phases[phases.length - 1]

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i]
    // Earlier bands stay half-open. The last active phase, and the phase that
    // closes the scrubber, include their end so progress 1 stays on the last
    // active phase instead of falling through.
    const includeEnd = phase.id === lastActive.id || i === phases.length - 1
    if (p >= phase.start && (includeEnd ? p <= phase.end : p < phase.end)) {
      return isPhaseApplicable(destinationId, phase.id) ? phase : lastActive
    }
  }

  return lastActive
}

export function phaseIndexAtProgress(progress: number, destinationId: DestinationId = 'moon'): number {
  const phase = phaseAtProgress(progress, destinationId)
  return phases.findIndex((p) => p.id === phase.id)
}
