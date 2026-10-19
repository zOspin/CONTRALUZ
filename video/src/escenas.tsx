import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
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
/* 6. CIFRAS: contadores sobre la grilla del plano                   */
/* ---------------------------------------------------------------- */
const Contador: React.FC<{ hasta: number; en: number; etiqueta: string }> = ({
  hasta,
  en,
  etiqueta,
}) => {
  const frame = useCurrentFrame();
  const valor = Math.round(
    interpolate(frame, [en, en + 16], [0, hasta], { ...clamp, easing: Easing.out(Easing.cubic) }),
  );
  return (
    <div
      style={{
        opacity: interpolate(frame, [en - 1, en + 2], [0, 1], clamp),
        translate: interpolate(frame, [en, en + 8], ["0px 50px", "0px 0px"], { ...clamp, easing: SALIDA }),
      }}
    >
      <div
        style={{
          fontFamily: FUENTE.display,
          fontSize: 400,
          lineHeight: 0.82,
          color: COLOR.bone,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(valor).padStart(2, "0")}
      </div>
      <Linea en={en + 6} ancho={520} style={{ marginTop: 16 }} />
      <div
        style={{
          marginTop: 22,
          fontFamily: FUENTE.mono,
          fontSize: 40,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLOR.bone,
        }}
      >
        {etiqueta}
      </div>
    </div>
  );
};

export const Cifras: React.FC = () => {
  const e = escena("cifras");
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <Foto src="preescolar-patio" frames={e.frames} oscurecer={0.78} golpe={false} />
      <Grilla en={0} opacidad={0.14} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          gap: 120,
          padding: `0 ${MARGEN.lado + 20}px`,
        }}
      >
        <Contador hasta={12} en={framePalabra(e, 0)} etiqueta="Años de estudio" />
        <Contador hasta={38} en={framePalabra(e, 2)} etiqueta="Proyectos construidos" />
      </AbsoluteFill>
      <Destello fuerza={0.5} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* 7. MARCA: el logotipo se revela letra a letra y lo barre la luz   */
/* ---------------------------------------------------------------- */
const Letras: React.FC<{ texto: string; en: number; acento?: number }> = ({ texto, en, acento }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", overflow: "hidden", paddingBottom: 8 }}>
      {texto.split("").map((l, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            color: i === acento ? COLOR.ember : COLOR.bone,
            translate: interpolate(frame, [en + i * 1.5, en + i * 1.5 + 10], ["0% 110%", "0% 0%"], {
              ...clamp,
              easing: SALIDA,
            }),
          }}
        >
          {l}
        </span>
      ))}
    </div>
  );
};

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
        <div style={{ fontFamily: FUENTE.display, fontSize: 290, lineHeight: 0.84, textAlign: "center" }}>
          <Letras texto="CONTRA" en={2} />
          <Letras texto="/LUZ" en={8} acento={0} />
        </div>
        <div style={{ marginTop: 60, width: 960 }}>
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
/* 8. CTA: invitacion + correo                                       */
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
            padding: "26px 54px",
            fontFamily: FUENTE.mono,
            fontSize: 44,
            color: COLOR.bone,
            background: "rgba(10,10,10,0.55)",
            opacity: interpolate(frame, [en, en + 4], [0, 1], clamp),
            scale: interpolate(frame, [en, en + 8], [0.8, 1], { ...clamp, easing: SALIDA }),
          }}
        >
          estudio@contraluz.co
        </div>
      </AbsoluteFill>
      <Destello fuerza={0.6} />
    </AbsoluteFill>
  );
};
