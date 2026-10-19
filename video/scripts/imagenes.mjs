// Recorta los renders originales a vertical 9:16 para el video.
// Uso (desde video/): node scripts/imagenes.mjs <carpeta IMAGENES descomprimida>
//
// Cada recorte sale a 1242x2208 (15% mas grande que el cuadro de 1080x1920)
// para que el zoom lento de cada escena no tenga que ampliar la imagen.
// `x` es el centro horizontal del recorte (0 = borde izquierdo, 1 = derecho).
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const sharp = require('../../node_modules/sharp');

const SRC = process.argv[2];
const OUT = path.resolve('public/img');
const W = 1242;
const H = 2208;

const IMAGENES = {
  'hecate-noche': ['Luz de Hecate /LUZ DE HECATE_Photo - 9.jpg', 0.5],
  'liuto-niebla': ['Liuto china/TOP OF THE MOUNTAIN.jpg', 0.47],
  'kiralooro-luz': ['KIRALOORO-CONCURSO SENEGAL/RENDER ESPIRITUAL.jpg', 0.5],
  'liuto-lago': ['Liuto china/FASHION R&D_03.jpg', 0.58],
  'hecate-cascada': ['Luz de Hecate /LUZ DE HECATE_Photo - 5.jpg', 0.56],
  'kiralooro-entrada': ['KIRALOORO-CONCURSO SENEGAL/RENDER ENTRADA.jpg', 0.36],
  'preescolar-patio': ['Preescolar /PATIO INTERIOR 1.jpg', 0.5],
  'hecate-vertical': ['Luz de Hecate /LUZ DE HECATE_Photo - 2.jpg', 0.5],
  'spa-piscina': ['Spa/002.jpg', 0.42],
  'spa-atardecer': ['Spa/001.jpg', 0.42],
  'spa-noche': ['Spa/003.jpg', 0.6],
  'ana-frank-acceso': ['ANA FRANK/ACCESO.jpg', 0.66],
};

fs.mkdirSync(OUT, { recursive: true });
for (const [nombre, [rel, x]] of Object.entries(IMAGENES)) {
  const src = path.join(SRC, rel);
  const meta = await sharp(src).metadata();
  // Escala para cubrir el cuadro vertical completo.
  const escala = Math.max(W / meta.width, H / meta.height);
  const rw = Math.round(meta.width * escala);
  const rh = Math.round(meta.height * escala);
  const left = Math.min(rw - W, Math.max(0, Math.round(rw * x - W / 2)));
  const top = Math.round((rh - H) / 2);
  await sharp(src)
    .resize(rw, rh)
    .extract({ left, top, width: W, height: H })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, `${nombre}.jpg`));
  const nota = escala > 1.05 ? `  (ampliada x${escala.toFixed(2)})` : '';
  console.log(`${nombre}: ${meta.width}x${meta.height}${nota}`);
}
