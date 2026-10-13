import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

/**
 * PUENTE LENIS <-> FRAMER MOTION
 * ==============================
 *
 * DEVOLVER UN MotionValue CON EL PROGRESO 0..1 DE LA PISTA DEL HERO
 *
 * POR QUE NO USAMOS useScroll DE FRAMER
 * -------------------------------------
 * `useScroll` lee el scroll NATIVO. Lenis no mueve el documento con
 * window.scrollTo: usa un virtualScroll con transform interno. Bajo Lenis,
 * `window.scrollY` puede seguir marcando 0 mientras visualmente estamos mil
 * pixeles abajo, asi que useScroll queda un frame atrasado — o, peor, congelado.
 *
 * FUENTE DE VERDAD
 * ----------------
 * `lenis.scroll`: la posicion virtual de Lenis, en pixeles. Es la unica cifra
 * fiable cuando Lenis esta activo. Solo caemos a window.scrollY si no hay
 * instancia (reduced-motion, o antes de que Lenis monte).
 *
 * POR QUE NO USAMOS UN rAF PROPIO
 * -------------------------------
 * Un loop perpetuo competiria con el ticker de Lenis por el hilo. Aqui solo
 * escuchamos eventos: cero coste cuando la pagina esta quieta.
 *
 * POR QUE NO HAY ESTADO DE "LISTO"
 * -------------------------------
 * Una version anterior esperaba a que `lenisRef.current` dejara de ser null
 * para engancharse. El problema: los efectos de los HIJOS se ejecutan antes
 * que los del PADRE, asi que el Hero corria antes de que App creara Lenis, y el
 * reintento con setTimeout(0) era fragil. Resultado: el MotionValue se
 * quedaba en 0 y el hero no respondia a nada.
 *
 * Aqui no hay puerta. Nos enganchamos al scroll nativo de inmediato (siempre
 * dispara, incluso sin Lenis) y, si Lenis aparece despues, nos enganchamos a
 * el tambien. compute() decide en cada llamada que fuente usar, asi que da
 * igual en que orden se monte todo.
 */
export function useLenisScrollBridge({ lenisRef, trackRef }) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    /* Geometria ESTATICA del track.
       offsetTop, NO getBoundingClientRect: con Lenis el rect depende de donde
       estemos scrolleados, asi que rect.top + scrollY mezcla dos epocas
       distintas y la suma sale mal. offsetTop es geometria de layout, no de
       scroll. */
    let trackTop = 0;
    let scrollSpan = 1;

    const measure = () => {
      // getBoundingClientRect + scroll actual: robusto aunque haya
      // ancestros con transform (que rompen la cadena offsetParent).
      const lenis = lenisRef.current;
      const y = lenis ? lenis.scroll : window.scrollY;
      const rect = track.getBoundingClientRect();
      trackTop = rect.top + y;
      // El recorrido util: la pista menos la parte que queda fija.
      scrollSpan = Math.max(1, track.offsetHeight - window.innerHeight);
    };

    measure();

    /** Progreso 0..1, clamp explicito. */
    const compute = (scrollValue) => {
      const lenis = lenisRef.current;
      // Lenis manda si existe. window.scrollY solo si no hay instancia.
      const scrollY = scrollValue ?? (lenis ? lenis.scroll : window.scrollY);
      const p = (scrollY - trackTop) / scrollSpan;
      progress.set(Math.min(1, Math.max(0, p)));
    };

    /* 1) Scroll nativo: siempre disponible, y Lenis tambien lo dispara cuando
          el mueve el documento. Cubre la carga inicial, window.scrollTo, las
          anclas del navbar y la restauracion de scroll del navegador. */
    const onScroll = () => compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      measure();
      compute();
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        measure();
        compute();
      });
    }
    compute();

    /* 2) Lenis: se engancha cuando exista. Si ya existe al montar (navegar
          entre rutas), entra aqui mismo. Si aparece despues, lo enganchamos
          al primer frame. Es idempotente: el guard evita dobles registros. */
    let attached = null;

    const attachLenis = () => {
      const lenis = lenisRef.current;
      if (!lenis || lenis === attached) return;
      // Lenis ya emite scroll propio: quitamos el nativo para no
      // computar dos veces por frame (jitter en scale/opacity).
      window.removeEventListener('scroll', onScroll);
      lenis.on('scroll', onScroll);
      attached = lenis;
      compute();
    };

    attachLenis();
    // Dos intentos: uno en macrotask (los efectos del padre ya corrieron) y
    // otro en el primer animation frame, por si el montaje fue mas lento.
    const id1 = setTimeout(attachLenis, 0);
    let rafId = 0;
    let intentos = 0;
    const reintentar = () => {
      attachLenis();
      if (++intentos < 30 && !attached) rafId = requestAnimationFrame(reintentar);
    };
    rafId = requestAnimationFrame(reintentar);

    return () => {
      window.removeEventListener('scroll', onScroll);
      attached?.off('scroll', onScroll);
      clearTimeout(id1);
      cancelAnimationFrame(rafId);
    };
  }, [lenisRef, trackRef, progress]);

  return progress;
}