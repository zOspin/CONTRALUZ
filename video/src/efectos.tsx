import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BASE, FPS, aBase, type Palabra } from "./datos";
import { COLOR, FUENTE } from "./tema";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Frame actual en la base de 30 fps (con decimales a 60 fps). */
export const useTiempo = () => (useCurrentFrame() * BASE) / FPS;
const SALIDA = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Foto a pantalla completa con "golpe" de zoom al entrar y empuje continuo.
 * Los recortes miden 1242x2208: el zoom maximo no amplia la imagen.
 */
export const Foto: React.FC<{
  src: string;
  frames: number;
  golpe?: boolean;
  origen?: string;
  oscurecer?: number;
}> = ({ src, frames, golpe = true, origen = "50% 50%", oscurecer = 0 }) => {
  const frame = useTiempo();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLOR.void }}>
      <Img
        src={staticFile(`img/${src}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: origen,
          scale: golpe
            ? interpolate(frame, [0, 7, aBase(frames)], [1.13, 1.03, 1.12], {
                ...clamp,
                easing: SALIDA,
              })
            : interpolate(frame, [0, aBase(frames)], [1.0, 1.1], clamp),
        }}
      />
      {oscurecer ? (
        <AbsoluteFill style={{ backgroundColor: `rgba(10,10,10,${oscurecer})` }} />
      ) : null}
    </AbsoluteFill>
  );
};

/** Destello en el corte: luz ambar que se apaga en pocos frames. */
export const Destello: React.FC<{ en?: number; fuerza?: number }> = ({ en = 0, fuerza = 0.85 }) => {
  const frame = useTiempo();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, #fff6e8 0%, ${COLOR.ember} 55%, rgba(217,161,91,0) 100%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
        opacity: interpolate(frame, [en, en + 1, en + 6], [0, fuerza, 0], clamp),
      }}
    />
  );
};

/** Sombra para que el texto se lea sobre cualquier foto. */
export const Velo: React.FC<{ arriba?: number; abajo?: number; centro?: number }> = ({
  arriba = 0.75,
  abajo = 0.85,
  centro = 0,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(to bottom, rgba(10,10,10,${arriba}) 0%, rgba(10,10,10,${centro}) 30%, rgba(10,10,10,${centro}) 55%, rgba(10,10,10,${abajo}) 100%)`,
    }}
  />
);

/**
 * Texto cinetico: cada palabra aparece cuando la voz la dice, con un golpe
 * de escala. Las que aun no se dijeron ocupan su lugar (no salta el layout).
 */
export const Palabras: React.FC<{
  palabras: Palabra[];
  acentos?: string[];
  tamano?: number;
  style?: React.CSSProperties;
  saltos?: number[];
  /** Todo en serif italica (frases de firma), en vez de display en mayusculas. */
  serif?: boolean;
}> = ({ palabras, acentos = [], tamano = 150, style, saltos = [], serif = false }) => {
  const frame = useTiempo();
  const limpia = (s: string) => s.toLowerCase().replace(/[^a-záéíóúñ]/g, "");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: `0 ${tamano * 0.2}px`,
        fontFamily: FUENTE.display,
        fontSize: tamano,
        lineHeight: 0.92,
        textTransform: "uppercase",
        textAlign: "center",
        color: COLOR.bone,
        textShadow: "0 6px 40px rgba(0,0,0,0.55)",
        ...style,
      }}
    >
      {palabras.map((p, i) => {
        const en = (p.startMs / 1000) * BASE - 1;
        const acento = acentos.includes(limpia(p.text));
        const italica = serif || acento;
        return (
          <span key={i} style={{ display: "contents" }}>
            <span
              style={{
                display: "inline-block",
                color: acento ? COLOR.ember : COLOR.bone,
                fontFamily: italica ? FUENTE.serif : FUENTE.display,
                fontStyle: italica ? "italic" : "normal",
                textTransform: italica ? "none" : "uppercase",
                fontSize: italica && !serif ? tamano * 0.92 : tamano,
                opacity: interpolate(frame, [en, en + 2], [0, 1], clamp),
                scale: interpolate(frame, [en, en + 5], [1.35, 1], {
                  ...clamp,
                  easing: SALIDA,
                }),
                translate: interpolate(frame, [en, en + 5], ["0px 30px", "0px 0px"], {
                  ...clamp,
                  easing: SALIDA,
                }),
              }}
            >
              {p.text}
            </span>
            {saltos.includes(i) ? <span style={{ flexBasis: "100%", height: 0 }} /> : null}
          </span>
        );
      })}
    </div>
  );
};

/** Linea ambar que se dibuja de izquierda a derecha. */
export const Linea: React.FC<{ en: number; ancho: number; style?: React.CSSProperties }> = ({
  en,
  ancho,
  style,
}) => {
  const frame = useTiempo();
  return (
    <div
      style={{
        height: 4,
        width: ancho,
        background: COLOR.ember,
        transformOrigin: "left",
        scale: interpolate(frame, [en, en + 9], ["0 1", "1 1"], { ...clamp, easing: SALIDA }),
        ...style,
      }}
    />
  );
};

/** Haz de luz diagonal que barre la pantalla. */
export const Barrido: React.FC<{ en: number; dur?: number }> = ({ en, dur = 18 }) => {
  const frame = useTiempo();
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          height: "140%",
          width: 360,
          rotate: "18deg",
          background: `linear-gradient(90deg, rgba(217,161,91,0) 0%, rgba(217,161,91,0.55) 40%, rgba(255,246,232,0.9) 50%, rgba(217,161,91,0.55) 60%, rgba(217,161,91,0) 100%)`,
          filter: "blur(18px)",
          translate: interpolate(frame, [en, en + dur], [`${-500}px 0px`, `${width + 300}px 0px`], {
            ...clamp,
            easing: Easing.bezier(0.45, 0, 0.2, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};

/** Grilla de plano arquitectonico: lineas verticales que se trazan. */
export const Grilla: React.FC<{ en?: number; opacidad?: number }> = ({ en = 0, opacidad = 0.12 }) => {
  const frame = useTiempo();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            top: 0,
            width: 2,
            height: "100%",
            background: `rgba(236,232,225,${opacidad})`,
            transformOrigin: i % 2 ? "bottom" : "top",
            scale: interpolate(frame, [en + i * 2, en + i * 2 + 14], ["1 0", "1 1"], {
              ...clamp,
              easing: SALIDA,
            }),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
