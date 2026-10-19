import { Composition } from "remotion";
import { DURACION_TOTAL, FPS } from "./datos";
import { Video } from "./Video";

/**
 * Video de marketing vertical (reels/TikTok), 1080x1920.
 * La duracion sale de la voz generada: si cambias guion.json, corre
 * `python scripts/voz.py` y el video se ajusta solo.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Contraluz"
        component={Video}
        durationInFrames={DURACION_TOTAL}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
