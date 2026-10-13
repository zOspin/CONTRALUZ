import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';

/**
 * Barra de progreso de lectura — un detalle "de plano tecnico" en el borde superior.
 * Se actualiza con ScrollTrigger en vez de un listener de scroll manual: menos
 * trabajo por frame y se sincroniza con Lenis.
 */
export default function ScrollProgress() {
  const bar = useRef(null);
  const reduced = useReducedMotion();
  const location = useLocation();

  useEffect(() => {
    const el = bar.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        }
      );
    });

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [reduced, location.pathname]);

  if (reduced) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] bg-transparent"
      aria-hidden="true"
    >
      <div ref={bar} className="h-full w-full origin-left scale-x-0 bg-ember" />
    </div>
  );
}