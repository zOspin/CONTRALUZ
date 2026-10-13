import { useEffect, useRef } from 'react';
import { gsap } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';

/**
 * Transicion de pagina pesada: el panel entra desde arriba, tapa, y sale hacia
 * abajo. Comparte lenguaje visual con el preloader.
 *
 * Este componente NO toca Lenis. Deliberadamente: managear stop/start desde
 * aqui dejaba el scroll permanentemente detenido en el primer render, porque
 * el onCover corria antes de que terminara el preloader y el start() asociado
 * ya habia pasado. Congelar el scroll durante la transicion es responsabilidad
 * de quien la dispara, no de la transicion misma.
 *
 * Invariante critica: el panel SIEMPRE termina invisible (scaleY 0 +
 * visibility hidden). Si terminara visible taparía el sitio con negro.
 */
export default function PageTransition({ locationKey }) {
  const panel = useRef(null);
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    // No animar en el primer mount: solo al navegar.
    if (first.current) {
      first.current = false;
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    const tween = gsap.timeline({
      onComplete: () => gsap.set(el, { autoAlpha: 0 }),
    });

    tween
      // Entra desde arriba hasta tapar.
      .set(el, { autoAlpha: 1 })
      .fromTo(
        el,
        { scaleY: 0, transformOrigin: 'top' },
        { scaleY: 1, duration: 0.75, ease: 'power4.inOut' }
      )
      // Pausa minima en el pico, para que se lea como un corte.
      .to({}, { duration: 0.12 })
      // Sale hacia abajo: el sitio nuevo aparece desde el borde inferior.
      .to(el, {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 0.95,
        ease: 'power4.inOut',
      });

    return () => {
      tween.kill();
      gsap.set(el, { autoAlpha: 0 });
    };
  }, [locationKey, reduced]);

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="invisible fixed inset-0 z-overlay bg-void opacity-0"
      style={{ visibility: 'hidden' }}
    />
  );
}