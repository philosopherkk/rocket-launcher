import type { Difficulty, Locale, PhaseId } from './phases'
import type { DestinationId } from './destinations'

export type AtmosphereLayer = {
  id: string
  name: Record<Locale, string>
  /** Approximate geometric altitude band (Earth-standard teaching values) */
  altitudeKm: Record<Locale, string>
  /** What happens to a rocket / entry vehicle here */
  role: Record<Locale, Record<Difficulty, string>>
}

/** NOAA / textbook-class Earth layer bands (approximate; boundaries vary with latitude & solar activity). */
export const earthLayers: AtmosphereLayer[] = [
  {
    id: 'troposphere',
    name: { en: 'Troposphere', 'zh-Hant': '對流層' },
    altitudeKm: { en: '~0–12 km (pole→tropics ~8–18 km)', 'zh-Hant': '約 0–12 公里（極地→熱帶約 8–18 公里）' },
    role: {
      en: {
        beginner: 'Where weather lives. Air is densest here — strongest drag and wind loads on ascent and final landing.',
        intermediate: 'Contains ~75–80% of atmospheric mass. Landing burns and terminal aerodynamics occur here; gusts and shear matter.',
        advanced:
          'Hydrostatic balance dp/dz=−ρg with ideal-gas p=ρRT/M ⇒ ρ(z)≈ρ₀e^(−z/H), H=RT/(Mg) ~7–8 km near Earth surface (NOAA / textbook class; H varies with T). Final approach is continuum-flow (Kn≪1); dynamic pressure q=½ρv² and aero moments dominate guidance. Exact Starship load cases unpublished.',
      },
      'zh-Hant': {
        beginner: '天氣發生的地方。此處空氣最濃——上升與最終著陸時阻力和風載最大。',
        intermediate: '約含大氣質量的 75–80%。著陸點火與終端氣動在此發生；陣風與風切重要。',
        advanced:
          '靜水壓平衡 dp/dz=−ρg，理想氣體 p=ρRT/M ⇒ ρ(z)≈ρ₀e^(−z/H)，近地表 H=RT/(Mg) 約 7–8 公里（NOAA／教科書級；隨 T 變）。最終進場 Kn≪1 連續流；動壓 q=½ρv² 與氣動力矩主導導引。Starship 精確載荷例未公開。',
      },
    },
  },
  {
    id: 'stratosphere',
    name: { en: 'Stratosphere', 'zh-Hant': '平流層' },
    altitudeKm: { en: '~12–50 km', 'zh-Hant': '約 12–50 公里' },
    role: {
      en: {
        beginner: 'Air thins. Ozone absorbs UV. Still enough air for meaningful aerodynamic forces at high speed.',
        intermediate:
          'Temperature inversion (warms with height in upper part). Max-Q on many launchers often occurs near lower stratosphere / upper troposphere depending on trajectory (q=½ρv² peak).',
        advanced:
          'Continuum aero still valid. Ozone heating drives the thermal inversion. Pitch/yaw stability, buffet, and aeroelastic margins are certified while ρ falls but v rises — the classic Max-Q trade. We do not quote unpublished Starship Max-Q values.',
      },
      'zh-Hant': {
        beginner: '空氣變稀。臭氧吸收紫外線。高速時仍有足夠空氣產生明顯氣動力。',
        intermediate:
          '存在逆溫（上部隨高度升溫）。許多運載火箭的 Max-Q（q=½ρv² 峰值）常出現在對流層頂／平流層下部，視軌跡而定。',
        advanced:
          '仍屬連續流氣動。臭氧加熱驅動熱逆溫。ρ 下降但 v 上升時需認證俯仰／偏航穩定、抖振與氣彈裕度——典型 Max-Q 取捨。此處不引用未公開的 Starship Max-Q 數值。',
      },
    },
  },
  {
    id: 'mesosphere',
    name: { en: 'Mesosphere', 'zh-Hant': '中氣層' },
    altitudeKm: { en: '~50–85 km', 'zh-Hant': '約 50–85 公里' },
    role: {
      en: {
        beginner: 'Very thin air. Meteors often burn here. Rockets are almost in space.',
        intermediate: 'Coldest region of the neutral atmosphere. Free-molecular effects begin to appear at the top; aero control authority fades.',
        advanced:
          'Knudsen number Kn=λ/L rises toward O(0.1–1); continuum CFD breaks down into transitional / free-molecular flow. Steep entry paths can already see significant shock-layer heating. Meteor ablation is a natural analog, not a Starship heat-rate number.',
      },
      'zh-Hant': {
        beginner: '空氣非常稀薄。流星常在此燃燒。火箭幾乎已在太空。',
        intermediate: '中性大氣最冷區。頂部開始出現自由分子效應；氣動控制能力減弱。',
        advanced:
          '克努森數 Kn=λ/L 升向 O(0.1–1)；連續流 CFD 過渡至自由分子流。陡峭再入路徑上可能已有明顯激波層加熱。流星燒蝕是自然類比，非 Starship 熱流數值。',
      },
    },
  },
  {
    id: 'thermosphere',
    name: { en: 'Thermosphere', 'zh-Hant': '熱層' },
    altitudeKm: { en: '~85–600 km (varies with solar activity)', 'zh-Hant': '約 85–600 公里（隨太陽活動變化）' },
    role: {
      en: {
        beginner: 'Extremely thin, but atoms move very fast when heated by the Sun. The ISS orbits in this region.',
        intermediate:
          'Kinetic temperatures are high, yet heat transfer to a craft is small because density is tiny. Residual drag still decays LEO orbits. Teaching “entry interface” is often ~100–120 km.',
        advanced:
          'Solar EUV/X-ray flux drives density variability (space weather; F10.7 proxy class). Many entry analyses cite interface ~122 km (400 kft class) still in the thermosphere — stagnation heating ramps as ρ·v³-class terms grow. ISS ~400 km is deep thermosphere with measurable drag.',
      },
      'zh-Hant': {
        beginner: '極度稀薄，但被太陽加熱時原子運動極快。國際太空站在此區域運行。',
        intermediate:
          '動能溫度高，但因密度極低，傳給載具的熱量仍小。殘餘阻力仍使近地軌道衰減。教學用「再入介面」常約 100–120 公里。',
        advanced:
          '太陽極紫外／X 射線通量驅動密度變化（太空天氣；F10.7 類代理）。許多再入分析引用介面約 122 公里（400 kft 量級）——仍屬熱層——滯止加熱隨 ρ·v³ 類項上升。ISS 約 400 公里深處仍有可測阻力。',
      },
    },
  },
  {
    id: 'exosphere',
    name: { en: 'Exosphere', 'zh-Hant': '外逸層' },
    altitudeKm: { en: '~600+ km → blends into space', 'zh-Hant': '約 600+ 公里 → 逐漸融入太空' },
    role: {
      en: {
        beginner: 'Atmosphere fades into empty space. Almost no air left to push on the rocket.',
        intermediate: 'Particles can travel on ballistic trajectories with rare collisions. Negligible continuum aero.',
        advanced:
          'Collisionless regime; mean free path ≫ vehicle size. Relevant for high-LEO / elliptical-perigee drag models and exospheric escape, not for Max-Q or TPS peak heating.',
      },
      'zh-Hant': {
        beginner: '大氣逐漸消失於太空。幾乎沒有空氣再推動火箭。',
        intermediate: '粒子可沿彈道飛行、碰撞罕見。連續流氣動可忽略。',
        advanced:
          '無碰撞體制；平均自由程 ≫ 載具尺度。與高近地／橢圓近地點阻力及外逸有關，與 Max-Q 或熱防護峰值加熱無關。',
      },
    },
  },
]

export type HeatingTopic = {
  id: string
  title: Record<Locale, string>
  body: Record<Locale, Record<Difficulty, string>>
}

/**
 * Precise teaching points: entry heat is mainly shock/compression enthalpy,
 * not everyday “rubbing friction.” Cite mechanisms, not Starship-secret numbers.
 */
export const heatingTopics: HeatingTopic[] = [
  {
    id: 'not-friction',
    title: {
      en: 'Heat cause: compression & shock — not “rubbing friction”',
      'zh-Hant': '加熱主因：壓縮與激波——不是日常「摩擦生熱」',
    },
    body: {
      en: {
        beginner:
          'At orbital speeds the air cannot get out of the way. It piles up and gets squeezed so hard it becomes extremely hot plasma in front of the vehicle. That hot gas heats the ship — not like rubbing your hands together.',
        intermediate:
          'A bow shock forms ahead of a blunt body. Across the shock, kinetic energy converts to thermal enthalpy. The vehicle is heated by convection (and at very high speed, radiation) from this shock layer — surface skin friction is a minor heat source by comparison.',
        advanced:
          'Rankine–Hugoniot jump conditions set post-shock T and p for a given freestream Mach. Stagnation enthalpy h₀≈h∞+V∞²/2 (≈V∞²/2 when cold freestream enthalpy is small). For LEO return V∞~7.5–8 km/s class; lunar-return Earth entry is ~11 km/s class (Apollo public order). Wall heat flux is dominated by the post-shock thermal boundary layer, not everyday µ(∂u/∂y) “rubbing.” We do not invent Starship peak heat rates.',
      },
      'zh-Hant': {
        beginner:
          '以軌道速度飛行時，空氣來不及讓開，在載具前方堆積並被強烈壓縮，變成極熱的電漿。是這團熱氣體加熱船體——不是像雙手摩擦那樣。',
        intermediate:
          '鈍頭體前方形成弓形激波。穿過激波時動能轉為熱焓。載具主要被激波層的對流（極高速時還有輻射）加熱——表面黏性摩擦相對是次要熱源。',
        advanced:
          'Rankine–Hugoniot 條件依自由流馬赫數決定激波後 T、p。滯止焓 h₀≈h∞+V∞²/2（冷自由流時≈V∞²/2）。近地返回 V∞ 約 7.5–8 km/s 量級；月球返回地球再入約 11 km/s 量級（阿波羅公開量級）。壁面熱流由激波後熱邊界層主導，非日常 µ(∂u/∂y)「摩擦」。不虛構 Starship 峰值熱流。',
      },
    },
  },
  {
    id: 'dynamic-pressure',
    title: {
      en: 'Dynamic pressure & Max-Q (ascent)',
      'zh-Hant': '動壓與 Max-Q（上升）',
    },
    body: {
      en: {
        beginner: 'As the rocket goes faster, air pushes harder — until the air gets so thin that the push falls again. The peak push is called Max-Q.',
        intermediate: 'Dynamic pressure q=½ρv². Drag D=q·C_d·A. Structural loads and bending moments often peak near Max-Q; engines may throttle to keep q within limits.',
        advanced:
          'Trajectory shaping (pitch program) trades gravity losses vs aero loads. Buffet, aeroelastic margins, and engine-out capability are certified against the entire q(t) history — not a single scalar. Public Starship Max-Q throttle schedules are not treated as facts here.',
      },
      'zh-Hant': {
        beginner: '火箭越快，空氣推力越大——直到空氣稀到推力又下降。峰值稱為 Max-Q。',
        intermediate: '動壓 q=½ρv²。阻力 D=q·C_d·A。結構載荷與彎矩常在 Max-Q 附近最大；引擎可能節流以限制 q。',
        advanced:
          '俯仰程序在重力損失與氣動載荷間取捨。抖振、氣彈裕度與引擎失效能力需相對整個 q(t) 歷程認證——不是單一標量。此處不把未公開的 Starship Max-Q 節流表當事實。',
      },
    },
  },
  {
    id: 'heat-flux',
    title: {
      en: 'Heat flux scaling (order-of-magnitude)',
      'zh-Hant': '熱流標度（數量級）',
    },
    body: {
      en: {
        beginner: 'Faster entries get much hotter. Coming back from the Moon is harsher than from low Earth orbit.',
        intermediate:
          'Engineering correlations (e.g. Sutton–Graves class) give stagnation convective flux roughly ∝ √(ρ/R_n)·v³. Density, nose radius R_n, and speed dominate. Exact Starship heat-rate tables are not public facts here.',
        advanced:
          'Sutton–Graves-class q̇_s ∝ √(ρ∞/R_n)·V∞³ is a teaching correlation for laminar stagnation convective heating (order-of-magnitude). At lunar-return / hyperbolic speeds, radiative heating from N₂/O₂ dissociation–ionization products can rival or exceed convection for large radii. TPS design splits convective vs radiative budgets; peak q̇ for Starship is unpublished — we do not invent it.',
      },
      'zh-Hant': {
        beginner: '再入越快越熱。從月球回來比從近地軌道回來嚴酷得多。',
        intermediate:
          '工程關聯式（如 Sutton–Graves 類）給出滯止對流熱流大致 ∝ √(ρ/R_n)·v³。密度、鼻錐半徑 R_n 與速度占主導。此處不以未公開的 Starship 熱流表當事實。',
        advanced:
          'Sutton–Graves 類 q̇_s ∝ √(ρ∞/R_n)·V∞³ 是層流滯止對流加熱的教學關聯（數量級）。月球返回／雙曲線速度下，N₂／O₂ 解離－電離產物的輻射加熱對大半徑載具可能可比擬或超過對流。熱防護需分配對流／輻射預算；Starship 峰值 q̇ 未公開——不虛構。',
      },
    },
  },
  {
    id: 'entry-corridor',
    title: {
      en: 'Entry corridor (skip-out vs overload)',
      'zh-Hant': '再入走廊（跳飛 vs 過載）',
    },
    body: {
      en: {
        beginner: 'You must hit the atmosphere at the right angle — too shallow and you bounce; too steep and loads get dangerous.',
        intermediate:
          'Flight-path angle at entry interface is tightly bounded. Corridor width shrinks as speed rises (lunar return vs LEO). Lift and bank modulation widen the usable corridor.',
        advanced:
          'Corridor design bounds γ at interface: too shallow → skip-out / long skip; too steep → peak q̇, q, and g exceedance. Apollo lunar-return public discussions emphasize this geometric constraint. Starship-specific corridor widths are not public facts here.',
      },
      'zh-Hant': {
        beginner: '必須以正確角度進入大氣——太淺會跳飛；太陡則載荷危險。',
        intermediate: '再入介面的飛行路徑角限制很嚴。速度越高走廊越窄（月球返回相對近地）。升力與滾轉調制可加寬可用走廊。',
        advanced:
          '走廊設計限制介面 γ：太淺→跳飛／長程跳飛；太陡→峰值熱流、動壓與 g 超限。阿波羅月球返回公開討論強調此幾何約束。Starship 特定走廊寬度此處不作公開事實。',
      },
    },
  },
  {
    id: 'soi',
    title: {
      en: 'Sphere of influence (patched-conic intuition)',
      'zh-Hant': '重力影響球（拼接圓錐直覺）',
    },
    body: {
      en: {
        beginner: 'Near Earth, Earth’s gravity rules the path. Near the Moon, the Moon’s pull takes over for landing math.',
        intermediate:
          'Patched-conic teaching switches the central body at an approximate sphere of influence (SOI). Inside Earth’s SOI, two-body Earth orbits; near the Moon, lunar-centered legs. Real design uses n-body / CR3BP refinements.',
        advanced:
          'Laplace SOI radius scales roughly a(m/M)^(2/5) (planet–Sun or moon–planet). Lunar SOI is ~66,000 km class (textbook order). This app’s Moon path is a patched-conic teaching ellipse (LEO perigee → lunar-distance apogee), not a high-fidelity ephemeris.',
      },
      'zh-Hant': {
        beginner: '靠近地球時地球重力主導路徑；靠近月球時著陸計算改以月球引力為主。',
        intermediate:
          '拼接圓錐教學在近似影響球（SOI）切換中心天體。地球 SOI 內為二體地球軌道；近月為月球中心段。真實設計會用 n 體／圓型限制性三體 refinement。',
        advanced:
          'Laplace SOI 半徑大致 ∝ a(m/M)^(2/5)。月球 SOI 約 66,000 公里量級（教科書級）。本應用月球路徑為拼接圓錐教學橢圓（近地近地點→地月距離遠地點），非高保真星曆。',
      },
    },
  },
  {
    id: 'plasma',
    title: {
      en: 'Plasma sheath & communications blackout',
      'zh-Hant': '電漿鞘與通訊黑障',
    },
    body: {
      en: {
        beginner: 'The glowing air around the ship can block radio for a while — a blackout.',
        intermediate: 'Ionized shock-layer plasma reflects/absorbs RF. Blackout duration depends on frequency, antenna location, and trajectory.',
        advanced:
          'Electron density n_e in the sheath sets plasma frequency ω_p≈√(n_e e²/ε₀ m_e). Links with ω<ω_p are cut off. Mitigation: higher-frequency bands, carefully placed antennas, or trajectory shaping — vehicle-specific Starship RF details are not assumed.',
      },
      'zh-Hant': {
        beginner: '船體周圍發光的空氣可能暫時擋住無線電——稱為黑障。',
        intermediate: '電離激波層電漿會反射／吸收射頻。黑障時長取決於頻率、天線位置與軌跡。',
        advanced:
          '鞘層電子密度 n_e 決定電漿頻率 ω_p≈√(n_e e²/ε₀ m_e)。ω<ω_p 的鏈路會中斷。緩解：更高頻段、謹慎佈局天線或塑形軌跡——不假設 Starship 特定射頻細節。',
      },
    },
  },
  {
    id: 'tps',
    title: {
      en: 'Thermal protection (engineering)',
      'zh-Hant': '熱防護（工程）',
    },
    body: {
      en: {
        beginner: 'Special tiles or shields keep the metal from melting. Starship uses a heat-shield side with tiles on the hot face.',
        intermediate:
          'Reusable ceramic tiles reject heat and insulate structure. Gaps, adhesives, and tile loss tolerance are reliability drivers. Ablators sacrifice mass to carry heat away — different trade.',
        advanced:
          'Bondline temperature limits, catalytic recombination at the wall, and laminar–turbulent transition (higher heating) size the TPS. Public SpaceX materials describe a windward tile approach; certified lunar-return heat pulses and bondline margins remain unpublished — unlabeled here.',
      },
      'zh-Hant': {
        beginner: '特殊瓦片或護盾防止金屬熔化。Starship 在迎風熱面使用防熱瓦。',
        intermediate: '可重複使用陶瓷瓦拒熱並隔絕結構。縫隙、膠黏與掉瓦容錯是可靠度關鍵。燒蝕材料以消耗質量帶走熱量——另一種取捨。',
        advanced:
          '黏結線溫度限制、壁面催化重組，以及層流－湍流轉捩（更高加熱）決定熱防護尺寸。SpaceX 公開資料描述迎風瓦方案；認證級月球返回熱脈衝與黏結線裕度未公開——此處不標定。',
      },
    },
  },
]

export type BodyAtmosphere = {
  id: DestinationId
  title: Record<Locale, string>
  summary: Record<Locale, Record<Difficulty, string>>
  bullets: { label: Record<Locale, string>; value: Record<Locale, string> }[]
}

export const bodyAtmospheres: BodyAtmosphere[] = [
  {
    id: 'moon',
    title: { en: 'Moon — essentially no atmosphere', 'zh-Hant': '月球——幾乎沒有大氣' },
    summary: {
      en: {
        beginner: 'No air means no parachutes and almost no aero braking. Rockets must do the slowing and landing.',
        intermediate: 'Surface pressure is a hard vacuum (~10⁻¹² mbar class). Landing is purely propulsive; plume–regolith interaction replaces atmospheric dust concerns.',
        advanced:
          'NASA fact-sheet class: surface pressure ~3×10⁻¹⁵ bar order (essentially hard vacuum). Free-molecular / vacuum regime end-to-end. No Max-Q, no entry plasma. Patched-conic SOI intuition + propulsive EDL dominate. Plume–regolith interaction is an engineering driver; Starship HLS plume loads unpublished.',
      },
      'zh-Hant': {
        beginner: '沒有空氣就沒有降落傘，也幾乎沒有氣動減速。必須靠火箭減速與著陸。',
        intermediate: '表面壓力近乎硬真空（約 10⁻¹² mbar 量級）。著陸純推進；羽流－表岩屑作用取代大氣揚塵問題。',
        advanced:
          'NASA 事實表級：表面氣壓約 3×10⁻¹⁵ bar 量級（實質硬真空）。全程自由分子／真空。無 Max-Q、無再入電漿。拼接圓錐 SOI 直覺＋動力 EDL 主導。羽流－表岩屑是工程驅動；Starship HLS 羽流載荷未公開。',
      },
    },
    bullets: [
      {
        label: { en: 'Surface pressure', 'zh-Hant': '表面氣壓' },
        value: {
          en: '~3×10⁻¹⁵ bar (NASA fact-sheet class; hard vacuum)',
          'zh-Hant': '約 3×10⁻¹⁵ bar（NASA 事實表級；硬真空）',
        },
      },
      {
        label: { en: 'Aero braking', 'zh-Hant': '氣動減速' },
        value: { en: 'Negligible', 'zh-Hant': '可忽略' },
      },
      {
        label: { en: 'Mean radius', 'zh-Hant': '平均半徑' },
        value: { en: '1,737.4 km', 'zh-Hant': '1,737.4 公里' },
      },
    ],
  },
  {
    id: 'mars',
    title: { en: 'Mars — thin CO₂ atmosphere', 'zh-Hant': '火星——稀薄二氧化碳大氣' },
    summary: {
      en: {
        beginner: 'Mars has air, but much thinner than Earth’s. It helps a little to slow down, but heavy ships still need big rockets and heat shields.',
        intermediate:
          'Surface pressure ~610 Pa (~0.6% of Earth sea level; NASA fact sheet). Entry heating still occurs via shocks, but parachutes alone cannot land Starship-class mass — propulsion/EDL trades dominate.',
        advanced:
          'Scale height ~11 km class and low ρ shrink the continuum deceleration corridor. Ballistic coefficient β=m/(C_d A) is punishing for large vehicles; lofted/lifting entries and propulsive terminal descent are architecture drivers (NASA Mars transportation studies). Starship Mars heat rates unpublished.',
      },
      'zh-Hant': {
        beginner: '火星有空氣，但比地球稀薄得多。能稍微減速，但重型船艦仍需大推力火箭與熱盾。',
        intermediate:
          '表面氣壓約 610 Pa（約地球海平面 0.6%；NASA 事實表）。激波加熱仍會發生，但僅靠降落傘無法著陸 Starship 級質量——推進／EDL 取捨占主導。',
        advanced:
          '標高約 11 公里量級與低 ρ 壓縮連續流減速走廊。大載具 β=m/(C_d A) 嚴苛；升力再入與動力終端下降是架構驅動（NASA 火星運輸研究）。Starship 火星熱流未公開。',
      },
    },
    bullets: [
      {
        label: { en: 'Surface pressure', 'zh-Hant': '表面氣壓' },
        value: { en: '~610 Pa (~0.6% Earth SL)', 'zh-Hant': '約 610 Pa（約地球海平面 0.6%）' },
      },
      {
        label: { en: 'Main gas', 'zh-Hant': '主要氣體' },
        value: { en: 'CO₂ (~95%)', 'zh-Hant': 'CO₂（約 95%）' },
      },
      {
        label: { en: 'Mean radius / a', 'zh-Hant': '平均半徑／半長軸' },
        value: { en: '3,389.5 km · 1.524 AU', 'zh-Hant': '3,389.5 公里 · 1.524 AU' },
      },
    ],
  },
  {
    id: 'venus',
    title: { en: 'Venus — extreme dense atmosphere', 'zh-Hant': '金星——極端濃密大氣' },
    summary: {
      en: {
        beginner: 'Venus has a crushing, scorching atmosphere. Entry heating and survival on the surface are both extremely hard.',
        intermediate: 'Surface pressure ~92 bar, ~464°C (NASA fact-sheet class). Entry probes see intense aeroheating; landers need pressure vessels and short lifetimes.',
        advanced:
          'High ρ enables strong aero deceleration but peak heat and structural pressure loads are severe. Comparison-only orbital-mechanics case — not a published Starship crew profile.',
      },
      'zh-Hant': {
        beginner: '金星大氣既高壓又極熱。再入加熱與表面存活都極困難。',
        intermediate: '表面約 92 巴、約 464°C（NASA 事實表級）。探測器再入加熱劇烈；著陸器需耐壓殼且壽命短。',
        advanced: '高 ρ 可強烈氣動減速，但峰值熱與結構壓力載荷嚴峻。僅作軌道力學比較——非已公布的 Starship 載人剖面。',
      },
    },
    bullets: [
      {
        label: { en: 'Surface pressure', 'zh-Hant': '表面氣壓' },
        value: { en: '~92 bar (NASA fact-sheet class)', 'zh-Hant': '約 92 巴（NASA 事實表級）' },
      },
      {
        label: { en: 'Main gas', 'zh-Hant': '主要氣體' },
        value: { en: 'CO₂ with thick H₂SO₄ clouds', 'zh-Hant': 'CO₂ 與濃厚硫酸雲' },
      },
    ],
  },
  {
    id: 'mercury',
    title: { en: 'Mercury — negligible atmosphere', 'zh-Hant': '水星——可忽略大氣' },
    summary: {
      en: {
        beginner: 'Almost no air — like a rocky vacuum world. Landings would be rocket-braked.',
        intermediate: 'Exosphere only (atoms temporarily aloft). No useful aero braking.',
        advanced: 'Surface-bounded exosphere; Kn ≫ 1 always. Comparison case for energy, not EDL atmosphere design.',
      },
      'zh-Hant': {
        beginner: '幾乎沒有空氣——像岩石真空世界。著陸需火箭煞車。',
        intermediate: '僅有外逸層（短暫揚起的原子）。無實用氣動減速。',
        advanced: '受表面束縛的外逸層；Kn ≫ 1。用於能量比較，而非 EDL 大氣設計。',
      },
    },
    bullets: [
      {
        label: { en: 'Atmosphere type', 'zh-Hant': '大氣類型' },
        value: { en: 'Exosphere only', 'zh-Hant': '僅外逸層' },
      },
    ],
  },
  {
    id: 'jupiter',
    title: { en: 'Jupiter — giant H/He atmosphere (no solid ground)', 'zh-Hant': '木星——巨大氫氦大氣（無固態地面）' },
    summary: {
      en: {
        beginner: 'Jupiter is all atmosphere going down — no hard surface like Earth. Probes face extreme heat and pressure.',
        intermediate: 'Entry probes (e.g. Galileo) saw peak heating and deceleration in a H/He envelope. “Landing” is not a surface touchdown.',
        advanced: 'Scale heights and composition change deep heating chemistry. Comparison-only in this app; not a Starship profile.',
      },
      'zh-Hant': {
        beginner: '木星往下全是大氣——沒有像地球的硬表面。探測器面對極端熱與壓力。',
        intermediate: '進入探測器（如 Galileo）在氫氦包層中經歷峰值加熱與減速。「著陸」並非觸地。',
        advanced: '標高與成分改變深層加熱化學。本應用僅作比較；非 Starship 剖面。',
      },
    },
    bullets: [
      {
        label: { en: 'Main gases', 'zh-Hant': '主要氣體' },
        value: { en: 'H₂ / He', 'zh-Hant': 'H₂／He' },
      },
    ],
  },
]

export function getBodyAtmosphere(id: DestinationId): BodyAtmosphere {
  return bodyAtmospheres.find((b) => b.id === id) ?? bodyAtmospheres[0]
}

/** Which atmosphere teaching mode to emphasize for the current phase. */
export function atmosphereContext(phaseId: PhaseId): 'ascent' | 'vacuum' | 'entry' | 'general' {
  if (phaseId === 'ascent' || phaseId === 'prelaunch') return 'ascent'
  if (phaseId === 'reentry') return 'entry'
  if (phaseId === 'staging' || phaseId === 'tli' || phaseId === 'return') return 'vacuum'
  if (phaseId === 'lunarApproach' || phaseId === 'surface') return 'general'
  return 'general'
}

export const atmosphereIntro: Record<
  'ascent' | 'vacuum' | 'entry' | 'general',
  Record<Locale, Record<Difficulty, string>>
> = {
  ascent: {
    en: {
      beginner: 'Leaving Earth, the rocket climbs through stacked layers of air. Dense air near the ground pushes hardest.',
      intermediate: 'Ascent is a race through falling density and rising speed — Max-Q is where q=½ρv² peaks.',
      advanced: 'Design loads couple the ρ(z) profile from a standard atmosphere model with the v(t) history from the pitch program.',
    },
    'zh-Hant': {
      beginner: '離開地球時，火箭穿過一層層空氣。靠近地面的濃密空氣推力最大。',
      intermediate: '上升是密度下降與速度上升的競賽——Max-Q 是 q=½ρv² 的峰值。',
      advanced: '設計載荷把標準大氣模型的 ρ(z) 與俯仰程序的 v(t) 耦合在一起。',
    },
  },
  vacuum: {
    en: {
      beginner: 'In deep space there is essentially no air — no drag, no aero heating.',
      intermediate: 'Coast phases are ballistic / propulsive only. Attitude uses thrusters or CMGs, not fins.',
      advanced: 'Free-molecular residual atmospheres at high altitude are negligible for this educational Δv story.',
    },
    'zh-Hant': {
      beginner: '深空幾乎沒有空氣——無阻力、無氣動加熱。',
      intermediate: '滑行階段僅彈道／推進。姿態靠推力器或控制力矩陀螺，而非翼面。',
      advanced: '高空殘餘自由分子大氣對本教學 Δv 故事可忽略。',
    },
  },
  entry: {
    en: {
      beginner: 'Coming home, the ship dives back through the same layers — this time so fast that the air in front glows.',
      intermediate:
        'Entry interface (~100–120 km teaching value) begins meaningful aero deceleration and heating via a shock layer. Heat is mostly compression/shock enthalpy, not rubbing friction.',
      advanced:
        'Corridor design bounds flight-path angle γ: too shallow → skip-out; too steep → peak q̇, q, and g exceedance. Lunar-return V∞ ~11 km/s class vs LEO ~7.8 km/s (public Apollo/textbook orders). Starship certified pulses unpublished.',
    },
    'zh-Hant': {
      beginner: '回家時，船艦再次穿過這些氣層——這次速度快到前方空氣發光。',
      intermediate:
        '再入介面（教學值約 100–120 公里）開始透過激波層產生明顯氣動減速與加熱。熱主要來自壓縮／激波焓，而非摩擦。',
      advanced:
        '走廊設計限制飛行路徑角 γ：太淺→跳飛；太陡→峰值熱流、動壓與 g 超限。月球返回 V∞ 約 11 km/s 量級，近地約 7.8 km/s（公開阿波羅／教科書量級）。Starship 認證熱脈衝未公開。',
    },
  },
  general: {
    en: {
      beginner: 'Each world has a different atmosphere — or almost none. That changes how you land.',
      intermediate: 'Compare surface pressure and scale height to see whether aero braking helps.',
      advanced: 'Knudsen number and ballistic coefficient decide if continuum aero, transitional, or vacuum landing applies.',
    },
    'zh-Hant': {
      beginner: '每個世界的大氣都不同——或幾乎沒有。這會改變著陸方式。',
      intermediate: '比較表面氣壓與標高，判斷氣動減速是否有幫助。',
      advanced: '克努森數與彈道係數決定適用連續流氣動、過渡區或真空著陸。',
    },
  },
}
