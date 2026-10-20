import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { escena, framePalabra } from "./datos";

/**
 * Diseno sonoro: cada efecto cae en el frame exacto de su animacion.
 * Los archivos salen de scripts/sfx.py (public/sfx/*.wav).
 */
type Sfx =
  | "whoosh"
  | "swish"
  | "impacto"
  | "subdrop"
  | "reverso"
  | "brillo"
  | "tick"
  | "obturador"
  | "pop"
  | "glitch";

type Evento = { nombre: string; sfx: Sfx; en: number; vol: number };

const REVERSO = 30; // el reverso dura 1 s: termina justo en el corte

const desde = (id: string) => escena(id).desde;
const palabra = (id: string, n: number) => escena(id).desde + framePalabra(escena(id), n) - 1;
const palabras = (id: string) => escena(id).palabras.map((_, n) => palabra(id, n));

const EVENTOS: Evento[] = [
  // 1. Gancho: golpe de entrada, la rendija de luz suena a destello.
  { nombre: "Entrada impacto", sfx: "impacto", en: 0, vol: 0.3 },
  { nombre: "Entrada sub", sfx: "subdrop", en: 0, vol: 0.35 },
  { nombre: "Rendija de luz", sfx: "brillo", en: 3, vol: 0.4 },
  ...palabras("gancho").map((en, i) => ({ nombre: `Palabra gancho ${i + 1}`, sfx: "tick" as Sfx, en, vol: 0.22 })),

  // 2. Materia: reverso hacia el drop y un golpe por palabra gigante.
  { nombre: "Reverso al drop", sfx: "reverso", en: desde("materia") - REVERSO, vol: 0.5 },
  ...palabras("materia").flatMap((en, i) => [
    { nombre: `Golpe palabra ${i + 1}`, sfx: "impacto" as Sfx, en, vol: 0.6 },
    { nombre: `Swish palabra ${i + 1}`, sfx: "swish" as Sfx, en: en - 2, vol: 0.45 },
  ]),
  { nombre: "Glitch sombra", sfx: "glitch", en: palabra("materia", 1), vol: 0.3 },

  // 3. Escuelas: un whoosh por panel que entra.
  ...[0, 3, 6].map((d, i) => ({ nombre: `Panel ${i + 1}`, sfx: "whoosh" as Sfx, en: desde("escuelas") + d - 4, vol: 0.4 })),
  { nombre: "Swish respiran", sfx: "swish", en: palabra("escuelas", 2), vol: 0.35 },

  // 4. Casas: la apertura circular es el obturador de una camara.
  { nombre: "Whoosh casas", sfx: "whoosh", en: desde("casas") - 6, vol: 0.35 },
  { nombre: "Obturador", sfx: "obturador", en: desde("casas"), vol: 0.7 },
  { nombre: "Swish bosque", sfx: "swish", en: palabra("casas", 6), vol: 0.3 },

  // 5. Paisajes: el texto calado cruza con aire.
  { nombre: "Whoosh paisajes", sfx: "whoosh", en: desde("paisajes") - 6, vol: 0.5 },
  { nombre: "Swish niebla", sfx: "swish", en: palabra("paisajes", 5), vol: 0.3 },

  // 6. Marca: reverso, golpe grande y campanas cuando la luz barre el logo.
  { nombre: "Reverso al logo", sfx: "reverso", en: desde("marca") - REVERSO, vol: 0.6 },
  { nombre: "Golpe logo", sfx: "impacto", en: desde("marca"), vol: 0.4 },
  { nombre: "Sub logo", sfx: "subdrop", en: desde("marca"), vol: 0.35 },
  { nombre: "Barrido de luz", sfx: "brillo", en: desde("marca") + 14, vol: 0.55 },

  // 7. CTA: el correo y el Instagram aparecen con un pop.
  { nombre: "Whoosh cierre", sfx: "whoosh", en: desde("cta") - 6, vol: 0.4 },
  ...palabras("cta").map((en, i) => ({ nombre: `Palabra cierre ${i + 1}`, sfx: "tick" as Sfx, en, vol: 0.2 })),
  { nombre: "Pop correo", sfx: "pop", en: palabra("cta", 1), vol: 0.55 },
  { nombre: "Pop Instagram", sfx: "pop", en: palabra("cta", 1) + 7, vol: 0.45 },
];

export const Sonido: React.FC = () => (
  <>
    {EVENTOS.map((e) => (
      <Sequence key={e.nombre} name={e.nombre} from={Math.max(0, e.en)} layout="none">
        <Audio src={staticFile(`sfx/${e.sfx}.wav`)} volume={e.vol} />
      </Sequence>
    ))}
  </>
);
