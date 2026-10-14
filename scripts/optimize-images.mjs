// Optimiza renders de public/proyectos: JPG<=1920 q80, WebP + variantes 960.
// Uso: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, stat, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'proyectos');

const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f) && !/-960\.jpg$/i.test(f));
let before = 0;
let after = 0;

for (const f of files) {
  const base = f.replace(/\.jpe?g$/i, '');
  const src = join(DIR, f);
  before += (await stat(src)).size;
  const img = sharp(src, { failOn: 'none' });
  const meta = await img.metadata();
  const w = Math.min(meta.width ?? 1920, 1920);

  await sharp(src).resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(join(DIR, `${base}.tmp.jpg`));
  await rename(join(DIR, `${base}.tmp.jpg`), join(DIR, `${base}.jpg`));
  await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(DIR, `${base}.webp`));
  await sharp(src).resize({ width: 960, withoutEnlargement: true }).jpeg({ quality: 75, mozjpeg: true }).toFile(join(DIR, `${base}-960.jpg`));
  await sharp(src).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 72 }).toFile(join(DIR, `${base}-960.webp`));

  for (const o of [`${base}.jpg`, `${base}.webp`, `${base}-960.jpg`, `${base}-960.webp`]) {
    after += (await stat(join(DIR, o))).size;
  }
  console.log(`${base}: ${meta.width}x${meta.height} -> 1920 max + webp + 960`);
}

console.log(`antes: ${(before / 1048576).toFixed(1)} MB -> ahora: ${(after / 1048576).toFixed(1)} MB`);
