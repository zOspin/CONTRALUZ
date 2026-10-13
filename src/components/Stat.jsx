import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useMedia';

/**
 * CIFRA DEL ESTUDIO
 * ================
 * Numero grande con contador animado + etiqueta, sobre una linea de grilla.
 *
 * ANIMACION (pesada, en cascada)
 * -----------------------------
 * El numero no "cuenta" y ya: entra desde abajo con desenfoque, se descuenta
 * como un contador mecanico y la linea de la base se dibuja de izquierda a
 * derecha al mismo tiempo. Los tres bloques escalonan entre si.
 *
 * Se anima SOLO transform/opacity/filter: nada de width ni height.
 */
export default function Stat({ value, suffix = '', label, index = 0 }) {
  const root = useRef(null);
  const num = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    const out = num.current;
    if (!el || !out) return;

    if (reduced) {
      out.textContent = String(value);
      return;
    }

    const ctx = gsap.context(() => {
      const state = { n: 0 };
      out.textContent = '0';

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        delay: index * 0.16, // cascada entre las tres cifras
      });

      tl.fromTo(
        '[data-stat-num]',
        { yPercent: 110, opacity: 0, filter: 'blur(14px)' },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 2,
          ease: 'expo.out',
        }
      )
        .to(
          state,
          {
            n: value,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              out.textContent = String(Math.round(state.n));
            },
          },
          0.1
        )
        // La linea de la base se dibuja mientras el numero sube.
        .fromTo(
          '[data-stat-rule]',
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: 'left',
            duration: 1.8,
            ease: 'power4.inOut',
          },
          0.15
        )
        .fromTo(
          '[data-stat-label]',
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 1.4, ease: 'expo.out' },
          0.5
        );
    }, root);

    return () => ctx.revert();
  }, [value, index, reduced]);

  return (
    <div ref={root} data-stat className="group relative">
      {/* Numero */}
      <div className="mask-line overflow-hidden">
        <span
          data-stat-num
          className="display block text-[19vw] leading-[0.82] text-bone sm:text-[13vw] md:text-[8vw] lg:text-[5.5vw]"
        >
          <span ref={num} className="tabular-nums">
            {reduced ? value : 0}
          </span>
          {suffix && <span className="text-ember">{suffix}</span>}
        </span>
      </div>

      {/* Regla que se dibuja */}
      <div className="mt-5 h-px w-full bg-white/10">
        <div
          data-stat-rule
          className="h-px w-full origin-left scale-x-0 bg-ember/60 transition-colors duration-500 group-hover:bg-ember"
        />
      </div>

      {/* Etiqueta */}
      <p data-stat-label className="label mt-4">{label}</p>
    </div>
  );
}
