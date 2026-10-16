import puppeteer from 'puppeteer-core'
import { execFileSync } from 'node:child_process'

const chrome = process.env.CHROME_PATH || '/usr/local/bin/google-chrome'
const base = process.env.APP_URL || 'http://127.0.0.1:4173/rocket-launcher'
const outDir = process.env.OUT_DIR || '/cursor/stores/self/media'

const shots = [
  {
    file: 'moon-atm-to-loi.webp',
    progress: 0.5,
    destination: 'moon',
    scaleMode: 'planet',
    difficulty: 'intermediate',
    wait: 5500,
  },
  {
    file: 'moon-loi-orbit.webp',
    progress: 0.68,
    destination: 'moon',
    scaleMode: 'planet',
    difficulty: 'intermediate',
    wait: 5500,
  },
  {
    file: 'expert-loi-long.webp',
    progress: 0.59,
    destination: 'moon',
    scaleMode: 'planet',
    difficulty: 'advanced',
    wait: 5500,
    scrollSide: true,
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
      `--user-data-dir=/tmp/puppeteer-loi-${shot.file}-${Date.now()}`,
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
      const match = pills.find((p) => p.textContent?.trim().toLowerCase() === cfg.destination)
      if (match && !match.classList.contains('active')) match.click()
      for (const label of document.querySelectorAll('.control')) {
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
    await page.waitForSelector('.phase-panel', { timeout: 10000 })
    await page.evaluate((cfg) => {
      if (cfg.scrollSide) {
        document.querySelector('.phase-panel')?.scrollIntoView({ block: 'start' })
      } else {
        document.querySelector('.canvas-wrap')?.scrollIntoView({ block: 'center' })
      }
    }, shot)
    await new Promise((r) => setTimeout(r, shot.wait))

    const hud = await page.$eval('.measure-hud', (el) => el.innerText.slice(0, 400))
    console.log('hud:', hud.replace(/\n/g, ' | '))
    const phaseTitle = await page.$eval('.phase-panel h2', (el) => el.textContent)
    const engLen = await page.$eval('.phase-blocks article:last-child p', (el) => el.innerText.length)
    console.log('phase:', phaseTitle, 'engineering chars:', engLen)

    const pngPath = `/tmp/${shot.file.replace('.webp', '.png')}`
    await page.screenshot({ path: pngPath, type: 'png' })
    execFileSync('ffmpeg', ['-y', '-i', pngPath, '-quality', '92', `${outDir}/${shot.file}`], {
      stdio: 'ignore',
    })
    console.log('wrote', `${outDir}/${shot.file}`)
  } finally {
    await browser.close()
  }
}
