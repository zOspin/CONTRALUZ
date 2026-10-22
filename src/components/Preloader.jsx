import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';

/**
 * Preloader — intro con el logo animado (video con sonido) sobre el mapa de
 * Medellin opacado.
 *
 *   public/intro/logo.mp4   video vertical 1080x1920, fondo negro, ~7s
 *   public/intro/fondo.jpg  mapa de fondo
 *
 * El video se mezcla con `screen`: su negro desaparece y solo el logo brilla
 * sobre el mapa. Ancho min(100vw, 72svh): en movil entra completo; en
 * pantallas horizontales se agranda y se recorta negro arriba y abajo, sin
 * tocar el logo ni el lema.
 *
 * Sonido: los navegadores no dejan reproducir audio sin un toque previo. Se
 * intenta con sonido; si lo bloquean arranca en silencio y cualquier toque
 * (o el boton) lo activa. Al terminar el video, fundido al portafolio.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const video = useRef(null);
  const saliendo = useRef(false);
  const reduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];
  const [muted, setMuted] = useState(false);

  const salir = useCallback(() => {
    if (saliendo.current) return;
    saliendo.current = true;
    const el = root.current;
    const v = video.current;
    if (v && !v.muted) gsap.to(v, { volume: 0, duration: 0.8, ease: 'power1.out' });
    gsap
      .timeline({
        onComplete: () => {
          v?.pause();
          window.__lenis?.start();
          onDone?.();
        },
      })
      .to(el, { opacity: 0, duration: 0.9, ease: 'power2.inOut' })
      .set(el, { display: 'none' });
  }, [onDone]);

  // Mientras dura la intro la pagina de atras no se mueve.
  useEffect(() => {
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('[data-intro-fondo]', { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power1.out' });
      if (!reduced) {
        gsap.fromTo('[data-intro-fondo] img', { scale: 1.08 }, { scale: 1, duration: 9, ease: 'none' });
      }
    }, root);

    // Con sonido si el navegador lo permite; si no, en silencio.
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(salir);
    });

    // Red de seguridad: si el video no arranca o se cuelga, se entra igual.
    const tope = setTimeout(salir, 15000);
    window.addEventListener('keydown', activarSonido);
    return () => {
      clearTimeout(tope);
      window.removeEventListener('keydown', activarSonido);
      ctx.revert();
    };
  }, [reduced, salir]);

  // Cualquier toque o tecla activa el sonido (los botones tienen el suyo).
  // click y no pointerdown: en movil el permiso de audio llega con el toque
  // completo.
  const activarSonido = (e) => {
    if (e?.target?.closest?.('button')) return;
    const v = video.current;
    if (!v || !v.muted) return;
    v.muted = false;
    setMuted(false);
  };

  const alternarSonido = (e) => {
    e.stopPropagation();
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div
      ref={root}
      role="status"
      aria-label={lang === 'en' ? 'Loading portfolio' : 'Cargando portafolio'}
      onClick={activarSonido}
      className="fixed inset-0 z-preloader overflow-hidden bg-void"
    >
      {/* Mapa de Medellin, opacado: textura de fondo, no protagonista */}
      <div data-intro-fondo aria-hidden="true" className="absolute inset-0 opacity-0">
        <img
          src="/intro/fondo.jpg"
          alt=""
          className="h-full w-full object-cover opacity-[0.22] will-change-transform"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.92) 75%)' }}
        />
      </div>

      {/* Logo animado: el negro del video se funde con el fondo */}
      <video
        ref={video}
        src="/intro/logo.mp4"
        playsInline
        preload="auto"
        onEnded={salir}
        onError={salir}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 aspect-[9/16] w-[min(100vw,72svh)] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      />

      {/* Controles: sonido y entrar */}
      <div className="pb-safe absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 py-6 md:px-10 md:py-8">
        <button
          type="button"
          onClick={alternarSonido}
          aria-pressed={!muted}
          className={`label inline-flex min-h-[44px] items-center gap-3 transition-colors hover:text-bone ${
            muted ? 'text-ember' : 'text-bone/60'
          }`}
        >
          <span aria-hidden="true" className="flex h-3 items-end gap-[3px]">
            {[0.5, 1, 0.7].map((h, i) => (
              <span
                key={i}
                className={`w-px bg-current ${muted ? '' : 'animate-pulse'}`}
                style={{ height: muted ? '3px' : `${h * 12}px` }}
              />
            ))}
          </span>
          {muted ? t.introSound : t.introMute}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            salir();
          }}
          className="label inline-flex min-h-[44px] items-center gap-2 border border-white/15 px-5 text-bone/70 transition-colors hover:border-ember hover:text-bone"
        >
          {t.introSkip} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
