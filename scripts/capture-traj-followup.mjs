import puppeteer from 'puppeteer-core'
import { execFileSync } from 'node:child_process'

const chrome = process.env.CHROME_PATH || '/usr/local/bin/google-chrome'
const base = process.env.APP_URL || 'http://127.0.0.1:4173/rocket-launcher'
const outDir = process.env.OUT_DIR || '/cursor/stores/self/media'

const shots = [
  {
    file: 'planets-not-collinear.webp',
    progress: 0.04,
    destination: 'mars',
    scaleMode: 'planet',
    difficulty: 'advanced',
    wait: 6000,
    // Do not click zoom — auto helio framing shows the full non-collinear system
  },
  {
    file: 'one-way-no-tags.webp',
    progress: 0.55,
    destination: 'mars',
    scaleMode: 'planet',
    difficulty: 'intermediate',
    wait: 5500,
  },
  {
    file: 'vehicle-box-aside.webp',
    progress: 0.12,
    destination: 'moon',
    scaleMode: 'auto',
    difficulty: 'beginner',
    wait: 5000,
  },
]

for (const shot of shots) {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-gpu-blocklist',
      '--enable-webgl',
      '--use-gl=angle',
      '--enable-unsafe-swiftshader',
      '--window-size=1440,1100',
      `--user-data-dir=/tmp/puppeteer-followup-${shot.file}-${Date.now()}`,
    ],
    defaultViewport: { width: 1440, height: 1100, deviceScaleFactor: 1 },
    protocolTimeout: 120000,
  })
  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(45000)
    await page.evaluateOnNewDocument((cfg) => {
      localStorage.setItem(
        'moon-mission-prefs',
        JSON.stringify({
          locale: 'en',
          difficulty: cfg.difficulty,
          destinationId: cfg.destination,
          scaleMode: cfg.scaleMode,
          playbackRate: 10,
        }),
      )
    }, shot)

    const url = `${base}/?progress=${shot.progress}`
    console.log('capturing', shot.file, url)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('canvas', { timeout: 30000 })
    await page.waitForSelector('.measure-hud', { timeout: 15000 })
    await page.evaluate((cfg) => {
      const pills = [...document.querySelectorAll('.dest-pill')]
      const want = cfg.destination.toLowerCase()
      const match = pills.find((p) => p.textContent?.trim().toLowerCase() === want)
      if (match && !match.classList.contains('active')) match.click()
      const labels = [...document.querySelectorAll('.control')]
      for (const label of labels) {
        const span = label.querySelector('span')?.textContent?.toLowerCase() ?? ''
        const select = label.querySelector('select')
        if (!select) continue
        if (span.includes('scale') || span.includes('比例')) {
          select.value = cfg.scaleMode
          select.dispatchEvent(new Event('change', { bubbles: true }))
        }
        if (span.includes('difficult') || span.includes('難度')) {
          select.value = cfg.difficulty
          select.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }
    }, shot)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.measure-hud', { timeout: 15000 })
    await page.evaluate(() => {
      document.querySelector('.layout')?.scrollIntoView({ block: 'start' })
    })
    if (shot.zoomOutClicks) {
      for (let i = 0; i < shot.zoomOutClicks; i++) {
        await page.click('button[aria-label="Zoom out"]').catch(() => {})
        await new Promise((r) => setTimeout(r, 200))
      }
    }
    await new Promise((r) => setTimeout(r, shot.wait))

    const hud = await page.$eval('.measure-hud', (el) => el.innerText.slice(0, 360))
    console.log('hud:', hud.replace(/\n/g, ' | '))
    const tags = await page.$$eval('.body-label, .path-label, .path-kind-chip', (els) =>
      els.map((e) => e.textContent),
    )
    console.log('3d tags remaining:', tags)
    const insetInCanvas = await page.evaluate(() => {
      const wrap = document.querySelector('.canvas-wrap')
      const inset = document.querySelector('.vehicle-inset')
      if (!wrap || !inset) return { inset: !!inset, insideCanvas: false }
      return { inset: true, insideCanvas: wrap.contains(inset) }
    })
    console.log('vehicle inset:', insetInCanvas)

    const pngPath = `/tmp/${shot.file.replace('.webp', '.png')}`
    await page.screenshot({ path: pngPath, type: 'png' })
    const out = `${outDir}/${shot.file}`
    execFileSync('ffmpeg', ['-y', '-i', pngPath, '-quality', '92', out], { stdio: 'ignore' })
    console.log('wrote', out)
  } finally {
    await browser.close()
  }
}
