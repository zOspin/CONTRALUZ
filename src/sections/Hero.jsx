import { useRef, useState, useEffect } from 'react';
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
 * COMO FUNCIONA
 * -------------
 * El hero ya no es una seccion de 100vh que aparece y se va. Es un
 * "tira" de 300vh de alto:
 *
 *   <div ref={ref} className="h-[300vh]">      <- la pista, da recorrido
 *     <div className="sticky top-0 h-screen">  <- el visor, se queda fijo
 *       ...                                     <- 3 fondos + 3 textos
 *     </div>
 *   </div>
 *
 * El scroll del usuario recorre la pista. Framer Motion mide cuanto se ha
 * recorrido (scrollYProgress: 0 -> 1) y de ahi salen TODAS las transformaciones.
 * No hay timelines ni animaciones que "corran": cada estado es una funcion
 * pura de la posicion de scroll. Por eso se puede hacer scroll inverso
 * (scrollear hacia arriba) y todo vuelve atras correctamente.
 *
 * SECUENCIA (rangos del prompt)
 *   0%  - 30%  -> Bloque 1: badge + "CONTRA/LUZ"
 *   35% - 65%  -> Bloque 2: "La arquitectura revela el volumen"
 *   70% - 100% -> Bloque 3: CTA final
 *
 * RENDIMIENTO
 *   Solo se animan `opacity` y `scale`/`y`. Framer los compone en GPU cuando
 *   el elemento tiene `will-change`. Nada de animar `height` ni `top`.
 *
 * ACCESIBILIDAD
 *   Con prefers-reduced-motion los rangos se "apagan": los bloques quedan en
 *   opacidad 1 sin transform y las imagenes en escala 1. El contenido es
 *   exactamente el mismo, solo desaparece el efecto de scroll. Sin el modo
 *   reducido, los bloques se apagan por opacity, asi que tambien es usable.
 *
 * NOTA SOBRE GSAP
 *   Este componente NO usa GSAP. El resto del sitio si (preloader, secciones,
 *   cursor). Conviven sin conflicto: Framer toma el scroll via su propio
 *   listener de scroll, y Lenis lo suaviza. `useScroll` lee la posicion real
 *   del documento, que Lenis actualiza, asi que ambos ven el mismo valor.
 */

const RANGES = {
  block1: [0, 0.3],
  block2: [0.35, 0.65],
  block3: [0.7, 1],
};

// Tres imagenes: los tres proyectos del estudio, en orden de escala.
// De la ladera iluminada de Hong Kong al interior calido del valle.
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

export default function Hero({ lenisRef }) {
  const trackRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];
  // 3D solo en desktop con puntero fino: en movil ahorra ~500kB de GPU
  // y bateria. Se evalua en cliente para no romper SSR.
  const [allow3D, setAllow3D] = useState(false);
  // Si WebGL falla (drivers viejos, Safari con GPU bloqueada): foto fija.
  const [glFailed, setGlFailed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(min-width: 1024px) and (pointer: fine)');
    const update = () => setAllow3D(!!mq?.matches);
    update();
    mq?.addEventListener('change', update);
    return () => mq?.removeEventListener('change', update);
  }, []);

  /* Posicion de scroll dentro de la pista: 0 al entrar, 1 al salir.

     No usamos `useScroll` directo a proposito. Cuando Lenis esta activo
     interpola el scroll dentro de su propio rAF, y `useScroll` puede leer el
     valor un frame antes de que Lenis lo escriba: `scrollYProgress` queda
     atrasado y el hero no responde al scroll (o responde a destiempo).

     El puente nos engancha al evento 'scroll' de Lenis — que se emite DESPUES
     de aplicar la posicion — y escribe en un MotionValue unico. Todos los
     useTransform de abajo leen de ahi, asi que hay una sola fuente de verdad.
     Ver src/hooks/useScrollBridge.js para el detalle. */
  const scrollYProgress = useLenisScrollBridge({ lenisRef, trackRef });

  /* ---- Fondos: cross-fade + zoom continuo ----
     Cada imagen esta siempre montada. La opacidad hace el cross-fade y el
     scale hace el lento zoom-in. Las tres comparten la misma escala de
     tiempo para que el "viaje" se sienta continuo y no cortado. */

  const scale1 = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const scale2 = useTransform(scrollYProgress, [0, 1], [1.08, 1.16]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [1.16, 1.24]);

  const fade1 = useTransform(scrollYProgress, [0, 0.22, 0.34], [1, 1, 0]);
  const fade2 = useTransform(scrollYProgress, [0.3, 0.46, 0.66, 0.78], [0, 1, 1, 0]);
    /* La tercera foto cae a 0 en el tramo final: deja ver el render 3D.
     Sin esto, spa-01 queda por encima del volumen y el 3D no se ve. */
  const fade3 = useTransform(scrollYProgress, [0.72, 0.86, 0.95], [0, 1, 0]);

  /* ---- Contenido: entrada y salida por bloques ----
     Cada bloque tiene un rango. Dentro, la opacidad sube de 0 a 1, sostiene,
     y vuelve a 0 antes de que llegue el siguiente: el texto aparece, se
     mantiene, y se retira.

     NOTA — reglas de hooks:
     estas llamadas NO pueden vivir dentro de un bucle ni dentro del JSX, o
     el orden de los hooks cambiaria entre renders y React fallaria. Por eso
     hay un hook por bloque, en orden fijo, calculados aqui arriba. Si
     anades un bloque nuevo, agrega su `useTransform` aqui y su objeto abajo. */

  const b1Opacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.24, 0.3],
    prefersReduced ? [1, 1, 1, 1] : [1, 1, 1, 0]
  );
  const b1Y = useTransform(
    scrollYProgress,
    [0, 0.06, 0.24, 0.3],
    prefersReduced ? [0, 0, 0, 0] : [0, 0, 0, -48]
  );

  const b2Opacity = useTransform(
    scrollYProgress,
    [0.29, 0.4, 0.58, 0.65],
    prefersReduced ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );
  const b2Y = useTransform(
    scrollYProgress,
    [0.29, 0.4, 0.58, 0.65],
    prefersReduced ? [0, 0, 0, 0] : [48, 0, 0, -48]
  );

  const b3Opacity = useTransform(
    scrollYProgress,
    [0.64, 0.76, 1],
    prefersReduced ? [1, 1, 1] : [0, 1, 1]
  );
  const b3Y = useTransform(
    scrollYProgress,
    [0.64, 0.76, 1, 1],
    prefersReduced ? [0, 0, 0, 0] : [48, 0, 0, 0]
  );

  /* ---- Velo general: el conjunto se aclara al entrar y se oscurece al salir.
     Da unidad a los tres bloques y evita el salto de un texto plano a otro. */
  const veil = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    // Velo mas suave que antes. Con las fotos a COLOR, un velo al 62%
    // las apagaba por completo y el efecto era el mismo que el B/N. Ahora
    // arranca en 0.5 y baja a 0.2: la foto se ve, el texto sigue
    //contrastando porque vive en la zona baja (donde el degradado es fuerte).
    prefersReduced ? [0.5, 0.5, 0.5, 0.5] : [0.5, 0.2, 0.2, 0.55]
  );

  /* El indicador de scroll se apaga en el primer 8%: si no, aparece
     apagado encima del bloque 2 sin que tenga sentido. Hook aqui arriba
     por la misma regla: nada de useTransform dentro del JSX. */
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const z1 = prefersReduced ? 1 : scale1;
  const z2 = prefersReduced ? 1 : scale2;
  const z3 = prefersReduced ? 1 : scale3;
  // Reduced-motion: una sola imagen visible (si las tres quedan a 1,
  // la ultima tapa a las demas y el hero pierde su portada).
  const o1 = prefersReduced ? 1 : fade1;
  const o2 = prefersReduced ? 0 : fade2;
  const o3 = prefersReduced ? 0 : fade3;

  /* ---- Escena 3D: entra al final, cuando las fotos ya dieron su turno.
         Se opone a las fotos en el ultimo tramo: si ambas estan a 1, el
         render 3D queda escondido detras de una fotografia. */
  const sceneOpacity = useTransform(
    scrollYProgress,
    [0.55, 0.78, 1],
    prefersReduced ? [0, 0, 0] : [0, 0.85, 1]
  );

  return (
    /* La pista: 300vh de recorrido. El nombre `scroll-mt` no aplica aqui. */
    <section
      ref={trackRef}
      id="inicio"
      className="relative h-[300svh]"
      aria-label="Portada"
    >
      {/* El visor: queda pegado mientras se recorre la pista. */}
      <div className="sticky top-0 screen-h overflow-hidden">
        {/* --- Escena 3D (z-5) ---
            Se dibuja SOBRE los fondos y DEBAJO del texto. Aparece en el
            tramo final del recorrido, cuando las fotos ya valieron: el
            volumen es la sintesis, no la portada. La opacidad la controla el
            scroll, asi que no hay "aparicion" brusca. */}
        <motion.div
          className="absolute inset-0 z-[5]"
          style={{ opacity: sceneOpacity }}
          aria-hidden="true"
        >
          {allow3D && !prefersReduced && !glFailed && (
            <HeroScene3D progress={scrollYProgress} onError={() => setGlFailed(true)} />
          )}
          {glFailed && (
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
          {SLIDES.map((slide, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{ opacity: [o1, o2, o3][i], scale: [z1, z2, z3][i] }}
              aria-hidden={i !== 0}
            >
              <SmartImage
                base={slide.src}
                alt={i === 0 ? slide.alt : ''}
                className="h-full w-full object-cover"
                eager={i === 0}
                sizes="100vw"
                // Las tres superpuestas: la primera es la LCP, el resto no
                // compite por el ancho de banda inicial.
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
            </motion.div>
          ))}

          {/* Velo oscuro: sostiene el contraste del texto sobre la foto.
              Se anima con el scroll para acompasar el cambio de imagen. */}
          <motion.div className="absolute inset-0 bg-void" style={{ opacity: veil }} />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-void/30" />

          {/* Grilla de plano arquitectonico */}
          <div className="rule-grid" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ left: `${(i / 4) * 100}%` }} />
            ))}
          </div>
        </div>

        {/* --- Contenido (z-10) --- */}
        <div className="shell relative z-10 flex h-full flex-col justify-end pb-16 pt-32 md:pb-24">
          {/* BLOQUE 1 — 0% a 30% */}
          <motion.div style={{ opacity: b1Opacity, y: b1Y }} className="absolute inset-x-0 bottom-0">
            <div className="shell pb-16 md:pb-24">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="label border border-white/15 px-3 py-1.5 text-bone/80">
                  {t.portfolio}
                </span>
                <span className="label">{t.architecture}</span>
              </div>

              {/* Titulo principal — SIN split de scroll, a proposito.

                  Los bloques 2 y 3 si entran linea a linea con el scroll. Pero
                  este titulo NO puede: es el ancla de la portada. Si lo
                  partimos con mascaras, la linea arranca empujada hacia abajo
                  (oculta) y el hero se ve VACIO al cargar, que es justo lo
                  contrario de lo que queremos.

                  Aqui la ventana de scroll termina ANTES del 0, asi que la
                  linea ya esta en su sitio cuando el scroll es 0 y no vuelve
                  a moverse. La estructura de mascaras se conserva, asi que el
                  texto sigue siendo un <h1> semantico y el sitio abre con el
                  logotipo presente. */}
              <h1 className="display text-[19vw] leading-[0.82] sm:text-[15vw] md:text-[11vw] lg:text-[8.5vw] 3xl:text-[9rem]">
                <SplitTitle
                  progress={scrollYProgress}
                  range={[-0.22, 0]}
                  stagger={0.4}
                  from={112}
                  isStatic={prefersReduced}
                  lineClassName="text-shadow-cine"
                  lines={['CONTRA', '/LUZ']}
                />
              </h1>

              <p className="mt-8 max-w-md font-serif text-lg italic leading-relaxed text-bone/85 md:mt-10 md:text-2xl">
                {t.tagline}
              </p>
            </div>
          </motion.div>

          {/* BLOQUE 2 — 35% a 65% */}
          <motion.div style={{ opacity: b2Opacity, y: b2Y }} className="absolute inset-x-0 bottom-0">
            <div className="shell pb-16 md:pb-24">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="label border border-ember/40 px-3 py-1.5 text-ember">
                  {t.badge2}
                </span>
                <span className="label">{t.meta2}</span>
              </div>

              <h2 className="display max-w-4xl text-[13vw] leading-[0.86] sm:text-[10vw] md:text-[7vw] lg:text-[5rem]">
                <SplitTitle
                  progress={scrollYProgress}
                  range={[0.35, 0.65]}
                  stagger={0.5}
                  isStatic={prefersReduced}
                  lines={[
                    t.line21,
                    <>
                      <span className="slash">{t.line22.split(' ')[0]}</span>{' '}
                      {t.line22.split(' ').slice(1).join(' ')}
                    </>,
                  ]}
                />
              </h2>

              <p className="mt-8 max-w-lg font-serif text-lg italic leading-relaxed text-bone/85 md:text-2xl">
                {t.para2}
              </p>
            </div>
          </motion.div>

          {/* BLOQUE 3 — 70% a 100% */}
          <motion.div style={{ opacity: b3Opacity, y: b3Y }} className="absolute inset-x-0 bottom-0">
            <div className="shell pb-16 md:pb-24">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="label border border-white/15 px-3 py-1.5 text-bone/80">
                  {t.badge3}
                </span>
              </div>

              <h2 className="display max-w-4xl text-[11vw] leading-[0.88] sm:text-[8.5vw] md:text-[6vw] lg:text-[4.2rem]">
                <SplitTitle
                  progress={scrollYProgress}
                  range={[0.7, 1]}
                  stagger={0.5}
                  isStatic={prefersReduced}
                  lines={[
                    t.line31,
                    <span key="luz" className="font-serif italic text-ember">
                      {t.line32}
                    </span>,
                  ]}
                />
              </h2>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#proyectos"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById('proyectos');
                    if (!target) return;
                    const lenis = lenisRef?.current ?? window.__lenis;
                    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: -10 });
                    else target.scrollIntoView({ behavior: 'smooth' });
                    window.history.replaceState(null, '', '#proyectos');
                  }}
                  className="group inline-flex items-center gap-4 border border-bone/30 px-8 py-4 font-mono text-xs uppercase tracking-wide3 text-bone transition-colors duration-500 hover:border-ember hover:text-ember"
                  data-cursor="hover"
                >
                  {t.viewProjects}
                  <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1.5">
                    →
                  </span>
                </a>
                <a
                  href="#contacto"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById('contacto');
                    if (!target) return;
                    const lenis = lenisRef?.current ?? window.__lenis;
                    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: -10 });
                    else target.scrollIntoView({ behavior: 'smooth' });
                    window.history.replaceState(null, '', '#contacto');
                  }}
                  className="inline-flex items-center gap-3 px-6 py-4 font-mono text-xs uppercase tracking-wide3 text-smoke transition-colors duration-500 hover:text-bone"
                  data-cursor="hover"
                >
                  {t.contactCta}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indicador de scroll — desaparece al final del recorrido. */}
        <motion.div
          className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3"
          aria-hidden="true"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="label">{t.scroll}</span>
          <span className="relative block h-14 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-5 bg-ember"
              animate={prefersReduced ? {} : { y: [0, 350] }}
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