// Captura dos planos de la cinematica (mitad del reel).
// Uso: node scripts/shot_reel.mjs
import { chromium } from 'playwright-core';

const URL = process.env.SHOT_URL || 'http://127.0.0.1:5174/';
const OUT = process.env.SHOT_DIR || 'C:/Users/user/AppData/Local/Temp/opencode';
const EXE = 'C:/Users/user/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(4200); // preloader fuera
await page.evaluate(() => window.__lenis?.scrollTo(window.innerHeight * 1.4, { immediate: true }));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/shot_reel1.png` });
await page.evaluate(() => window.__lenis?.scrollTo(window.innerHeight * 2.6, { immediate: true }));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/shot_reel2.png` });
await browser.close();
console.log('OK');
