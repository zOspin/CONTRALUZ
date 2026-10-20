import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { escena, framePalabra } from "./datos";
import { Barrido, Destello, Foto, Grilla, Linea, Palabras, Velo } from "./efectos";
import { COLOR, FUENTE, MARGEN } from "./tema";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SALIDA = Easing.bezier(0.16, 1, 0.3, 1);

/** Rotulo de proyecto en mono, con linea ambar. */
const Rotulo: React.FC<{ texto: string; en?: number }> = ({ texto, en = 4 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEN.lado,
        top: MARGEN.arriba + 120,
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: FUENTE.mono,
        fontSize: 38,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: COLOR.bone,
        textShadow: "0 2px 18px rgba(0,0,0,0.7)",
        opacity: interpolate(frame, [en, en + 5], [0, 1], clamp),
        translate: interpolate(frame, [en, en + 8], ["-30px 0px", "0px 0px"], {
          ...clamp,
          easing: SALIDA,
        }),
      }}
    >
      <Linea en={en} ancho={70} />
      {texto}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 1. GANCHO: una rendija de luz se abre y deja ver la casa de noche */
/* ---------------------------------------------------------------- */
export const Gancho: React.FC = () => {
  const e = escena("gancho");
  const frame = useCurrentFrame();
  const apertura = interpolate(frame, [3, 20], [50, 0], { ...clamp, easing: SALIDA });
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <AbsoluteFill style={{ clipPath: `inset(${apertura}% 0 ${apertura}% 0)` }}>
        <Foto src="hecate-noche" frames={e.frames} golpe={false} />
        <Velo arriba={0.7} abajo={0.75} centro={0.55} />
      </AbsoluteFill>
      {/* La linea de luz que se convierte en rendija */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${apertura}%`,
          height: 4,
          background: COLOR.ember,
          boxShadow: `0 0 40px 10px ${COLOR.ember}`,
          scale: interpolate(frame, [0, 6], ["0 1", "1 1"], { ...clamp, easing: SALIDA }),
          opacity: interpolate(frame, [16, 22], [1, 0], clamp),
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${MARGEN.lado}px` }}>
        {/* La voz no trae signos: se agregan los de la pregunta. */}
        <Palabras
          palabras={e.palabras.map((p, i, arr) => ({
            ...p,
            text: (i === 0 ? "¿" : "") + p.text + (i === arr.length - 1 ? "?" : ""),
          }))}
          acentos={["luz"]}
          tamano={148}
          saltos={[3, 4]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 2. MATERIA: tres palabras gigantes, tres cortes                   */
/* ---------------------------------------------------------------- */
const PalabraGigante: React.FC<{ texto: string; indice: string }> = ({ texto, indice }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: FUENTE.mono,
          fontSize: 36,
          letterSpacing: "0.35em",
          color: COLOR.ember,
          marginBottom: 10,
          opacity: interpolate(frame, [2, 6], [0, 1], clamp),
        }}
      >
        {indice}
      </div>
      <div
        style={{
          fontFamily: FUENTE.display,
          fontSize: 330,
          lineHeight: 0.85,
          color: COLOR.bone,
          textShadow: "0 10px 60px rgba(0,0,0,0.6)",
          letterSpacing: interpolate(frame, [0, 30], ["0.02em", "0.09em"], clamp),
          scale: interpolate(frame, [0, 5], [1.6, 1], { ...clamp, easing: SALIDA }),
          opacity: interpolate(frame, [0, 2], [0, 1], clamp),
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

export const Materia: React.FC = () => {
  const e = escena("materia");
  const cortes = [0, framePalabra(e, 1) - 1, framePalabra(e, 2) - 1, e.frames];
  const tomas = [
    { img: "liuto-niebla", palabra: "LUZ", n: "01", oscuro: 0.25 },
    { img: "spa-noche", palabra: "SOMBRA", n: "02", oscuro: 0.35 },
    { img: "kiralooro-luz", palabra: "MATERIA", n: "03", oscuro: 0.3 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      {tomas.map((t, i) => (
        <Sequence key={t.palabra} name={t.palabra} from={cortes[i]} durationInFrames={cortes[i + 1] - cortes[i]}>
          <Foto src={t.img} frames={cortes[i + 1] - cortes[i]} oscurecer={t.oscuro} />
          <Velo arriba={0.6} abajo={0.6} />
          <PalabraGigante texto={t.palabra} indice={t.n} />
          <Destello fuerza={i === 0 ? 0.6 : 0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 3. ESCUELAS: pantalla dividida en tres paneles                    */
/* ---------------------------------------------------------------- */
const Panel: React.FC<{ src: string; i: number; frames: number }> = ({ src, i, frames }) => {
  const frame = useCurrentFrame();
  const en = i * 3;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${(i * 100) / 3}%`,
        width: `${100 / 3}%`,
        overflow: "hidden",
        borderRight: i < 2 ? `3px solid ${COLOR.void}` : undefined,
        translate: interpolate(frame, [en, en + 9], [i % 2 ? "0% -100%" : "0% 100%", "0% 0%"], {
          ...clamp,
          easing: SALIDA,
        }),
      }}
    >
      <div style={{ position: "absolute", inset: 0, left: "-100%", right: "-100%" }}>
        <Foto src={src} frames={frames} golpe={false} />
      </div>
    </div>
  );
};

export const Escuelas: React.FC = () => {
  const e = escena("escuelas");
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Panel src="preescolar-patio" i={0} frames={e.frames} />
      <Panel src="ana-frank-acceso" i={1} frames={e.frames} />
      <Panel src="kiralooro-entrada" i={2} frames={e.frames} />
      <Velo arriba={0.65} abajo={0.65} centro={0.3} />
      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${MARGEN.lado}px` }}>
        <Palabras palabras={e.palabras} acentos={["respiran"]} tamano={190} saltos={[1]} />
      </AbsoluteFill>
      <Rotulo texto="Educativo · 3 proyectos" en={10} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 4. CASAS: apertura circular sobre la casa en el bosque           */
/* ---------------------------------------------------------------- */
export const Casas: React.FC = () => {
  const e = escena("casas");
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <AbsoluteFill
        style={{
          clipPath: `circle(${interpolate(frame, [0, 11], [0, 120], { ...clamp, easing: SALIDA })}% at 50% 55%)`,
        }}
      >
        <Foto src="hecate-cascada" frames={e.frames} />
        <Velo />
      </AbsoluteFill>
      <Rotulo texto="Luz de Hecate" />
      <AbsoluteFill
        style={{ justifyContent: "flex-end", padding: `0 ${MARGEN.lado}px ${MARGEN.abajo + 40}px` }}
      >
        <Palabras palabras={e.palabras} acentos={["bosque"]} tamano={130} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 5. PAISAJES: texto calado gigante que cruza sobre la niebla       */
/* ---------------------------------------------------------------- */
export const Paisajes: React.FC = () => {
  const e = escena("paisajes");
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Foto src="liuto-lago" frames={e.frames} origen="58% 40%" />
      <Velo arriba={0.7} abajo={0.85} />
      <div
        style={{
          position: "absolute",
          top: "27%",
          whiteSpace: "nowrap",
          fontFamily: FUENTE.display,
          fontSize: 420,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `3px rgba(236,232,225,0.75)`,
          translate: interpolate(frame, [0, e.frames], ["120px 0px", "-760px 0px"], clamp),
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
        }}
      >
        HONG KONG
      </div>
      <Rotulo texto="Liuto — Centro de visitantes" />
      <AbsoluteFill
        style={{ justifyContent: "flex-end", padding: `0 ${MARGEN.lado}px ${MARGEN.abajo + 40}px` }}
      >
        <Palabras palabras={e.palabras} acentos={["niebla"]} tamano={130} />
      </AbsoluteFill>
      <Destello fuerza={0.6} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 6. MARCA: el logotipo se descubre de izquierda a derecha y lo     */
/*    barre la luz                                                   */
/* ---------------------------------------------------------------- */
export const Marca: React.FC = () => {
  const e = escena("marca");
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <AbsoluteFill style={{ opacity: interpolate(frame, [10, 40], [0, 0.42], clamp) }}>
        <Foto src="spa-atardecer" frames={e.frames} golpe={false} />
      </AbsoluteFill>
      <Grilla en={4} opacidad={0.08} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 120 }}>
        <Img
          src={staticFile("logo/contraluz.png")}
          style={{
            width: 900,
            clipPath: `inset(0 ${interpolate(frame, [2, 18], [100, 0], { ...clamp, easing: SALIDA })}% 0 0)`,
            scale: interpolate(frame, [2, 40], [1.06, 1], { ...clamp, easing: SALIDA }),
            filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.6))",
          }}
        />
        <div style={{ marginTop: 80, width: 960 }}>
          <Palabras
            palabras={e.palabras.slice(1)}
            acentos={["luz"]}
            tamano={62}
            serif
          />
        </div>
      </AbsoluteFill>
      <Barrido en={14} dur={22} />
      <Destello fuerza={0.7} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 7. CTA: invitacion + correo                                       */
/* ---------------------------------------------------------------- */
export const Cta: React.FC = () => {
  const e = escena("cta");
  const frame = useCurrentFrame();
  const en = framePalabra(e, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Foto src="spa-piscina" frames={e.frames} oscurecer={0.5} />
      <Velo arriba={0.7} abajo={0.9} centro={0.25} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", padding: `0 ${MARGEN.lado}px`, gap: 70 }}
      >
        <Palabras palabras={e.palabras} acentos={["tuyo"]} tamano={160} saltos={[0, 2]} />
        <div
          style={{
            border: `3px solid ${COLOR.ember}`,
            borderRadius: 999,
            padding: "24px 44px",
            fontFamily: FUENTE.mono,
            fontSize: 38,
            color: COLOR.bone,
            background: "rgba(10,10,10,0.55)",
            opacity: interpolate(frame, [en, en + 4], [0, 1], clamp),
            scale: interpolate(frame, [en, en + 8], [0.8, 1], { ...clamp, easing: SALIDA }),
          }}
        >
          contraluz.studio.arq@gmail.com
        </div>
        {/* Instagram: icono + usuario, entra medio beat despues del correo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginTop: -30,
            fontFamily: FUENTE.mono,
            fontSize: 42,
            color: COLOR.bone,
            opacity: interpolate(frame, [en + 7, en + 11], [0, 1], clamp),
            translate: interpolate(frame, [en + 7, en + 14], ["0px 24px", "0px 0px"], {
              ...clamp,
              easing: SALIDA,
            }),
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={58}
            height={58}
            fill="none"
            stroke={COLOR.ember}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="0.9" fill={COLOR.ember} stroke="none" />
          </svg>
          @contraluz.arq
        </div>
      </AbsoluteFill>
      <Destello fuerza={0.6} />
    </AbsoluteFill>
  );
};
