// Exporta los renders para la web: de originales/proyectos a public/proyectos.
//   <base>.jpg / .webp          1920 max (q86 / q84)
//   <base>-960.jpg / -960.webp   960 (q80 / q78)
//   <base>-2560.jpg / .webp      solo si el original mide 2560+ (q82 / q80)
// y escribe src/data/imagenesGrandes.js con las bases que tienen 2560.
// Siempre desde el original: recomprimir lo ya comprimido degrada la foto.
// Uso: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'originales', 'proyectos');
const OUT = join(ROOT, 'public', 'proyectos');

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
const grandes = [];
let total = 0;

for (const f of files) {
  const base = f.replace(/\.(jpe?g|png)$/i, '');
  const src = join(SRC, f);
  const { width = 1920 } = await sharp(src).metadata();
  const salida = [
    [`${base}.jpg`, 1920, (s) => s.jpeg({ quality: 86, mozjpeg: true })],
    [`${base}.webp`, 1920, (s) => s.webp({ quality: 84, smartSubsample: true })],
    [`${base}-960.jpg`, 960, (s) => s.jpeg({ quality: 80, mozjpeg: true })],
    [`${base}-960.webp`, 960, (s) => s.webp({ quality: 78, smartSubsample: true })],
  ];
  if (width >= 2560) {
    grandes.push(`/proyectos/${base}.jpg`);
    salida.push(
      [`${base}-2560.jpg`, 2560, (s) => s.jpeg({ quality: 82, mozjpeg: true })],
      [`${base}-2560.webp`, 2560, (s) => s.webp({ quality: 80, smartSubsample: true })]
    );
  }
  for (const [nombre, w, fmt] of salida) {
    await fmt(sharp(src).resize({ width: w, withoutEnlargement: true })).toFile(join(OUT, nombre));
    total += (await stat(join(OUT, nombre))).size;
  }
  console.log(`${base}: ${width}px -> ${width >= 2560 ? '2560 + ' : ''}1920 + 960`);
}

await writeFile(
  join(ROOT, 'src', 'data', 'imagenesGrandes.js'),
  `// Generado por scripts/optimize-images.mjs: fotos con version -2560.\nexport const IMAGENES_GRANDES = new Set(${JSON.stringify(grandes.sort(), null, 2)});\n`
);
console.log(`${files.length} fotos, ${(total / 1048576).toFixed(1)} MB en total`);
