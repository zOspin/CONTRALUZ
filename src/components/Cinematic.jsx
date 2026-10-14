import { useRef, useState } from 'react';
import { motion, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { useLenisScrollBridge } from '../hooks/useScrollBridge';
import SmartImage from './SmartImage';
import { projects, localizeProject } from '../data/projects';
import { useLang, UI } from '../context/LanguageContext';

/**
 * CINEMATICA INTRO
 * ================
 * Reel a pantalla completa entre el preloader y el hero, manejado con scroll.
 * Pista de 400vh + visor fijo: cada plano entra con fundido y sale con un
 * lento zoom/paneo (Ken Burns). Todo es funcion pura del progreso de scroll,
 * asi que se puede avanzar y retroceder.
 *
 * Solo se animan opacity/scale/x (GPU). Con reduced-motion se muestra un
 * plano fijo con el titulo y el acceso directo al inicio.
 */

// Orden del reel: variedad de escala y luz entre los tres proyectos.
const SHOTS = [
  { src: '/proyectos/liuto-01.jpg', projectId: 'liuto' },
  { src: '/proyectos/liuto-03.jpg', projectId: 'liuto' },
  { src: '/proyectos/hecate-01.jpg', projectId: 'luz-de-hecate' },
  { src: '/proyectos/hecate-02.jpg', projectId: 'luz-de-hecate' },
  { src: '/proyectos/spa-01.jpg', projectId: 'spa' },
  { src: '/proyectos/spa-03.jpg', projectId: 'spa' },
  { src: '/proyectos/liuto-04.jpg', projectId: 'liuto' },
];

const N = SHOTS.length;

/** Un plano: fundido + zoom lento + paneo alternado. Hooks encapsulados. */
function CineShot({ progress, index, shot, caption }) {
  const start = index / N;
  const end = (index + 1) / N;
  const dir = index % 2 === 0 ? 1 : -1;
  const isFirst = index === 0;

  const opacity = useTransform(
    progress,
    isFirst ? [0, end - 0.07, end] : [start, start + 0.07, end - 0.07, end],
    isFirst ? [1, 1, 0] : [0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, end], [1.06, 1.18]);
  const x = useTransform(progress, [start, end], [-26 * dir, 26 * dir]);
  const capOpacity = useTransform(
    progress,
    [start + 0.02, start + 0.1, end - 0.1, end - 0.02],
    [0, 1, 1, 0]
  );

  return (
    <>
      <motion.div className="absolute inset-0" style={{ opacity, scale, x }}>
        <SmartImage
          base={shot.src}
          alt={caption.alt}
          className="h-full w-full object-cover"
          eager={index === 0}
          sizes="100vw"
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
      </motion.div>
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10"
        style={{ opacity: capOpacity }}
      >
        <div className="shell flex items-end justify-between pb-24 md:pb-28">
          <div>
            <p className="label text-ember">
              {String(index + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </p>
            <p className="display mt-3 text-[11vw] leading-[0.9] text-bone sm:text-[8vw] md:text-[4.5vw] 3xl:text-[4.5rem]">
              {caption.name}
            </p>
          </div>
          <p className="label hidden text-right sm:block">{caption.location}</p>
        </div>
      </motion.div>
    </>
  );
}

export default function Cinematic({ lenisRef }) {
  const trackRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];
  const progress = useLenisScrollBridge({ lenisRef, trackRef });
  const [shot, setShot] = useState(0);

  useMotionValueEvent(progress, 'change', (v) => {
    setShot(Math.min(N - 1, Math.max(0, Math.floor(v * N))));
  });

  // Barras de cine: entran al empezar el reel.
  const barScale = useTransform(progress, [0, 0.04], [0, 1]);
  // Velo final: funde a negro antes de entregar al hero.
  const endVeil = useTransform(progress, [0.94, 1], [0, 1]);
  // Hint de scroll: se apaga al avanzar.
  const hintOpacity = useTransform(progress, [0, 0.06], [1, 0]);

  const skip = (e) => {
    e.preventDefault();
    const target = document.getElementById('inicio');
    if (!target) return;
    const lenis = lenisRef?.current ?? window.__lenis;
    if (lenis) lenis.scrollTo(target, { duration: 1.8 });
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  if (prefersReduced) {
    const first = localizeProject(projects[0], lang);
    return (
      <section aria-label={t.reelKicker} className="relative">
        <div className="relative h-[70vh] overflow-hidden">
          <SmartImage
            base={SHOTS[0].src}
            alt={first.alt}
            className="h-full w-full object-cover"
            eager
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-void/40" />
          <div className="shell absolute inset-x-0 bottom-0 flex items-end justify-between pb-10">
            <p className="display text-5xl text-bone">{first.name}</p>
            <a href="#inicio" onClick={skip} className="label text-ember">
              {t.reelSkip} ↓
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} aria-label={t.reelKicker} className="relative h-[400svh]">
      <div className="sticky top-0 screen-h overflow-hidden bg-void">
        {SHOTS.map((s, i) => {
          const p = localizeProject(projects.find((p) => p.id === s.projectId), lang);
          return (
            <CineShot
              key={`${s.src}-${lang}`}
              progress={progress}
              index={i}
              shot={s}
              caption={{ name: p.name, location: p.location, alt: p.alt }}
            />
          );
        })}

        {/* Velo + degradado para sostener texto */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/40" />

        {/* Barras letterbox */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 h-[7vh] origin-top bg-void"
          style={{ scaleY: barScale }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-20 h-[7vh] origin-bottom bg-void"
          style={{ scaleY: barScale }}
        />

        {/* Kicker superior */}
        <div className="shell absolute inset-x-0 top-[9vh] z-30 flex items-center gap-4">
          <span className="label border border-ember/40 px-3 py-1.5 text-ember">{t.reelKicker}</span>
          <span className="label tabular-nums">
            {String(shot + 1).padStart(2, '0')} — {String(N).padStart(2, '0')}
          </span>
        </div>

        {/* Hint + saltar */}
        <motion.div
          className="absolute inset-x-0 bottom-[9vh] z-30 flex items-center justify-center gap-3"
          style={{ opacity: hintOpacity }}
          aria-hidden="true"
        >
          <span className="label">{t.scroll}</span>
        </motion.div>
        <div className="shell absolute inset-x-0 bottom-[9vh] z-30 flex justify-end">
          <a
            href="#inicio"
            onClick={skip}
            data-cursor="hover"
            className="label inline-flex min-h-[44px] items-center border border-white/15 px-4 transition-colors hover:border-ember hover:text-ember"
          >
            {t.reelSkip} ↓
          </a>
        </div>

        {/* Fundido final a negro */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 bg-void"
          style={{ opacity: endVeil }}
        />
      </div>
    </section>
  );
}
