import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion, useFinePointer } from '../hooks/useMedia';

/**
 * Cursor personalizado (solo escritorio con puntero fino).
 *
 * Dos elementos: un punto que sigue al mouse con precision (gsap.quickTo) y un
 * anillo con inercia. El anillo se expande sobre elementos [data-cursor="hover"].
 *
 * Con reduced-motion o en tactil no se monta nada: el cursor del SO es la
 * interfaz real y debe seguir siendo visible.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const reduced = useReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    setEnabled(fine && !reduced);
  }, [fine, reduced]);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const setX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
    const setY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
    const setRX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const setRY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    let visible = false;

    const onMove = (e) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      setX(e.clientX);
      setY(e.clientY);
      setRX(e.clientX);
      setRY(e.clientY);
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
    };

    // Estado hover: delegacion en document para cubrir elementos dinamicos.
    const onOver = (e) => {
      const target = e.target.closest?.('[data-cursor="hover"]');
      if (target) {
        gsap.to(ring, {
          scale: 2.6,
          borderColor: 'rgba(217,161,91,0.9)',
          duration: 0.35,
          ease: 'power3',
        });
        gsap.to(dot, { scale: 0, duration: 0.25 });
      } else {
        gsap.to(ring, {
          scale: 1,
          borderColor: 'rgba(236,232,225,0.35)',
          duration: 0.35,
          ease: 'power3',
        });
        gsap.to(dot, { scale: 1, duration: 0.25 });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOver);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-cursor hidden lg:block" aria-hidden="true">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-bone/35 opacity-0 will-change-transform"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-ember opacity-0 will-change-transform"
      />
    </div>
  );
}