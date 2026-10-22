import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SairaCondensed";

const { fontFamily } = loadFont("normal", { weights: ["300"], subsets: ["latin"] });

/**
 * Intro del logo para la web (preloader). Rehace el video original
 * Logo-Fondo/Logo.mp4 sin recortes, en horizontal (PC) y vertical (movil):
 *
 *   0.0-2.5s  primer plano del logo oscuro y metalico, una luz calida
 *             barre por detras
 *   2.5-3.4s  la camara se aleja hasta el logo completo, brillo plateado
 *   3.4-4.2s  el metal se apaga a blanco plano
 *   4.4-5.6s  aparece "ARQUITECTURA AL DESCUBIERTO" letra por letra
 *
 * Fondo negro puro: en la web se mezcla con `screen` sobre el mapa. Los
 * bordes se funden a negro para que nada quede cortado a la vista.
 */
const LOGO_W = 1659;
const LOGO_H = 478;
const LEMA = "ARQUITECTURA AL DESCUBIERTO";

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const IntroLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const vertical = height > width;

  // Logo completo: 86% del ancho en vertical, 42% en horizontal.
  const ancho = width * (vertical ? 0.86 : 0.46);
  const alto = (ancho * LOGO_H) / LOGO_W;

  // Camara: arranca muy cerca sobre "TR/A", deriva lento y se aleja.
  const cerca = vertical ? 2.9 : 3.6;
  const escala = interpolate(t, [0, 2.5, 3.4], [cerca * 1.06, cerca, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => x,
  });
  const alejar = interpolate(t, [2.5, 3.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const escalaFinal = t < 2.5 ? escala : cerca + (1 - cerca) * alejar;
  // Punto de enfoque del primer plano (fraccion del ancho del logo, desde el centro)
  const foco = interpolate(t, [0, 2.5], [0.12, 0.05], { extrapolateRight: "clamp" }) * (1 - alejar);

  // Luz calida que barre detras del logo
  const luzX = interpolate(t, [0, 2.6], [-0.35, 0.55], { extrapolateRight: "clamp" });
  const luzOp = interpolate(t, [0, 0.4, 2.2, 3.2], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Metal oscuro -> plateado -> blanco plano
  const metal = interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const blanco = interpolate(t, [3.3, 4.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const brilloX = interpolate(t, [0, 3.4], [-60, 160], { extrapolateRight: "clamp" });

  // Lema
  const lemaY = vertical ? height * 0.5 + alto * 0.5 + height * 0.12 : height * 0.5 + alto * 0.5 + height * 0.16;
  const lemaSize = vertical ? width * 0.05 : width * 0.03;

  const mascara = {
    WebkitMaskImage: `url(${staticFile("logo/contraluz.png")})`,
    maskImage: `url(${staticFile("logo/contraluz.png")})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  } as const;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          // Bordes que se funden a negro: el primer plano nunca muestra un corte duro.
          WebkitMaskImage: vertical
            ? "linear-gradient(90deg, transparent 0%, #000 9%, #000 91%, transparent 100%)"
            : "radial-gradient(ellipse 54% 50% at 50% 50%, #000 45%, transparent 100%)",
          maskImage: vertical
            ? "linear-gradient(90deg, transparent 0%, #000 9%, #000 91%, transparent 100%)"
            : "radial-gradient(ellipse 54% 50% at 50% 50%, #000 45%, transparent 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: ancho,
            height: alto,
            transform: `translate(-50%, -50%) translateX(${-foco * ancho * escalaFinal}px) scale(${escalaFinal})`,
          }}
        >
          {/* Halo calido detras de las letras */}
          <div
            style={{
              position: "absolute",
              left: `${luzX * 100}%`,
              top: "50%",
              width: "70%",
              height: "220%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse at center, rgba(236,222,196,0.75) 0%, rgba(217,190,140,0.25) 35%, transparent 70%)",
              filter: "blur(30px)",
              opacity: luzOp,
            }}
          />

          {/* Bisel: el logo claro asoma 1.5px por debajo del relleno oscuro */}
          <Img
            src={staticFile("logo/contraluz.png")}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: metal * interpolate(t, [0, 0.6, 3.0], [0.25, 0.85, 1], { extrapolateRight: "clamp" }),
              transform: `translate(${1.5 / escalaFinal}px, ${1.5 / escalaFinal}px)`,
              filter: "brightness(1.1)",
            }}
          />
          {/* Letras metalicas: degradado oscuro con un brillo que cruza */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              ...mascara,
              transform: `translate(${-1.5 / escalaFinal}px, ${-1.5 / escalaFinal}px)`,
              opacity: metal,
              background: `linear-gradient(100deg, #030303 0%, #0e0e0e ${brilloX - 30}%, #5e5b56 ${brilloX - 6}%, #e9e4da ${brilloX}%, #5e5b56 ${brilloX + 6}%, #0e0e0e ${brilloX + 30}%, #030303 100%), linear-gradient(180deg, #1c1c1c, #050505)`,
              backgroundBlendMode: "screen",
            }}
          />
          {/* Filo de luz en los bordes de las letras durante el barrido */}
          <Img
            src={staticFile("logo/contraluz.png")}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: luzOp * 0.6 * (1 - blanco),
              filter: "blur(1.2px) brightness(1.4)",
              mixBlendMode: "screen",
              WebkitMaskImage: `radial-gradient(ellipse 35% 120% at ${luzX * 100}% 50%, #000 0%, transparent 100%)`,
              maskImage: `radial-gradient(ellipse 35% 120% at ${luzX * 100}% 50%, #000 0%, transparent 100%)`,
            }}
          />
          {/* Blanco plano final */}
          <div style={{ position: "absolute", inset: 0, ...mascara, background: "#fff", opacity: blanco }} />
        </div>
      </AbsoluteFill>

      {/* Lema, letra por letra */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: lemaY,
          textAlign: "center",
          fontFamily,
          fontWeight: 300,
          fontSize: lemaSize,
          letterSpacing: "0.16em",
          color: "#fff",
          WebkitFontSmoothing: "antialiased",
          whiteSpace: "nowrap",
        }}
      >
        {LEMA.split("").map((c, i) => {
          const op = interpolate(t, [4.4 + i * 0.04, 4.4 + i * 0.04 + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ opacity: op }}>
              {c}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
