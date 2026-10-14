// Chequeo responsive: overflow-x y render en 360 / 768 / 1440 / 2560.
// Uso: node scripts/check-responsive.mjs
import { chromium } from 'playwright-core';

const URL = process.env.SHOT_URL || 'http://127.0.0.1:5174/';
const OUT = process.env.SHOT_DIR || 'C:/Users/user/AppData/Local/Temp/opencode';
const EXE = 'C:/Users/user/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';

const browser = await chromium.launch({ executablePath: EXE });
for (const w of [360, 768, 1440, 2560]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500); // preloader fuera
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    bodyH: document.body.scrollHeight,
  }));
  console.log(`${w}px: scrollW=${overflow.scrollW} innerW=${overflow.innerW} bodyH=${overflow.bodyH} errores=${errors.length ? errors.join(' | ') : 'ninguno'}`);
  if (w === 360 || w === 2560) {
    await page.screenshot({ path: `${OUT}/resp_${w}.png` });
  }
  await page.close();
}
await browser.close();
console.log('OK');
