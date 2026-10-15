import puppeteer from 'puppeteer-core'
import { execFileSync } from 'node:child_process'

const chrome = process.env.CHROME_PATH || '/usr/local/bin/google-chrome'
const base = process.env.APP_URL || 'http://127.0.0.1:5173'
const outDir = process.env.OUT_DIR || '/cursor/stores/self/media'

const shots = [
  {
    file: 'traj-moon-ellipse.webp',
    progress: 0.5,
    destination: 'moon',
    scaleMode: 'planet',
    difficulty: 'advanced',
    wait: 5000,
  },
  {
    file: 'traj-mars-bodies.webp',
    progress: 0.5,
    destination: 'mars',
    scaleMode: 'planet',
    difficulty: 'advanced',
    wait: 5500,
    zoomOutClicks: 3,
  },
  {
    file: 'traj-transit-timeline.webp',
    progress: 0.55,
    destination: 'moon',
    scaleMode: 'planet',
    difficulty: 'intermediate',
    wait: 5000,
    // Ensure timeline + HUD time are visible in frame
    scrollTimeline: true,
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
      `--user-data-dir=/tmp/puppeteer-traj-${shot.file}-${Date.now()}`,
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
    console.log('capturing', shot.file, url, shot.destination)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('canvas', { timeout: 30000 })
    await page.waitForSelector('.measure-hud', { timeout: 15000 })
    await page.evaluate(() => {
      document.querySelector('.canvas-wrap')?.scrollIntoView({ block: 'center' })
    })
    await page.evaluate((cfg) => {
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
      const pills = [...document.querySelectorAll('.dest-pill')]
      const want = cfg.destination.toLowerCase()
      const match = pills.find((p) => p.textContent?.trim().toLowerCase() === want)
      if (match && !match.classList.contains('active')) match.click()
    }, shot)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.measure-hud', { timeout: 15000 })
    await page.waitForSelector('.timeline', { timeout: 10000 })
    await page.evaluate((cfg) => {
      if (cfg.scrollTimeline) {
        document.querySelector('.timeline')?.scrollIntoView({ block: 'end' })
      } else {
        document.querySelector('.canvas-wrap')?.scrollIntoView({ block: 'center' })
      }
    }, shot)
    if (shot.zoomOutClicks) {
      for (let i = 0; i < shot.zoomOutClicks; i++) {
        await page.click('button[aria-label="Zoom out"], button[title="Zoom out"]').catch(async () => {
          const btns = await page.$$('.viewer-bar button')
          // fall through — try text match
          for (const b of btns) {
            const t = await b.evaluate((el) => el.textContent || '')
            if (/zoom out|縮小/i.test(t)) {
              await b.click()
              break
            }
          }
        })
        await new Promise((r) => setTimeout(r, 200))
      }
    }
    await new Promise((r) => setTimeout(r, shot.wait))
    const hud = await page.$eval('.measure-hud', (el) => el.innerText.slice(0, 320))
    console.log('hud:', hud.replace(/\n/g, ' | '))
    const pngPath = `/tmp/${shot.file.replace('.webp', '.png')}`
    await page.screenshot({ path: pngPath, type: 'png' })
    const out = `${outDir}/${shot.file}`
    execFileSync('ffmpeg', ['-y', '-i', pngPath, '-quality', '92', out], { stdio: 'ignore' })
    console.log('wrote', out)
  } finally {
    await browser.close()
  }
}
