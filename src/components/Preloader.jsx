import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang } from '../context/LanguageContext';

/**
 * Preloader — intro con el logo animado (video con sonido) sobre el mapa de
 * Medellin opacado.
 *
 *   public/intro/logo-h.mp4 / logo-v.mp4  1920x1080 y 1080x1920, ~7s
 *     (video/src/IntroLogo.tsx, con el audio de Logo-Fondo/Logo.mp4)
 *   public/intro/fondo-h.webp / fondo-v.webp  mapa ampliado x3 y re-entintado
 *
 * Pantalla horizontal -> versiones horizontales; vertical -> verticales. El
 * video va en `contain` y se mezcla con `screen`: su negro (y sus bordes,
 * fundidos a negro en el render) desaparecen y solo el logo brilla sobre el
 * mapa, sin cortes en ningun formato.
 *
 * Sonido: los navegadores no dejan reproducir audio sin un toque previo. Se
 * intenta con sonido; si lo bloquean arranca en silencio y cualquier toque o
 * tecla lo activa. Sin botones: la intro corre sola y al terminar el video
 * se funde al portafolio.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const video = useRef(null);
  const saliendo = useRef(false);
  const reduced = useReducedMotion();
  const { lang } = useLang();
  // Se decide una vez al abrir: cambiar de video a mitad cortaria la intro.
  const [forma] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < window.innerHeight ? 'v' : 'h'
  );

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

  // Cualquier toque o tecla activa el sonido. click y no pointerdown: en
  // movil el permiso de audio llega con el toque completo.
  const activarSonido = () => {
    const v = video.current;
    if (v && v.muted) v.muted = false;
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
          src={`/intro/fondo-${forma}.webp`}
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
        src={`/intro/logo-${forma}.mp4`}
        playsInline
        preload="auto"
        onEnded={salir}
        onError={salir}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain mix-blend-screen"
      />

    </div>
  );
}
