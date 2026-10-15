# Vehicle & trajectory data sources

Numbers in the app are taken from public primary sources or **labeled idealized Hohmann calculations**. Educational timeline durations and 3D path geometry are **illustrative**, not operational flight plans.

## SpaceX Starship / Super Heavy (primary)

**Source:** [SpaceX — Starship](https://www.spacex.com/vehicles/starship/)

| Figure | Value used | Notes |
| --- | --- | --- |
| Full stack height | 124 m / 407 ft | Starship + Super Heavy stack |
| Diameter | 9 m / 29.5 ft | Both stages |
| Payload (reusable) | 100+ t | Fully reusable configuration |
| Starship height | 52 m / 171 ft | Upper stage / spacecraft |
| Starship propellant | 1,600 t / 3.5 Mlb | Public capacity |
| Starship thrust | 1,614 tf / 3.5 Mlbf | Public figure |
| Starship engines | 6 Raptor (3 sea-level + 3 RVac) | Vehicle page |
| Super Heavy height | 72 m / 236 ft | Booster |
| Super Heavy propellant | 3,650 t / 8 Mlb | Public capacity |
| Super Heavy thrust | 8,240 tf / 18.1 Mlbf | Public figure |
| Super Heavy engines | 33 Raptor; 13 center gimbaled | Vehicle page |
| Raptor thrust (each) | 250 tf / 551 klbf | Per-engine public figure |
| Propellants | Subcooled CH₄ + LOX | Stated for Super Heavy / Raptor |

SpaceX publicly discusses Moon and Mars roles (including on-orbit refilling). **Venus / Mercury / Jupiter panels are comparison orbital-mechanics education**, not announced Starship crew profiles.

## NASA Artemis / Starship HLS

**Sources:**

- [NASA — Human Landing Systems](https://www.nasa.gov/reference/human-landing-systems/)
- [NASA/SpaceX — Key moments of Artemis lunar lander mission](https://www.nasa.gov/directorates/esdmd/artemis-campaign-development-division/human-landing-system-program/nasa-spacex-illustrate-key-moments-of-artemis-lunar-lander-mission/)

| Fact | Value / statement |
| --- | --- |
| Starship HLS height | ~50 m / ~164 ft |
| Elevator egress | Public concept |
| LEO depot + tankers | Public concept of operations |
| Multi-day lunar transfer | Public Artemis materials (mission-dependent) |

## Interplanetary energy & windows

| Topic | Source / method | What we show |
| --- | --- | --- |
| Hohmann concept & Mars ~259-day coast / ~517-day transfer period | [NASA JPL Education — Calculating launch windows](https://www.jpl.nasa.gov/edu/resources/lesson-plan/lets-go-to-mars-calculating-launch-windows/) | Teaching timeline for Mars one-way |
| Mars opportunities ~25 months; Venus ~19 months | [NASA Science — Basics of Space Flight, Ch. 4 Trajectories](https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/) | Opportunity cadence copy |
| Conjunction ~1000-day RT / long stay; opposition ≤~760-day RT / ~30–50 day stay | [NASA Mars transportation white paper (ACR)](https://www.nasa.gov/wp-content/uploads/2023/10/acr22-wp-mars-transportation.pdf) | Round-trip strategy classes |
| Opposition vs conjunction trades | NASA NTRS human Mars trajectory papers (e.g. [20150001240](https://ntrs.nasa.gov/api/citations/20150001240/downloads/20150001240.pdf)) | Advanced difficulty context |
| Idealized Hohmann Δv (Mars/Venus/Mercury/Jupiter) | Circular coplanar two-body calc in-app (`src/data/orbital.ts`) using μ☉ = 132,712,440,018 km³/s² and mean a ≈ 1.524 / 0.723 / 0.387 / 5.203 AU | Labeled **idealized**; excludes escape, capture, plane change, landing |
| Lunar TLI order ~3.1–3.2 km/s | Standard orbital-mechanics teaching / Apollo-class public order-of-magnitude | Labeled educational; not Starship flight rules |
| Example Mars window years | Public exploration launch cadence (e.g. 2020, 2022, 2024…) | Not exact open/close ephemerides |

Trajectory survey tools such as [NASA Trajectory Browser](https://trajbrowser.arc.nasa.gov/user_guide.php) are cited as the class of tool for higher-fidelity Lambert surveys — the app does not scrape live ephemerides.

## Scale modes (educational honesty)

True 1:1 Starship (~120 m class) vs Earth (~12,742 km diameter) cannot be viewed usefully in one frame. The app exposes two modes (plus **Auto** by phase):

| Mode | What is true-scale | What is not |
| --- | --- | --- |
| **Planet scale** | Body radii relative to each other; cislunar distances in Earth radii (R⊕); heliocentric orbital distances in AU | Vehicle is a **marker glyph** only — never a giant rocket on Earth |
| **Vehicle scale** | Starship / Super Heavy silhouette using public ratios (9 m Ø; ~52 m / ~72 m / ~124 m stack) | Earth is a **local backdrop**, not a full-planet 1:1 globe |

### Mean values used (`src/data/astroConstants.ts`)

| Constant | Value | Class of source |
| --- | --- | --- |
| Earth mean radius | 6,371 km | IAU / NASA fact-sheet class |
| Moon mean radius | 1,737.4 km | Same |
| Mean Earth–Moon distance | 384,400 km ≈ 60.3 R⊕ | Same |
| 1 AU | 149,597,870.7 km | IAU |
| Mars / Venus / Mercury / Jupiter mean radii & a | 3,389.5 / 6,051.8 / 2,439.7 / 69,911 km; 1.524 / 0.723 / 0.387 / 5.203 AU | NASA planetary fact sheets |
| Teaching LEO altitude | 300 km | Textbook class, not a Starship flight rule |
| μ⊕ / μ☉ | 398,600 / 132,712,440,018 km³/s² | Standard GM values for vis-viva teaching |

**Heliocentric body exaggeration:** planet spheres in AU view are multiplied by `HELIO_BODY_EXAGGERATION = 1800` so they remain visible; **orbital distances stay true AU**. The HUD discloses this. Cislunar mode does **not** exaggerate Earth–Moon distance.

**Textures:** procedural educational stand-ins (ocean/land albedo, lunar greyscale maria, Mars ochre). Not NASA photogrammetric mosaics; no photogrammetric accuracy claimed.

**Trajectory geometry:** cislunar patched-conic teaching ellipse (LEO perigee → lunar-distance apogee); heliocentric ideal Hohmann ellipse matching `orbital.ts` Δv / TOF. Path measurements (distance, altitude / heliocentric r, characteristic speed, peri/apo or transfer *a* at Advanced) are tied to the scrubber parameter — not a straight-line toy path.

## Accuracy labels

- **Fact:** Starship vehicle panel numbers with SpaceX/NASA links
- **Idealized model:** Hohmann Δv / TOF / synodic periods from circular coplanar math
- **Architecture class (NASA studies):** conjunction vs opposition Mars round-trips
- **Illustrative:** scrubber phase durations, simplified vehicle silhouette, procedural body textures
- **Scale disclosure:** dual planet / vehicle modes; heliocentric radius exaggeration labeled in HUD
- **Not invented as Starship missions:** crewed Venus / Mercury / Jupiter round-trips

## Deliberately unused as “fact”

- Secondary blog spec sheets that conflict with SpaceX’s vehicle page
- Exact future launch open/close calendars without an ephemeris product
- Unpublished Starship Mars/Moon burn tables presented as certified
- Claiming 1:1 rocket↔Earth in a single useful viewport
