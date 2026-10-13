import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * CURVAS DE MOVIMIENTO
 *
 * El sitio se siente pesado y lento a proposito: los objetos llegan con
 * inercia, como una camara de cine pesado, no como un elemento de UI.
 *
 * expo.out      -> entra rapido y frena largo. La sensacion de "peso".
 * power4.inOut -> transiciones que chocan y se asientan.
 *
 * Duraciones: 1.4–2.2s para entradas de viewport. Nada por debajo de 1s.
 */
export const EASE = {
  heavy: 'expo.out',
  settle: 'power4.inOut',
  glide: 'power3.out',
};

export const DUR = {
  slow: 2.2,
  medium: 1.6,
  fast: 1.1,
};

/**
 * Animacion de entrada por scroll para una linea de texto.
 *
 * Divide el texto en lineas (SplitText type:'lines'), envuelve cada linea y
 * la sube desde fuera del mask. El efecto es el clasico "reveal" de study:
 * el texto aparece como si lo descubriera una cortina que sube.
 *
 * Los spans generados por SplitText se limpian al revertir el contexto, asi que
 * el texto original queda intacto para SEO y lectores de pantalla.
 */
export function revealLines(el, { trigger, start = 'top 85%', delay = 0 } = {}) {
  const split = new SplitText(el, {
    type: 'lines',
    linesClass: 'split-line',
    // Evita que una linea que envuelve se parta a la mitad de una palabra.
    mask: 'lines',
  });

  const inner = split.lines.map((line) => line.firstElementChild ?? line);

  const tl = gsap.timeline({
    scrollTrigger: trigger
      ? { trigger, start, once: true }
      : undefined,
    delay,
  });

  tl.from(inner, {
    yPercent: 118,
    duration: DUR.slow,
    ease: EASE.heavy,
    stagger: 0.14,
  });

  return {
    split,
    tl,
    revert: () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      split.revert();
    },
  };
}

/**
 * Animacion de entrada por scroll para un elemento generico.
 * Sube con inercia y con un desvanecido muy suave.
 */
export function revealUp(el, { trigger, start = 'top 88%', delay = 0, y = 60 } = {}) {
  return gsap.from(el, {
    y,
    opacity: 0,
    duration: DUR.slow,
    ease: EASE.heavy,
    delay,
    scrollTrigger: trigger ? { trigger, start, once: true } : undefined,
  });
}

/**
 * Revelado de imagen con clip-path: la imagen se descubre de abajo hacia arriba
 * con una curva pesada. Muy acorde al concepto de "la luz revelando el volumen".
 */
export function revealImage(el, { trigger, start = 'top 90%' } = {}) {
  return gsap.fromTo(
    el,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: DUR.slow,
      ease: EASE.settle,
      scrollTrigger: trigger ? { trigger, start, once: true } : undefined,
    }
  );
}

/**
 * Paralaje lento. La imagen se mueve poco y muy despacio: crea profundidad con
 * peso sin marear.
 */
export function parallax(el, { amount = 8, trigger } = {}) {
  return gsap.fromTo(
    el,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: {
        trigger: trigger ?? el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

/**
 * Transicion de pagina pesada: entra desde arriba, tapa, sale hacia abajo.
 * Deja de ser el sitio visible. No gestiona Lenis — ver PageTransition.jsx.
 */
export function pageWipe(panel, { onDone } = {}) {
  return gsap
    .timeline({ onComplete: onDone })
    .set(panel, { autoAlpha: 1 })
    .to(panel, {
      scaleY: 1,
      transformOrigin: 'top',
      duration: 0.75,
      ease: EASE.settle,
    })
    .to({}, { duration: 0.12 })
    .to(panel, {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.95,
      ease: EASE.settle,
    });
}

export { gsap, ScrollTrigger, SplitText };