// Captura preloader (1.5s) y hero final (6s) de CONTRALUZ.
// Uso: node scripts/shot.mjs
import { chromium } from 'playwright-core';

const URL = process.env.SHOT_URL || 'http://127.0.0.1:5174/';
const OUT = process.env.SHOT_DIR || 'C:/Users/user/AppData/Local/Temp/opencode';
const EXE = 'C:/Users/user/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });
// Preloader por etapas: palabra primero, resto despues.
const t1 = Number(process.env.SHOT_T1 || 700);
const t2 = Number(process.env.SHOT_T2 || 2400);
await page.waitForTimeout(t1);
await page.screenshot({ path: `${OUT}/shot_pre.png` });
await page.waitForTimeout(t2 - t1);
await page.screenshot({ path: `${OUT}/shot_hero.png` });
await browser.close();
console.log('OK');
