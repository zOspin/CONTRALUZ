import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ESCENAS, TRANSICION } from "./datos";
import { Escena, EscenaCierre, EscenaCta } from "./Escena";
import { COLOR, FUENTE, MARGEN } from "./tema";

/** Marca fija arriba a la izquierda (se oculta en el cierre, que ya la muestra grande). */
const Marca: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cierre = durationInFrames - ESCENAS[ESCENAS.length - 1].frames - ESCENAS[ESCENAS.length - 2].frames;
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEN.lado,
        top: MARGEN.arriba,
        fontFamily: FUENTE.display,
        fontSize: 58,
        letterSpacing: "0.02em",
        color: COLOR.bone,
        opacity: interpolate(frame, [cierre, cierre + 10], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      CONTRA<span style={{ color: COLOR.ember }}>/</span>LUZ
    </div>
  );
};

/** Barra fina de progreso abajo: el recorrido del video, como en la web. */
const Progreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: 6,
        width: "100%",
        background: COLOR.ember,
        transformOrigin: "left",
        scale: `${frame / (durationInFrames - 1)} 1`,
      }}
    />
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.void }}>
      <TransitionSeries name="Escenas">
        {ESCENAS.map((e, i) => (
          <Fragment key={e.id}>
            {i > 0 ? (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSICION })}
              />
            ) : null}
            <TransitionSeries.Sequence name={e.id} durationInFrames={e.frames}>
              {e.id === "cierre" ? (
                <EscenaCierre escena={e} />
              ) : e.id === "cta" ? (
                <EscenaCta escena={e} />
              ) : (
                <Escena escena={e} />
              )}
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Marca />
      <Progreso />
    </AbsoluteFill>
  );
};
