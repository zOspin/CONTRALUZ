import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

/**
 * Una imagen a pantalla completa con empuje lento de camara (Ken Burns).
 * Los recortes miden 1242x2208: aun en el zoom maximo (1.12) la imagen no
 * se amplia por encima de su tamano real.
 */
export const Fondo: React.FC<{ src: string; frames: number; desde?: number }> = ({
  src,
  frames,
  desde = 1.0,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`img/${src}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, frames], [desde, desde + 0.12], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.67, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};
