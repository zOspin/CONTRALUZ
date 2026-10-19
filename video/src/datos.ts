import type { Caption } from "@remotion/captions";
import guion from "../guion.json";
import voz from "./voz.generated.json";

export const FPS = 30;

/** La voz entra un instante despues del corte y deja aire al final. */
export const ENTRADA_VOZ_MS = 280;
const COLA_MS = 620;

/** Frames que se solapan dos escenas durante el fundido. */
export const TRANSICION = 12;

export type Escena = {
  id: string;
  texto: string;
  imagenes: string[];
  rotulo?: string;
  frames: number;
  subtitulos: Caption[];
};

export const ESCENAS: Escena[] = guion.escenas.map((e) => {
  const v = voz.find((x) => x.id === e.id);
  if (!v) throw new Error(`Falta la voz de "${e.id}": corre python scripts/voz.py`);
  return {
    ...e,
    frames: Math.ceil(((ENTRADA_VOZ_MS + v.vozMs + COLA_MS) / 1000) * FPS),
    // Formato Caption de @remotion/captions. El espacio inicial separa las
    // palabras al agruparlas en frases.
    subtitulos: v.palabras.map((p, i) => ({
      text: (i === 0 ? "" : " ") + p.text,
      startMs: p.startMs + ENTRADA_VOZ_MS,
      endMs: p.endMs + ENTRADA_VOZ_MS,
      timestampMs: p.startMs + ENTRADA_VOZ_MS,
      confidence: null,
    })),
  };
});

export const DURACION_TOTAL =
  ESCENAS.reduce((s, e) => s + e.frames, 0) - TRANSICION * (ESCENAS.length - 1);
