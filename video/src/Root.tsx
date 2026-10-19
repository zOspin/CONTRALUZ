import { Composition } from "remotion";
import { DURACION_TOTAL, FPS } from "./datos";
import { Video } from "./Video";

/**
 * Reel de marketing vertical (Instagram/TikTok), 1080x1920, cortes al beat.
 * La duracion sale de los beats de guion.json: si lo cambias, corre
 * `python scripts/voz.py` y `python scripts/musica.py`.
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
