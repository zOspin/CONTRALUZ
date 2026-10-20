import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ENTRADA_VOZ_MS, ESCENAS, FPS, TRAMOS_VOZ, escena } from "./datos";
import { Casas, Cta, Escuelas, Gancho, Marca, Materia, Paisajes } from "./escenas";
import { Sonido } from "./Sonido";
import { COLOR, FUENTE, MARGEN } from "./tema";

/** Marca y numero de escena arriba; se ocultan cuando el logo ocupa la pantalla. */
const Cabecera: React.FC = () => {
  const frame = useCurrentFrame();
  const marca = escena("marca");
  const actual = ESCENAS.findIndex((e) => frame >= e.desde && frame < e.desde + e.frames);
  const visible =
    frame >= 12 && !(frame >= marca.desde && frame < marca.desde + marca.frames) ? 1 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEN.lado,
        right: MARGEN.lado,
        top: MARGEN.arriba,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: visible,
      }}
    >
      <Img src={staticFile("logo/contraluz-compacto.png")} style={{ width: 290 }} />
      <div style={{ fontFamily: FUENTE.mono, fontSize: 34, letterSpacing: "0.2em", color: COLOR.bone }}>
        <span style={{ color: COLOR.ember }}>{String(Math.max(1, actual + 1)).padStart(2, "0")}</span>
        {" / "}
        {String(ESCENAS.length).padStart(2, "0")}
      </div>
    </div>
  );
};

const Progreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: 8,
        width: "100%",
        background: COLOR.ember,
        transformOrigin: "left",
        scale: `${frame / (durationInFrames - 1)} 1`,
      }}
    />
  );
};

/** La musica baja debajo de la voz y sube en los huecos. */
const volumenMusica = (f: number) => {
  // Distancia (en frames) al tramo de voz mas cercano: 0 dentro de la voz.
  const dist = Math.min(
    ...TRAMOS_VOZ.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)),
  );
  // Baja a 0.34 bajo la voz y sube a 0.8 en 6 frames, sin saltos.
  const k = Math.min(1, Math.max(0, (dist - 2) / 6));
  return 0.34 + (0.8 - 0.34) * k;
};

export const Video: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const voz = Math.round((ENTRADA_VOZ_MS / 1000) * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      {/* Escenas: cortes secos sobre la grilla de beats */}
      <Sequence name="Gancho" from={escena("gancho").desde} durationInFrames={escena("gancho").frames}>
        <Gancho />
      </Sequence>
      <Sequence name="Materia" from={escena("materia").desde} durationInFrames={escena("materia").frames}>
        <Materia />
      </Sequence>
      <Sequence name="Escuelas" from={escena("escuelas").desde} durationInFrames={escena("escuelas").frames}>
        <Escuelas />
      </Sequence>
      <Sequence name="Casas" from={escena("casas").desde} durationInFrames={escena("casas").frames}>
        <Casas />
      </Sequence>
      <Sequence name="Paisajes" from={escena("paisajes").desde} durationInFrames={escena("paisajes").frames}>
        <Paisajes />
      </Sequence>
      <Sequence name="Marca" from={escena("marca").desde} durationInFrames={escena("marca").frames}>
        <Marca />
      </Sequence>
      <Sequence name="Cta" from={escena("cta").desde} durationInFrames={escena("cta").frames}>
        <Cta />
      </Sequence>

      <Cabecera />
      <Progreso />

      {/* Audio: musica con ducking, voz por escena y diseno sonoro */}
      <Audio name="Musica" src={staticFile("musica.wav")} volume={(f) => volumenMusica(f)} durationInFrames={durationInFrames} />
      {ESCENAS.map((e) => (
        <Sequence key={`voz-${e.id}`} name={`Voz ${e.id}`} from={e.desde + voz} layout="none">
          <Audio src={staticFile(`voz/${e.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      <Sonido />
    </AbsoluteFill>
  );
};
