import guion from "../guion.json";
import voz from "./voz.generated.json";

export const FPS = 30;
export const BPM = guion.bpm;
/** Frames por beat (124 bpm a 30 fps = 14.5). Los cortes caen en la grilla. */
export const BEAT = (FPS * 60) / BPM;

/** La voz entra justo despues del corte (mismo valor que usa musica.py). */
export const ENTRADA_VOZ_MS = 60;

export type Palabra = { text: string; startMs: number; endMs: number };

export type Escena = {
  id: string;
  texto: string;
  /** Frame de inicio en el video completo. */
  desde: number;
  frames: number;
  /** Palabras con tiempos relativos al inicio de la escena (ya con la entrada de voz). */
  palabras: Palabra[];
};

let beat = 0;
export const ESCENAS: Escena[] = guion.escenas.map((e) => {
  const v = voz.find((x) => x.id === e.id);
  if (!v) throw new Error(`Falta la voz de "${e.id}": corre python scripts/voz.py`);
  const desde = Math.round(beat * BEAT);
  beat += e.beats;
  const hasta = Math.round(beat * BEAT);
  return {
    id: e.id,
    texto: e.texto,
    desde,
    frames: hasta - desde,
    palabras: v.palabras.map((p) => ({
      text: p.text,
      startMs: p.startMs + ENTRADA_VOZ_MS,
      endMs: p.endMs + ENTRADA_VOZ_MS,
    })),
  };
});

export const DURACION_TOTAL = Math.round(beat * BEAT);

export const escena = (id: string): Escena => {
  const e = ESCENAS.find((x) => x.id === id);
  if (!e) throw new Error(`No existe la escena ${id}`);
  return e;
};

/** Frame (relativo a la escena) en que empieza la palabra n. */
export const framePalabra = (e: Escena, n: number) =>
  Math.round((e.palabras[n].startMs / 1000) * FPS);

/** Tramos con voz en el video completo, para bajar la musica debajo. */
export const TRAMOS_VOZ = ESCENAS.map((e) => [
  e.desde + Math.round((e.palabras[0].startMs / 1000) * FPS),
  e.desde + Math.round((e.palabras[e.palabras.length - 1].endMs / 1000) * FPS),
]);
