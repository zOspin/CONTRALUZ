import { useEffect, useRef } from 'react';
import { gsap } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';
import Logo from './Logo';

/**
 * Preloader — pantalla negra de entrada.
 *
 * Secuencia animada por etapas:
 *   1) el logotipo se descubre de izquierda a derecha (blur + clip-path)
 *   2) los marcos superior e inferior (encuadre)
 *   3) el tagline en serif italic
 *   4) barra fina ember + contador 000/100
 * Luego cortina hacia arriba revelando el hero (~3s total).
 * Con reduced-motion muestra el sitio directo. Bloquea input mientras carga.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const reduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (reduced) {
      const timer = setTimeout(() => onDone?.(), 200);
      return () => clearTimeout(timer);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => onDone?.() });

      // 1) PRIMERO el logotipo: se descubre como si lo barriera la luz.
      tl.fromTo(
        '[data-preload-word]',
        { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0.2, filter: 'blur(10px)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.3,
          ease: 'expo.out',
        }
      )
        // 2) LUEGO el resto: marcos superior e inferior (encuadre).
        .fromTo(
          '[data-preload-frame]',
          { opacity: 0, y: (i) => (i === 0 ? -12 : 12) },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' },
          '-=0.55'
        )
        // 3) Tagline en serif: aparece detrás, sin competir.
        .fromTo(
          '[data-preload-tag]',
          { opacity: 0, y: 18, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' },
          '-=0.6'
        )
        // 4) Barra + contador avanzan juntos mientras la firma se sostiene.
        .fromTo(
          '[data-preload-bar]',
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: 'power2.inOut',
            onUpdate: function () {
              const p = Math.round(this.progress() * 100);
              if (count.current) count.current.textContent = String(p).padStart(3, '0');
            },
          },
          '-=0.9'
        )
        // Respiro mínimo y salida: cortina hacia arriba.
        .to({}, { duration: 0.15 })
        .to(el, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
        .set(el, { display: 'none' });
    }, root);

    return () => ctx.revert();
  }, [onDone, reduced]);

  return (
    <div
      ref={root}
      role="status"
      aria-label={lang === 'en' ? 'Loading portfolio' : 'Cargando portafolio'}
      className="fixed inset-0 z-preloader flex flex-col justify-between bg-void px-6 py-6 md:px-10 md:py-8"
    >
      {/* Marco superior */}
      <div data-preload-frame className="flex items-center justify-between gap-4">
        <span className="label text-bone/70">CONTRA/LUZ — {t.studio}</span>
        <span className="hidden h-px flex-1 bg-white/10 sm:block" aria-hidden="true" />
        <span className="label">{t.portfolio}</span>
      </div>

      {/* Palabra central */}
      <div className="flex flex-col items-center text-center">
        <div data-preload-word aria-hidden="true">
          <Logo alt="" adaptativo className="w-[80vw] max-w-[46rem]" />
        </div>
        <p
          data-preload-tag
          className="mt-6 font-serif text-lg italic text-bone/60 md:text-2xl"
        >
          {t.tagline}
        </p>
      </div>

      {/* Marco inferior: contador + barra + coordenadas */}
      <div data-preload-frame className="flex items-end justify-between gap-6">
        <span className="label">
          <span ref={count} className="tabular-nums text-bone/80">000</span>
          <span className="text-ember"> / 100</span>
        </span>
        <div className="mb-1 h-px w-40 overflow-hidden bg-white/10 sm:w-56 md:w-72" aria-hidden="true">
          <div
            data-preload-bar
            className="h-full w-full origin-left bg-ember"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <span className="label hidden sm:block">6.2442° N — MED</span>
      </div>
    </div>
  );
}
