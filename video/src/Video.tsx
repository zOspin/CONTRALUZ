import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ENTRADA_VOZ_MS, ESCENAS, FPS, TRAMOS_VOZ, escena } from "./datos";
import { Casas, Cifras, Cta, Escuelas, Gancho, Marca, Materia, Paisajes } from "./escenas";
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
      <div style={{ fontFamily: FUENTE.display, fontSize: 62, color: COLOR.bone }}>
        CONTRA<span style={{ color: COLOR.ember }}>/</span>LUZ
      </div>
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
  const hablando = TRAMOS_VOZ.some(([a, b]) => f >= a - 3 && f <= b + 4);
  return hablando ? 0.32 : 0.75;
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
      <Sequence name="Cifras" from={escena("cifras").desde} durationInFrames={escena("cifras").frames}>
        <Cifras />
      </Sequence>
      <Sequence name="Marca" from={escena("marca").desde} durationInFrames={escena("marca").frames}>
        <Marca />
      </Sequence>
      <Sequence name="Cta" from={escena("cta").desde} durationInFrames={escena("cta").frames}>
        <Cta />
      </Sequence>

      <Cabecera />
      <Progreso />

      {/* Audio: musica con ducking, voz por escena y whoosh antes de cada corte */}
      <Audio name="Musica" src={staticFile("musica.wav")} volume={(f) => volumenMusica(f)} durationInFrames={durationInFrames} />
      {ESCENAS.map((e) => (
        <Sequence key={`voz-${e.id}`} name={`Voz ${e.id}`} from={e.desde + voz} layout="none">
          <Audio src={staticFile(`voz/${e.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {ESCENAS.slice(1).map((e) => (
        <Sequence key={`sfx-${e.id}`} name={`Whoosh ${e.id}`} from={Math.max(0, e.desde - 7)} layout="none">
          <Audio src="https://remotion.media/whoosh.wav" volume={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
