import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const chrome = process.env.CHROME_PATH || '/usr/local/bin/google-chrome'
const base = process.env.APP_URL || 'http://127.0.0.1:5173'
const outDir = process.env.OUT_DIR || '/cursor/stores/self/media'

const shots = [
  { file: 'visual-upgrade-launch.webp', progress: 0.12, wait: 3500 },
  { file: 'visual-upgrade-transit.webp', progress: 0.4, wait: 3500 },
  { file: 'visual-upgrade-landing.webp', progress: 0.58, wait: 3500 },
]

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
    `--user-data-dir=/tmp/puppeteer-capture-${Date.now()}`,
  ],
  defaultViewport: { width: 1440, height: 1100, deviceScaleFactor: 1 },
  protocolTimeout: 120000,
})

try {
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(45000)
  for (const shot of shots) {
    const url = `${base}/?progress=${shot.progress}`
    console.log('capturing', url)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('canvas', { timeout: 30000 })
    await page.evaluate(() => {
      document.querySelector('.canvas-wrap')?.scrollIntoView({ block: 'center' })
    })
    await new Promise((r) => setTimeout(r, shot.wait))
    const pngPath = `/tmp/${shot.file.replace('.webp', '.png')}`
    await page.screenshot({ path: pngPath, type: 'png' })
    const out = `${outDir}/${shot.file}`
    execFileSync('ffmpeg', ['-y', '-i', pngPath, '-quality', '92', out], { stdio: 'ignore' })
    console.log('wrote', out)
  }
} finally {
  await browser.close()
}
