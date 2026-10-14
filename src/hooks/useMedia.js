import { useState, useEffect } from 'react';

/**
 * Detecta la preferencia del sistema por movimiento reducido.
 * Se sincroniza con cambios en vivo de la preferencia (raro, pero posible).
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Puntero fino (desktop con mouse). Los efectos de cursor se desactivan en táctil. */
export function useFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine)');
    const onChange = (e) => setFine(e.matches);
    setFine(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return fine;
}

/** Ancho de viewport para decisiones de layout que CSS no resuelve solo. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Entorno movil/tactil (pantalla chica o sin hover fino).
 * Las secciones lo usan para acortar recorridos y duraciones de GSAP.
 */
export function useCoarse() {
  return useMediaQuery('(max-width: 768px), (hover: none)');
}