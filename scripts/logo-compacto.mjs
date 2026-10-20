// Version del logo para tamanos pequenos (barra de navegacion, cabecera del reel).
// Uso: node scripts/logo-compacto.mjs
//
// En el original, los trazos de "LUZ" miden ~6 px contra ~35 px de "CONTR".
// A 150-280 px de ancho quedan por debajo de 1 px y se pierden. Aqui se
// engrosan SOLO esos trazos finos (a la derecha de la barra diagonal),
// dilatando su canal alfa; "CONTR" y la barra quedan identicos.
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'logo');
const RADIO = 5; // px a resolucion completa: 6-7 px -> ~17 px

const { data, info } = await sharp(join(DIR, 'contraluz.png'))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// Borde derecho de la barra diagonal: x ~ 1145 - 0.40*y (medido en el archivo).
const esFino = (x, y) => x > 1150 - 0.4 * y;

// Alfa solo de los trazos finos.
const fino = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (esFino(x, y)) fino[y * W + x] = data[(y * W + x) * C + 3];
  }
}

// Dilatacion separable (maximo en ventana cuadrada).
const horiz = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let m = 0;
    for (let k = Math.max(0, x - RADIO); k <= Math.min(W - 1, x + RADIO); k++) {
      const v = fino[y * W + k];
      if (v > m) m = v;
    }
    horiz[y * W + x] = m;
  }
}
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let m = 0;
    for (let k = Math.max(0, y - RADIO); k <= Math.min(H - 1, y + RADIO); k++) {
      const v = horiz[k * W + x];
      if (v > m) m = v;
    }
    const i = (y * W + x) * C + 3;
    if (m > data[i]) data[i] = m;
  }
}

// Margen extra para que el engrosado no quede pegado al borde.
const img = sharp(data, { raw: info }).extend({
  top: RADIO,
  bottom: RADIO,
  left: 0,
  right: RADIO,
  background: { r: 0, g: 0, b: 0, alpha: 0 },
});
await img.clone().png({ compressionLevel: 9 }).toFile(join(DIR, 'contraluz-compacto.png'));
console.log('contraluz-compacto.png', W + RADIO, 'x', H + 2 * RADIO);
