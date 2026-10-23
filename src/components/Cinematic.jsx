import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  easeIn,
  easeOut,
} from 'framer-motion';
import { useLenisScrollBridge } from '../hooks/useScrollBridge';
import SmartImage from './SmartImage';
import { projects, localizeProject } from '../data/projects';
import { useLang, UI } from '../context/LanguageContext';

/**
 * RECORRIDO — reel de entrada como un viaje de camara
 * ===================================================
 * Pista de scroll + visor fijo, entre el preloader y el hero. En vez de
 * cortar de una foto a otra, la camara "entra" por un punto de luz de cada
 * imagen (una ventana, un pabellon iluminado) y sale en el espacio siguiente:
 *
 *   1. llegada: el plano aparece mientras el anterior aun se esta hundiendo
 *   2. avance:  empuje lento y continuo hacia su punto de entrada
 *   3. salto:   el empuje acelera (easeIn) y la imagen se abre hacia el
 *               siguiente plano, que ya esta debajo
 *
 * Todo es funcion pura del progreso de scroll: se puede ir y volver.
 * Solo se animan opacity y scale (transform). Con reduced-motion el recorrido
 * sigue, pero en modo `calma`: sin zoom ni desplazamientos, solo fundidos
 * entre fotos (antes era un plano fijo y en esos equipos "no habia intro").
 *
 * MODO VIDEO
 * ----------
 * Si existe un video real del recorrido (p.ej. generado con IA a partir de
 * los renders), basta con definir VIDEO abajo: el scroll pasa a controlar
 * `currentTime` y las fotos dejan de usarse. Los titulos y el indice siguen
 * igual, repartidos en N tramos. Para que el scrub sea fluido el MP4 debe ir
 * con keyframes densos (ffmpeg -g 1 o -g 2) y sin audio.
 */

// Orden del recorrido. `focus` es el punto (en % de la imagen) por donde
// entra la camara: el foco de luz que "abre" el paso al siguiente espacio.
const SHOTS = [
  { src: '/proyectos/edificio.jpg', projectId: null, focus: [50, 50] },
  { src: '/proyectos/liuto-01.jpg', projectId: 'liuto', focus: [52, 52] },
  { src: '/proyectos/hecate-01.jpg', projectId: 'luz-de-hecate', focus: [74, 37] },
  // Mas planos (por ahora fuera del recorrido, siguen en el portafolio):
  // { src: '/proyectos/liuto-03.jpg', projectId: 'liuto', focus: [47, 48] },
  // { src: '/proyectos/hecate-02.jpg', projectId: 'luz-de-hecate', focus: [45, 62] },
  // { src: '/proyectos/spa-01.jpg', projectId: 'spa', focus: [57, 52] },
  // { src: '/proyectos/spa-03.jpg', projectId: 'spa', focus: [49, 47] },
  // { src: '/proyectos/liuto-04.jpg', projectId: 'liuto', focus: [41, 62] },
];

/** Video del recorrido. null = recorrido con fotos. Ej: { src: '/recorrido/recorrido.mp4', poster: '/proyectos/liuto-01.jpg' } */
const VIDEO = null;

const N = SHOTS.length;
const SEG = 1 / N;

/**
 * Ritmo del recorrido.
 *
 * TRACK_SCREENS: altura de la pista en svh, ~100svh por plano (N * 100).
 * ARRIVE: fraccion del plano que dura el cruce entre dos espacios.
 * DIVE: fraccion final del plano en la que la camara acelera hacia el foco.
 * Todo se multiplica por SEG: son fracciones del plano, no de la pista.
 */
const TRACK_SCREENS = N * 100;
const ARRIVE = 0.14 * SEG;
const DIVE = 0.38 * SEG;

/** Un plano: llegada, empuje lento y salto hacia su punto de luz. */
function CineShot({ progress, index, shot, alt, calma }) {
  const start = index * SEG;
  const end = start + SEG;
  const isFirst = index === 0;
  const isLast = index === N - 1;

  // El empuje nunca retrocede: llega a 1, avanza a 1.12 y salta a 3.4.
  // El ultimo plano no salta: entrega al velo final.
  const scale = useTransform(
    progress,
    isLast ? [start - ARRIVE, 1] : [Math.max(0, start - ARRIVE), end - DIVE, end + ARRIVE],
    isLast ? [1, 1.12] : [1, 1.12, 3.4],
    { ease: isLast ? undefined : [(v) => v, easeIn] }
  );
  // El plano saliente sigue opaco hasta que el entrante (encima en el DOM)
  // termina de aparecer: si los dos se desvanecen a la vez, el cruce pasa
  // por negro y se pierde la sensacion de atravesar la ventana.
  const gone = end + ARRIVE;
  const opacity = useTransform(
    progress,
    isFirst
      ? [0, gone, gone + 0.0005]
      : isLast
        ? [start - ARRIVE, start + ARRIVE, 1]
        : [start - ARRIVE, start + ARRIVE, gone, gone + 0.0005],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0]
  );

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{
        opacity,
        scale: calma ? 1 : scale,
        transformOrigin: `${shot.focus[0]}% ${shot.focus[1]}%`,
      }}
    >
      <SmartImage
        base={shot.src}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ objectPosition: `${shot.focus[0]}% ${shot.focus[1]}%` }}
        eager={index === 0}
        sizes="100vw"
        fetchPriority={index === 0 ? 'high' : 'low'}
      />
    </motion.div>
  );
}

/** Titulo del plano: entra despues del cruce y se va antes del salto. */
function CineCaption({ progress, index, caption, calma }) {
  const start = index * SEG;
  const end = start + SEG;
  const isFirst = index === 0;
  const range = [
    isFirst ? 0 : start + ARRIVE,
    isFirst ? 0.0001 : start + ARRIVE * 2,
    end - DIVE,
    end - DIVE + ARRIVE,
  ];
  const opacity = useTransform(progress, range, [isFirst ? 1 : 0, 1, 1, 0]);
  const y = useTransform(progress, range, [isFirst ? 0 : 28, 0, 0, -20], {
    ease: [easeOut, (v) => v, easeIn],
  });
  // Invisible y sin foco cuando no es el plano activo.
  const visibility = useTransform(opacity, (v) => (v > 0.02 ? 'visible' : 'hidden'));

  // Contenedor fijo para la posicion (el translate de centrado vive aqui) y
  // motion.div adentro: Framer escribe `transform` y pisaria el -translate-y.
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(9vh+4.5rem)] z-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
      <motion.div className="shell" style={{ opacity, y: calma ? 0 : y, visibility }}>
        <div className="max-w-md">
          <p className="display text-[12vw] leading-[0.88] text-bone sm:text-[8vw] md:text-[5vw] 3xl:text-[6rem]">
            {caption.name}
          </p>
          <p className="label mt-4 text-bone/70">
            {caption.category} — {caption.location}
          </p>
          <p className="mt-5 hidden max-w-sm font-serif text-lg italic leading-relaxed text-bone/80 md:block">
            {caption.excerpt}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/** Modo video: el scroll controla currentTime. Un solo seek por frame. */
function CineVideo({ progress }) {
  const ref = useRef(null);
  const pending = useRef(null);
  const raf = useRef(0);

  useMotionValueEvent(progress, 'change', (v) => {
    pending.current = v;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = ref.current;
      if (!el || !el.duration || pending.current == null) return;
      el.currentTime = pending.current * (el.duration - 0.05);
    });
  });

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <video
      ref={ref}
      src={VIDEO.src}
      poster={VIDEO.poster}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
    />
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

  // Barras de cine: entran al empezar el recorrido.
  const barScale = useTransform(progress, [0, 0.03], [0, 1]);
  // Velo final: funde a negro antes de entregar al hero.
  const endVeil = useTransform(progress, [0.95, 1], [0, 1]);

  const scrollToY = (y, duration) => {
    const lenis = lenisRef?.current ?? window.__lenis;
    if (lenis) lenis.scrollTo(y, { duration });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  /** Salta al primer plano de un proyecto (mitad del tramo, ya sin cruce). */
  const goToShot = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const lenis = lenisRef?.current ?? window.__lenis;
    const scrollY = lenis ? lenis.scroll : window.scrollY;
    const top = track.getBoundingClientRect().top + scrollY;
    const span = track.offsetHeight - window.innerHeight;
    scrollToY(top + (i + 0.4) * SEG * span, 2.2);
  };

  // Indice: un renglon por proyecto, en orden de primera aparicion.
  const index = [];
  SHOTS.forEach((s, i) => {
    if (s.projectId && !index.some((e) => e.projectId === s.projectId)) {
      index.push({ projectId: s.projectId, first: i });
    }
  });
  const activeProject = SHOTS[shot].projectId;

  return (
    <section
      ref={trackRef}
      aria-label={t.reelKicker}
      className="relative"
      style={{ height: `${TRACK_SCREENS}svh` }}
    >
      <div className="sticky top-0 screen-h overflow-hidden bg-void">
        {VIDEO ? (
          <CineVideo progress={progress} />
        ) : (
          SHOTS.map((s, i) => {
            const alt = s.projectId
              ? localizeProject(projects.find((p) => p.id === s.projectId), lang).alt
              : t.aperturaAlt;
            return (
              <CineShot key={s.src} progress={progress} index={i} shot={s} alt={alt} calma={prefersReduced} />
            );
          })
        )}

        {/* Velo lateral + inferior: sostiene el texto a la izquierda */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/40" />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-void/75 via-void/20 to-transparent md:block" />
        {/* Franja derecha suave para el indice */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[32%] bg-gradient-to-l from-void/70 to-transparent md:block" />

        {SHOTS.map((s, i) => {
          if (!s.projectId) return null;
          const p = localizeProject(projects.find((p) => p.id === s.projectId), lang);
          return (
            <CineCaption
              key={`${s.src}-${lang}`}
              progress={progress}
              index={i}
              calma={prefersReduced}
              caption={{
                name: p.name,
                location: p.location,
                category: p.category,
                excerpt: p.excerpt,
              }}
            />
          );
        })}

        {/* Indice de proyectos (md+): el activo en ember, click salta */}
        <nav
          aria-label={t.projects}
          className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 md:block"
        >
          <ul className="shell space-y-3 text-right">
            {index.map(({ projectId, first }, k) => {
              const p = localizeProject(projects.find((p) => p.id === projectId), lang);
              const active = projectId === activeProject;
              return (
                <li key={projectId}>
                  <button
                    type="button"
                    onClick={() => goToShot(first)}
                    data-cursor="hover"
                    aria-current={active ? 'true' : undefined}
                    className={`group inline-flex min-h-[44px] items-center gap-3 font-mono text-[11px] uppercase tracking-wide2 transition-colors duration-500 ${
                      active ? 'text-ember' : 'text-bone/60 hover:text-bone'
                    }`}
                  >
                    {p.name}
                    <span className="tabular-nums">{String(k + 1).padStart(2, '0')}</span>
                    <span
                      aria-hidden="true"
                      className={`h-px bg-current transition-all duration-500 ease-cine ${
                        active ? 'w-8' : 'w-3 group-hover:w-6'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

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
