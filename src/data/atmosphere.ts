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
        advanced: 'Hydrostatic scale height H≈RT/(Mg) sets exponential ρ(z). Final approach is continuum-flow; q and aero moments dominate guidance.',
      },
      'zh-Hant': {
        beginner: '天氣發生的地方。此處空氣最濃——上升與最終著陸時阻力和風載最大。',
        intermediate: '約含大氣質量的 75–80%。著陸點火與終端氣動在此發生；陣風與風切重要。',
        advanced: '靜水壓標高 H≈RT/(Mg) 決定 ρ(z) 近似指數衰減。最終進場屬連續流；動壓 q 與氣動力矩主導導引。',
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
        intermediate: 'Temperature inversion (warms with height in upper part). Max-Q on many launchers often occurs near lower stratosphere / upper troposphere depending on trajectory.',
        advanced: 'Continuum aero still valid. Pitch/yaw stability and buffet margins are set while ρ is falling but v is rising — classic Max-Q trade.',
      },
      'zh-Hant': {
        beginner: '空氣變稀。臭氧吸收紫外線。高速時仍有足夠空氣產生明顯氣動力。',
        intermediate: '存在逆溫（上部隨高度升溫）。許多運載火箭的 Max-Q 常出現在對流層頂／平流層下部，視軌跡而定。',
        advanced: '仍屬連續流氣動。ρ 下降但 v 上升時需保證俯仰／偏航穩定與抖振裕度——典型 Max-Q 取捨。',
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
        advanced: 'Knudsen number Kn=λ/L rises; continuum CFD breaks down toward free-molecular flow. Entry vehicles may already see significant heating on steep paths.',
      },
      'zh-Hant': {
        beginner: '空氣非常稀薄。流星常在此燃燒。火箭幾乎已在太空。',
        intermediate: '中性大氣最冷區。頂部開始出現自由分子效應；氣動控制能力減弱。',
        advanced: '克努森數 Kn=λ/L 上升；連續流 CFD 逐漸失效、走向自由分子流。陡峭再入路徑上載具可能已開始明顯加熱。',
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
        intermediate: 'Kinetic temperatures are high, yet heat transfer to a craft is small because density is tiny. Residual drag still decays LEO orbits.',
        advanced: 'Solar EUV drives density variability (space weather). Entry interface for many profiles is cited near ~120 km — still thermosphere — where stagnation heating ramps up as ρ·v³-class terms grow.',
      },
      'zh-Hant': {
        beginner: '極度稀薄，但被太陽加熱時原子運動極快。國際太空站在此區域運行。',
        intermediate: '動能溫度高，但因密度極低，傳給載具的熱量仍小。殘餘阻力仍使近地軌道衰減。',
        advanced: '太陽極紫外驅動密度變化（太空天氣）。許多剖面的再入介面約在 120 公里——仍屬熱層——此時滯止加熱隨 ρ·v³ 類項上升。',
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
        advanced: 'Collisionless regime; mean free path ≫ vehicle size. Relevant for satellite drag models at very high LEO / elliptical perigees, not for Max-Q.',
      },
      'zh-Hant': {
        beginner: '大氣逐漸消失於太空。幾乎沒有空氣再推動火箭。',
        intermediate: '粒子可沿彈道飛行、碰撞罕見。連續流氣動可忽略。',
        advanced: '無碰撞體制；平均自由程 ≫ 載具尺度。與極高近地／橢圓近地點的衛星阻力模型有關，與 Max-Q 無關。',
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
          'Rankine–Hugoniot jump conditions set post-shock T and p. Stagnation enthalpy h₀≈h∞+v∞²/2. Wall heat flux is dominated by the thermal boundary layer under the shock, not µ(∂u/∂y) viscous dissipation at the wall for Earth orbital/lunar-return class entries.',
      },
      'zh-Hant': {
        beginner:
          '以軌道速度飛行時，空氣來不及讓開，在載具前方堆積並被強烈壓縮，變成極熱的電漿。是這團熱氣體加熱船體——不是像雙手摩擦那樣。',
        intermediate:
          '鈍頭體前方形成弓形激波。穿過激波時動能轉為熱焓。載具主要被激波層的對流（極高速時還有輻射）加熱——表面黏性摩擦相對是次要熱源。',
        advanced:
          'Rankine–Hugoniot 條件決定激波後 T、p。滯止焓 h₀≈h∞+v∞²/2。壁面熱流主要由激波下熱邊界層主導，而非地球軌道／月球返回級再入中壁面 µ(∂u/∂y) 黏性耗散。',
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
          'Trajectory shaping (pitch program) trades gravity losses vs aero loads. Buffet, aeroelastic margins, and engine-out capability are certified against the q(t) history — not a single scalar.',
      },
      'zh-Hant': {
        beginner: '火箭越快，空氣推力越大——直到空氣稀到推力又下降。峰值稱為 Max-Q。',
        intermediate: '動壓 q=½ρv²。阻力 D=q·C_d·A。結構載荷與彎矩常在 Max-Q 附近最大；引擎可能節流以限制 q。',
        advanced: '俯仰程序在重力損失與氣動載荷間取捨。抖振、氣彈裕度與引擎失效能力需相對整個 q(t) 歷程認證——不是單一標量。',
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
          'At lunar-return / hyperbolic speeds, radiative heating from the shock layer (N₂, O₂ dissociation/ionization products) can rival or exceed convection for large radii. TPS design splits convective vs radiative budgets; we do not invent peak q̇ numbers.',
      },
      'zh-Hant': {
        beginner: '再入越快越熱。從月球回來比從近地軌道回來嚴酷得多。',
        intermediate:
          '工程關聯式（如 Sutton–Graves 類）給出滯止對流熱流大致 ∝ √(ρ/R_n)·v³。密度、鼻錐半徑 R_n 與速度占主導。此處不以未公開的 Starship 熱流表當事實。',
        advanced:
          '月球返回／雙曲線速度下，激波層輻射加熱（N₂、O₂ 解離／電離產物）對大半徑載具可能可比擬或超過對流。熱防護需分配對流／輻射預算；我們不虛構峰值 q̇。',
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
          'Electron density n_e in the sheath sets plasma frequency ω_p. Links with ω<ω_p are cut off. Mitigation: higher-frequency bands, carefully placed antennas, or trajectory shaping — vehicle-specific details for Starship are not assumed.',
      },
      'zh-Hant': {
        beginner: '船體周圍發光的空氣可能暫時擋住無線電——稱為黑障。',
        intermediate: '電離激波層電漿會反射／吸收射頻。黑障時長取決於頻率、天線位置與軌跡。',
        advanced: '鞘層電子密度 n_e 決定電漿頻率 ω_p。ω<ω_p 的鏈路會中斷。緩解：更高頻段、謹慎佈局天線或塑形軌跡——不假設 Starship 特定細節。',
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
          'Bondline temperature limits, catalytic recombination at the wall, and transition to turbulence (higher heating) size the TPS. Public materials describe Starship’s windward tile approach; certified lunar-return heat pulses remain unlabeled here.',
      },
      'zh-Hant': {
        beginner: '特殊瓦片或護盾防止金屬熔化。Starship 在迎風熱面使用防熱瓦。',
        intermediate: '可重複使用陶瓷瓦拒熱並隔絕結構。縫隙、膠黏與掉瓦容錯是可靠度關鍵。燒蝕材料以消耗質量帶走熱量——另一種取捨。',
        advanced: '黏結線溫度限制、壁面催化重組，以及轉捩為湍流（更高加熱）決定熱防護尺寸。公開資料描述 Starship 迎風瓦方案；認證級月球返回熱脈衝此處不標定。',
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
        advanced: 'Free-molecular / vacuum regime end-to-end. No Max-Q, no entry plasma. Δv and sensor/plume engineering dominate EDL.',
      },
      'zh-Hant': {
        beginner: '沒有空氣就沒有降落傘，也幾乎沒有氣動減速。必須靠火箭減速與著陸。',
        intermediate: '表面壓力近乎硬真空（約 10⁻¹² mbar 量級）。著陸純推進；羽流－表岩屑作用取代大氣揚塵問題。',
        advanced: '全程自由分子／真空體制。無 Max-Q、無再入電漿。EDL 由 Δv 與感測／羽流工程主導。',
      },
    },
    bullets: [
      {
        label: { en: 'Surface pressure', 'zh-Hant': '表面氣壓' },
        value: { en: '~0 (hard vacuum)', 'zh-Hant': '約 0（硬真空）' },
      },
      {
        label: { en: 'Aero braking', 'zh-Hant': '氣動減速' },
        value: { en: 'Negligible', 'zh-Hant': '可忽略' },
      },
    ],
  },
  {
    id: 'mars',
    title: { en: 'Mars — thin CO₂ atmosphere', 'zh-Hant': '火星——稀薄二氧化碳大氣' },
    summary: {
      en: {
        beginner: 'Mars has air, but much thinner than Earth’s. It helps a little to slow down, but heavy ships still need big rockets and heat shields.',
        intermediate: 'Surface pressure ~0.6% of Earth’s. Entry heating still occurs via shocks, but parachutes alone cannot land Starship-class mass — propulsion/EDL trades dominate.',
        advanced: 'Scale height and low ρ shrink the continuum deceleration corridor. Ballistic coefficient β=m/(C_d A) is punishing for large vehicles; lofted or lifting entries and propulsive terminal descent are architecture drivers.',
      },
      'zh-Hant': {
        beginner: '火星有空氣，但比地球稀薄得多。能稍微減速，但重型船艦仍需大推力火箭與熱盾。',
        intermediate: '表面氣壓約為地球的 0.6%。激波加熱仍會發生，但僅靠降落傘無法著陸 Starship 級質量——推進／EDL 取捨占主導。',
        advanced: '標高與低 ρ 壓縮連續流減速走廊。大載具彈道係數 β=m/(C_d A) 嚴苛；升力再入與動力終端下降是架構驅動。',
      },
    },
    bullets: [
      {
        label: { en: 'Surface pressure', 'zh-Hant': '表面氣壓' },
        value: { en: '~0.6% of Earth sea level', 'zh-Hant': '約地球海平面的 0.6%' },
      },
      {
        label: { en: 'Main gas', 'zh-Hant': '主要氣體' },
        value: { en: 'CO₂ (~95%)', 'zh-Hant': 'CO₂（約 95%）' },
      },
    ],
  },
  {
    id: 'venus',
    title: { en: 'Venus — extreme dense atmosphere', 'zh-Hant': '金星——極端濃密大氣' },
    summary: {
      en: {
        beginner: 'Venus has a crushing, scorching atmosphere. Entry heating and survival on the surface are both extremely hard.',
        intermediate: 'Surface pressure ~90 bar, ~460°C. Entry probes see intense aeroheating; landers need pressure vessels and short lifetimes.',
        advanced: 'High ρ enables strong aero deceleration but peak heat and structural pressure loads are severe. Not a published Starship destination profile.',
      },
      'zh-Hant': {
        beginner: '金星大氣既高壓又極熱。再入加熱與表面存活都極困難。',
        intermediate: '表面約 90 巴、約 460°C。探測器再入加熱劇烈；著陸器需耐壓殼且壽命短。',
        advanced: '高 ρ 可強烈氣動減速，但峰值熱與結構壓力載荷嚴峻。非已公布的 Starship 任務剖面。',
      },
    },
    bullets: [
      {
        label: { en: 'Surface pressure', 'zh-Hant': '表面氣壓' },
        value: { en: '~90× Earth sea level', 'zh-Hant': '約地球海平面的 90 倍' },
      },
      {
        label: { en: 'Main gas', 'zh-Hant': '主要氣體' },
        value: { en: 'CO₂ with thick clouds', 'zh-Hant': 'CO₂ 與濃厚雲層' },
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
      intermediate: 'Entry interface (~100–120 km class teaching value) begins meaningful aero deceleration and heating via a shock layer.',
      advanced: 'Corridor design bounds flight-path angle: too shallow → skip-out; too steep → peak q̇ and structural load exceedance.',
    },
    'zh-Hant': {
      beginner: '回家時，船艦再次穿過這些氣層——這次速度快到前方空氣發光。',
      intermediate: '再入介面（教學值約 100–120 公里）開始透過激波層產生明顯氣動減速與加熱。',
      advanced: '走廊設計限制飛行路徑角：太淺會跳飛；太陡則峰值熱流與結構載荷超限。',
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
