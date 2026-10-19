import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ENTRADA_VOZ_MS, type Escena as EscenaDatos } from "./datos";
import { Fondo } from "./Fondo";
import { Subtitulos } from "./Subtitulos";
import { COLOR, FUENTE, MARGEN } from "./tema";

/** Degradados de sombra: sostienen el texto sin apagar la foto. */
const Velo: React.FC<{ fuerte?: boolean }> = ({ fuerte }) => (
  <AbsoluteFill
    style={{
      // Arriba mas oscuro: marca y rotulo quedan sobre cielos claros.
      background: `linear-gradient(to bottom, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.35) 14%, rgba(10,10,10,0) 26%, rgba(10,10,10,0) 48%, rgba(10,10,10,${
        fuerte ? 0.92 : 0.78
      }) 100%)`,
    }}
  />
);

/** Rotulo del proyecto: linea ember + nombre en mono, arriba a la izquierda. */
const Rotulo: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEN.lado,
        top: MARGEN.arriba + 110,
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: FUENTE.mono,
        fontSize: 40,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: COLOR.bone,
        textShadow: "0 2px 18px rgba(0,0,0,0.7)",
        opacity: interpolate(frame, [0.2 * fps, 0.7 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <span
        style={{
          height: 3,
          width: 70,
          background: COLOR.ember,
          transformOrigin: "left",
          scale: interpolate(frame, [0.2 * fps, 0.9 * fps], ["0 1", "1 1"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      {texto}
    </div>
  );
};

/** Escena estandar: foto(s) con empuje lento, rotulo opcional y subtitulos. */
export const Escena: React.FC<{ escena: EscenaDatos }> = ({ escena }) => {
  const { fps } = useVideoConfig();
  const tramo = Math.ceil(escena.frames / escena.imagenes.length);

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      {escena.imagenes.map((img, i) => (
        <Sequence key={img} name={img} from={i * tramo} durationInFrames={tramo}>
          <Fondo src={img} frames={tramo} />
        </Sequence>
      ))}
      <Velo />
      {escena.rotulo ? <Rotulo texto={escena.rotulo} /> : null}
      <Subtitulos subtitulos={escena.subtitulos} />
      <Sequence name="Voz" from={Math.round((ENTRADA_VOZ_MS / 1000) * fps)} layout="none">
        <Audio src={staticFile(`voz/${escena.id}.mp3`)} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Cierre: el logotipo grande sobre la casa al atardecer. */
export const EscenaCierre: React.FC<{ escena: EscenaDatos }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Fondo src={escena.imagenes[0]} frames={escena.frames} />
      <Velo fuerte />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 260,
        }}
      >
        <div
          style={{
            fontFamily: FUENTE.display,
            fontSize: 230,
            lineHeight: 0.85,
            color: COLOR.bone,
            textAlign: "center",
            textShadow: "0 6px 50px rgba(0,0,0,0.6)",
            opacity: interpolate(frame, [0.1 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0.1 * fps, 1.4 * fps], [1.08, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            }),
          }}
        >
          CONTRA
          <br />
          <span style={{ color: COLOR.ember }}>/</span>LUZ
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: FUENTE.serif,
            fontStyle: "italic",
            fontSize: 58,
            color: COLOR.bone,
            opacity: interpolate(frame, [1.2 * fps, 1.9 * fps], [0, 0.9], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Arquitectura moldeada por la luz.
        </div>
      </AbsoluteFill>
      <Sequence name="Voz" from={Math.round((ENTRADA_VOZ_MS / 1000) * fps)} layout="none">
        <Audio src={staticFile(`voz/${escena.id}.mp3`)} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Llamado a la accion: correo del estudio + subtitulos. */
export const EscenaCta: React.FC<{ escena: EscenaDatos }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Fondo src={escena.imagenes[0]} frames={escena.frames} />
      <AbsoluteFill style={{ backgroundColor: "rgba(10,10,10,0.55)" }} />
      <Velo fuerte />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", paddingBottom: 380 }}
      >
        <div
          style={{
            fontFamily: FUENTE.mono,
            fontSize: 34,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: COLOR.ember,
            opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Hablemos
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FUENTE.serif,
            fontStyle: "italic",
            fontSize: 66,
            color: COLOR.bone,
            opacity: interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [0.5 * fps, 1.4 * fps], ["0px 24px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          estudio@contraluz.co
        </div>
        <div
          style={{
            marginTop: 38,
            height: 3,
            width: 160,
            background: COLOR.ember,
            scale: interpolate(frame, [0.9 * fps, 1.8 * fps], ["0 1", "1 1"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
      </AbsoluteFill>
      <Subtitulos subtitulos={escena.subtitulos} />
      <Sequence name="Voz" from={Math.round((ENTRADA_VOZ_MS / 1000) * fps)} layout="none">
        <Audio src={staticFile(`voz/${escena.id}.mp3`)} />
      </Sequence>
    </AbsoluteFill>
  );
};
