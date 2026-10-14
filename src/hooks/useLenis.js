import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from './useMedia';
import { gsap, ScrollTrigger } from './useAnimations';

/**
 * Smooth scroll con Lenis, integrado con ScrollTrigger.
 *
 * EL ROL DE ESTE HOOK
 * -------------------
 * Lenis NO gestiona su propio requestAnimationFrame por defecto cuando se le
 * pasa un `autoRaf: false`. El Patron correcto (el que documenta Lenis) es:
 * un unico bucle de rAF, que invokes lenis.raf() Y despues
 * ScrollTrigger.update(). Asi los dos comparten reloj y nunca se desfasan.
 *
 * El bug que nos trajo aqui
 * ------------------------
 * La version anterior hacia esto:
 *     const raf = (time) => lenis.raf(time * 1000);
 *     gsap.ticker.add(raf);
 * relying en el ticker de GSAP para mover Lenis. Problemas:
 *   1. El ticker de GSAP llama rAF internamente, y Lenis tambien. Dos fuentes
 *      de tiempo compitiendo -> desfase y, en el peor caso, realimentacion.
 *   2. `gsap.ticker.lagSmoothing(0)` desactiva la proteccion contra saltos de
 *      tiempo. Cuando una animacion pesada (el grano de pelicula, el reveal de
 *      imagenes) bloquea un frame, el ticker intenta "recuperar" ese tiempo
 *      en el siguiente. Con ScrollTrigger tambien refrescando, el hilo se
 *      saturaba y requestAnimationFrame dejaba de responder: el sitio se veia
 *      bien pero la rueda del mouse no hacia nada.
 *
 * Ahora hay UN SOLO rAF, manual, sin lagSmoothing. Si un frame tarda, el
 * siguiente simply continue.
 */
export function useLenis() {
  const lenisRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Con reduced-motion no hay scroll suave: el nativo manda y es accesible.
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      // expo.out: arranca rapido, frena largo -> sensacion de masa sin perder
      // respuesta. Valores >1.2s se sienten como scroll roto.
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Un solo rAF, el de abajo.
      autoRaf: false,
    });

    lenisRef.current = lenis;
    if (typeof window !== 'undefined') window.__lenis = lenis;

    // Unico bucle de la pagina. Orden importa:
    //   1. Lenis avanza su interpolacion
    //   2. ScrollTrigger recalcula posiciones con el scroll ya actualizado
    let rafId = 0;
    const raf = (timeMs) => {
      lenis.raf(timeMs);
      ScrollTrigger.update();
    };
    rafId = requestAnimationFrame(function loop(t) {
      raf(t);
      rafId = requestAnimationFrame(loop);
    });

    // Recalcular cuando las fuentes web cargan: cambian las alturas del texto
    // y con ellas las posiciones de los triggers.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    // Recalcular al rotar o redimensionar (debounce: resize dispara en rafaga).
    let refreshTimer = 0;
    const queueRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
    };
    window.addEventListener('resize', queueRefresh);
    window.addEventListener('orientationchange', queueRefresh);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', queueRefresh);
      window.removeEventListener('orientationchange', queueRefresh);
      clearTimeout(refreshTimer);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== 'undefined' && window.__lenis === lenis) {
        window.__lenis = null;
      }
    };
  }, [reduced]);

  /** Scroll suave a un destino. Compatible con Lenis y con el nativo. */
  const scrollTo = (target, options = {}) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        duration: 1.6,
        offset: options.offset ?? 0,
        ...options,
      });
      return;
    }
    // Fallback reduced-motion / sin Lenis: scroll nativo instantaneo.
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'auto' });
    } else if (target instanceof Element) {
      const rect = target.getBoundingClientRect();
      window.scrollTo({
        top: rect.top + window.scrollY + (options.offset ?? 0),
        behavior: 'auto',
      });
    }
  };

  return { lenisRef, scrollTo };
}

/**
 * Scroll a una seccion por id usando Lenis si esta disponible.
 * Evita scrollIntoView/window.scrollTo directos, que desincronizan
 * el scroll virtual de Lenis con ScrollTrigger.
 */
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const lenis = typeof window !== 'undefined' ? window.__lenis : null;
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, offset: -10 });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** Subir arriba del todo respetando Lenis. */
export function scrollToTop(immediate = true) {
  const lenis = typeof window !== 'undefined' ? window.__lenis : null;
  if (lenis) {
    lenis.scrollTo(0, { immediate, duration: immediate ? 0 : 1.2 });
  } else {
    window.scrollTo(0, 0);
  }
}