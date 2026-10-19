import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useTransform, useReducedMotion } from 'framer-motion';
import { useLenisScrollBridge } from '../hooks/useScrollBridge';
import HeroScene3D from '../components/HeroScene3D';
import SmartImage from '../components/SmartImage';
import SplitTitle from '../components/SplitTitle';
import { useLang, UI } from '../context/LanguageContext';

/**
 * HERO SCROLL-DRIVEN
 * ===================
 * Patron "House" (Scrolltide) adaptado al lenguaje CONTRA/LUZ.
 *
 * El hero es una "tira" de 300svh de alto con un visor fijo (sticky): el
 * scroll recorre la pista y Framer deriva TODAS las transformaciones del
 * progreso 0 -> 1. Cada estado es funcion pura de la posicion: se puede
 * subir y todo vuelve atras correctamente.
 *
 * SECUENCIA
 *   0%  - 30%  -> Bloque 1: badge + "CONTRA/LUZ"
 *   35% - 65%  -> Bloque 2: "La arquitectura revela el volumen"
 *   70% - 100% -> Bloque 3: CTA final
 *
 * ANTI-SOLAPAMIENTO
 *   Cada bloque es un HeroBlock: deriva `visibility` y `pointer-events` de
 *   su propia opacidad, y los bloques 2-3 arrancan con clase `invisible`.
 *   Solo la escena activa es visible e interactiva; si el MotionValue falla
 *   (NaN) o la animacion se retrasa, nada se muestra encimado.
 *   Con prefers-reduced-motion no hay pista: un hero estatico con el
 *   bloque 1 en flujo normal (antes los 3 bloques forzaban opacity 1 y
 *   quedaban apilados: ese era el solapamiento).
 *
 * TAMAÑOS
 *   Titulos con clamp() en funcion de ancho Y alto: min(8vw, 14vh).
 *   Reglas extra en index.css para ventanas bajas (max-height: 700px) y
 *   ultrawide (min-aspect-ratio: 21/9).
 */

/**
 * Escena 3D procedural al cierre del hero. Apagada: tapaba la ultima foto
 * con volumenes casi negros que no se leian como arquitectura. Para
 * reactivarla (p.ej. con un .glb real del proyecto) basta con ponerla en true.
 */
const SHOW_3D = false;

const RANGES = {
  block1: [0, 0.3],
  block2: [0.35, 0.65],
  block3: [0.7, 1],
};

// Tres imagenes: los tres proyectos del estudio, en orden de escala.
const SLIDES = [
  {
    src: '/proyectos/liuto-01.jpg',
    alt: 'Paseo elevado entre la vegetacion hacia un centro de visitantes iluminado en la montana',
  },
  {
    src: '/proyectos/hecate-02.jpg',
    alt: 'Vivienda de madera y piedra en la ladera con cascada y luz entre los arboles',
  },
  {
    src: '/proyectos/spa-01.jpg',
    alt: 'Casa en el bosque al atardecer con iluminacion artificial calida',
  },
];

/**
 * Un bloque del hero. La visibilidad y los pointer-events derivan de la
 * opacidad animada: lo inactivo no se ve, no recibe clicks ni foco.
 */
function HeroBlock({ opacity, y, startHidden = false, children }) {
  const visibility = useTransform(opacity, (v) => (v > 0.04 ? 'visible' : 'hidden'));
  const pointerEvents = useTransform(opacity, (v) => (v > 0.4 ? 'auto' : 'none'));
  return (
    <motion.div
      style={{ opacity, y, visibility, pointerEvents }}
      // bottom-24 en movil: deja libre el indicador de scroll (antes la frase
      // quedaba debajo de el). En md+ el indicador va centrado y no choca.
      className={`absolute inset-x-0 bottom-24 md:bottom-6 ${startHidden ? 'invisible' : ''}`}
    >
      {children}
    </motion.div>
  );
}

export default function Hero({ lenisRef }) {
  const trackRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];
  // 3D solo en desktop con puntero fino: en movil ahorra ~500kB de GPU
  // y bateria. Se evalua en cliente para no romper SSR.
  const [allow3D, setAllow3D] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(min-width: 1024px) and (pointer: fine)');
    const update = () => setAllow3D(!!mq?.matches);
    update();
    mq?.addEventListener('change', update);
    return () => mq?.removeEventListener('change', update);
  }, []);
  // Si WebGL falla (drivers viejos, Safari con GPU bloqueada): foto fija.
  const [glFailed, setGlFailed] = useState(false);
  // Referencia estable: HeroScene3D depende de onError en su efecto y una
  // funcion nueva por render recrearia el contexto WebGL (p.ej. al cambiar idioma).
  const onGlError = useCallback(() => setGlFailed(true), []);

  /* Posicion de scroll dentro de la pista: 0 al entrar, 1 al salir. */
  const scrollYProgress = useLenisScrollBridge({ lenisRef, trackRef });

  /* ---- Fondos: cross-fade + zoom continuo ---- */
  const scale1 = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const scale2 = useTransform(scrollYProgress, [0, 1], [1.08, 1.16]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [1.16, 1.24]);

  const fade1 = useTransform(scrollYProgress, [0, 0.22, 0.34], [1, 1, 0]);
  const fade2 = useTransform(scrollYProgress, [0.3, 0.46, 0.66, 0.78], [0, 1, 1, 0]);
  /* La tercera foto sostiene el cierre: antes caia a 0 para dejar ver el
     render 3D y el final quedaba en negro con volumenes sin leer. */
  const fade3 = useTransform(scrollYProgress, [0.72, 0.86, 1], [0, 1, 1]);

  /* ---- Contenido: entrada y salida por bloques ---- */
  const b1Opacity = useTransform(scrollYProgress, [0, 0.06, 0.24, 0.3], [1, 1, 1, 0]);
  const b1Y = useTransform(scrollYProgress, [0, 0.06, 0.24, 0.3], [0, 0, 0, -48]);

  const b2Opacity = useTransform(scrollYProgress, [0.29, 0.4, 0.58, 0.65], [0, 1, 1, 0]);
  const b2Y = useTransform(scrollYProgress, [0.29, 0.4, 0.58, 0.65], [48, 0, 0, -48]);

  const b3Opacity = useTransform(scrollYProgress, [0.64, 0.76, 1], [0, 1, 1]);
  const b3Y = useTransform(scrollYProgress, [0.64, 0.76, 1], [48, 0, 0]);

  /* ---- Velo general ---- */
  const veil = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    // Cierre a 0.4: la foto final se ve; el texto contrasta por el degradado.
    [0.5, 0.2, 0.2, 0.4]
  );

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  /* ---- Escena 3D: entra al final (solo si SHOW_3D) ---- */
  const sceneOpacity = useTransform(scrollYProgress, [0.55, 0.78, 1], [0, 0.85, 1]);

  const goTo = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const lenis = lenisRef?.current ?? window.__lenis;
    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: -10 });
    else target.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
  };

  /* ---- Reduced-motion: hero estatico, un solo bloque en flujo normal ---- */
  if (prefersReduced) {
    return (
      <section
        id="inicio"
        aria-label="Portada"
        className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <SmartImage
            base={SLIDES[0].src}
            alt=""
            className="h-full w-full object-cover"
            eager
            sizes="100vw"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-void/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-void/30" />
        </div>

        <div className="shell relative z-10 pb-12 pt-32" data-hero-content>
          <div className="mb-6 flex flex-wrap items-center gap-3" data-hero-kicker>
            <span className="label border border-white/15 px-3 py-1.5 text-bone/80">
              {t.portfolio}
            </span>
            <span className="label">{t.architecture}</span>
          </div>

          <h1
            data-hero-title
            className="display text-[clamp(3rem,min(11vw,17vh),10rem)] leading-[0.82]"
          >
            CONTRA
            <br />
            <span className="slash">/</span>LUZ
          </h1>

          <p
            data-hero-tag
            className="mt-6 max-w-md font-serif text-lg italic leading-relaxed text-bone/85"
          >
            {t.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4" data-hero-cta>
            <a
              href="#proyectos"
              onClick={(e) => goTo(e, 'proyectos')}
              className="group inline-flex min-h-[44px] items-center gap-4 border border-bone/30 px-8 py-3 font-mono text-xs uppercase tracking-wide3 text-bone transition-colors duration-500 hover:border-ember hover:text-ember"
              data-cursor="hover"
            >
              {t.viewProjects}
              <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1.5">
                →
              </span>
            </a>
            <a
              href="#contacto"
              onClick={(e) => goTo(e, 'contacto')}
              className="inline-flex min-h-[44px] items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-wide3 text-smoke transition-colors duration-500 hover:text-bone"
              data-cursor="hover"
            >
              {t.contactCta}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    /* La pista: 300svh de recorrido. */
    <section
      ref={trackRef}
      id="inicio"
      className="relative h-[300svh]"
      aria-label="Portada"
    >
      {/* El visor: queda pegado mientras se recorre la pista. */}
      <div className="sticky top-0 screen-h overflow-hidden">
        {/* --- Escena 3D (z-5) --- */}
        <motion.div
          className="absolute inset-0 z-[5]"
          style={{ opacity: sceneOpacity }}
          aria-hidden="true"
        >
          {SHOW_3D && allow3D && !glFailed && (
            <HeroScene3D progress={scrollYProgress} onError={onGlError} />
          )}
          {SHOW_3D && glFailed && (
            <SmartImage
              base="/proyectos/liuto-01.jpg"
              alt=""
              className="h-full w-full object-cover opacity-80"
              sizes="100vw"
            />
          )}
        </motion.div>

        {/* --- Fondos (z-0) --- */}
        <div className="absolute inset-0 z-0">
          {[fade1, fade2, fade3].map((fade, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{ opacity: fade, scale: [scale1, scale2, scale3][i] }}
              aria-hidden={i !== 0}
            >
              <SmartImage
                base={SLIDES[i].src}
                alt={i === 0 ? SLIDES[i].alt : ''}
                className="h-full w-full object-cover"
                eager={i === 0}
                sizes="100vw"
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
            </motion.div>
          ))}

          <motion.div className="absolute inset-0 bg-void" style={{ opacity: veil }} />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-void/30" />

          <div className="rule-grid" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ left: `${(i / 4) * 100}%` }} />
            ))}
          </div>
        </div>

        {/* --- Contenido (z-10): un solo bloque visible a la vez --- */}
        <div className="shell relative z-10 flex h-full flex-col justify-end pb-10 pt-28 md:pb-14" data-hero-content>
          {/* BLOQUE 1 — 0% a 30% */}
          <HeroBlock opacity={b1Opacity} y={b1Y}>
            <div className="shell pb-2">
              <div className="mb-6 flex flex-wrap items-center gap-3" data-hero-kicker>
                <span className="label border border-white/15 px-3 py-1.5 text-bone/80">
                  {t.portfolio}
                </span>
                <span className="label">{t.architecture}</span>
              </div>

              <h1
                data-hero-title
                className="display text-[clamp(3rem,min(11vw,17vh),10rem)] leading-[0.82]"
              >
                <SplitTitle
                  progress={scrollYProgress}
                  range={[-0.22, 0]}
                  stagger={0.4}
                  from={112}
                  lineClassName="text-shadow-cine"
                  lines={['CONTRA', '/LUZ']}
                />
              </h1>

              <p
                data-hero-tag
                className="mt-6 max-w-md font-serif text-lg italic leading-relaxed text-bone/85"
              >
                {t.tagline}
              </p>
            </div>
          </HeroBlock>

          {/* BLOQUE 2 — 35% a 65% */}
          <HeroBlock opacity={b2Opacity} y={b2Y} startHidden>
            <div className="shell pb-2">
              <div className="mb-6 flex flex-wrap items-center gap-3" data-hero-kicker>
                <span className="label border border-ember/40 px-3 py-1.5 text-ember">
                  {t.badge2}
                </span>
                <span className="label">{t.meta2}</span>
              </div>

              <h2
                data-hero-title
                className="display max-w-5xl text-[clamp(2.25rem,min(7vw,12vh),5rem)] leading-[0.86]"
              >
                <SplitTitle
                  progress={scrollYProgress}
                  range={[0.35, 0.65]}
                  stagger={0.5}
                  lines={[
                    t.line21,
                    <>
                      <span className="slash">{t.line22.split(' ')[0]}</span>{' '}
                      {t.line22.split(' ').slice(1).join(' ')}
                    </>,
                  ]}
                />
              </h2>

              <p
                data-hero-tag
                className="mt-6 max-w-lg font-serif text-lg italic leading-relaxed text-bone/85"
              >
                {t.para2}
              </p>
            </div>
          </HeroBlock>

          {/* BLOQUE 3 — 70% a 100% */}
          <HeroBlock opacity={b3Opacity} y={b3Y} startHidden>
            <div className="shell pb-2">
              <div className="mb-6 flex flex-wrap items-center gap-3" data-hero-kicker>
                <span className="label border border-white/15 px-3 py-1.5 text-bone/80">
                  {t.badge3}
                </span>
              </div>

              <h2
                data-hero-title
                className="display max-w-5xl text-[clamp(2rem,min(6vw,11vh),4.2rem)] leading-[0.88]"
              >
                <SplitTitle
                  progress={scrollYProgress}
                  // Termina en 0.84: las dos lineas quedan armadas antes del
                  // final de la pista (con [0.7, 1] "La luz no." solo se
                  // completaba en el ultimo pixel de scroll).
                  range={[0.66, 0.84]}
                  stagger={0.5}
                  lines={[
                    t.line31,
                    <span key="luz" className="font-serif italic text-ember">
                      {t.line32}
                    </span>,
                  ]}
                />
              </h2>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3" data-hero-cta>
                <a
                  href="#proyectos"
                  onClick={(e) => goTo(e, 'proyectos')}
                  className="group inline-flex min-h-[44px] items-center gap-4 border border-bone/30 px-8 py-3 font-mono text-xs uppercase tracking-wide3 text-bone transition-colors duration-500 hover:border-ember hover:text-ember"
                  data-cursor="hover"
                >
                  {t.viewProjects}
                  <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1.5">
                    →
                  </span>
                </a>
                <a
                  href="#contacto"
                  onClick={(e) => goTo(e, 'contacto')}
                  className="inline-flex min-h-[44px] items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-wide3 text-smoke transition-colors duration-500 hover:text-bone"
                  data-cursor="hover"
                >
                  {t.contactCta}
                </a>
              </div>
            </div>
          </HeroBlock>
        </div>

        {/* Indicador de scroll — desaparece al final del recorrido. */}
        <motion.div
          data-hero-hint
          className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-3"
          aria-hidden="true"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="label">{t.scroll}</span>
          <span className="relative block h-14 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-5 bg-ember"
              animate={{ y: [0, 350] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>

        {/* Progreso del hero: una linea ámbar, 0 -> 100% de la pista. */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 h-px origin-left bg-ember/60"
          aria-hidden="true"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </section>
  );
}
