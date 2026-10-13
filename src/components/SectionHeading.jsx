import { useEffect, useRef } from 'react';
import SplitReveal from './SplitReveal';
import { gsap } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';

/**
 * Encabezado de seccion con la numeracion de plano arquitectonico.
 *
 * El titulo usa SplitReveal por LINEAS con movimiento pesado (2.2s expo.out):
 * el texto emerge de una cortina que sube. La linea de regla se dibuja de
 * izquierda a derecha con power4.inOut.
 */
export default function SectionHeading({ num, title, subtitle, className = '' }) {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-heading-num]', {
        opacity: 0,
        x: -26,
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });

      gsap.from('[data-heading-line]', {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 2.2,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <header ref={root} className={`mb-12 md:mb-20 ${className}`}>
      <div className="flex items-center gap-5">
        <span data-heading-num className="label text-ember tabular-nums">
          {num}
        </span>
        <span data-heading-line className="h-px flex-1 bg-white/10" />
        {subtitle && <span className="label hidden sm:block">{subtitle}</span>}
      </div>

      <div className="mask-line mt-6 overflow-hidden">
        <SplitReveal
          as="span"
          type="lines"
          className="display block text-[13vw] sm:text-[10vw] md:text-[7vw] lg:text-[5vw]"
        >
          {title}
        </SplitReveal>
      </div>
    </header>
  );
}