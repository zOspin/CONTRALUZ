import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FUENTE, MARGEN } from "./tema";

/**
 * Subtitulos grandes estilo reel: la frase aparece por bloques de pocas
 * palabras y la palabra que se esta diciendo se enciende en ember.
 */
export const Subtitulos: React.FC<{ subtitulos: Caption[]; abajo?: number }> = ({
  subtitulos,
  abajo = MARGEN.abajo + 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const { pages } = createTikTokStyleCaptions({
    captions: subtitulos,
    combineTokensWithinMilliseconds: 900,
  });
  const pagina = pages.find((p, i) => {
    const fin = pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 600;
    return ms >= p.startMs && ms < fin;
  });
  if (!pagina) return null;

  const desdePagina = ((ms - pagina.startMs) / 1000) * fps;

  return (
    <div
      style={{
        position: "absolute",
        left: MARGEN.lado,
        right: MARGEN.lado,
        bottom: abajo,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
        fontFamily: FUENTE.display,
        fontSize: 112,
        lineHeight: 0.98,
        textTransform: "uppercase",
        textAlign: "center",
        textShadow: "0 4px 30px rgba(0,0,0,0.65)",
        opacity: interpolate(desdePagina, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(desdePagina, [0, 8], ["0px 26px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {pagina.tokens.map((t) => {
        const activa = ms >= t.fromMs && ms < t.toMs + 120;
        const dicha = ms >= t.fromMs;
        return (
          <span
            key={t.fromMs}
            style={{
              color: activa ? COLOR.ember : COLOR.bone,
              opacity: dicha ? 1 : 0.35,
            }}
          >
            {t.text.trim()}
          </span>
        );
      })}
    </div>
  );
};
