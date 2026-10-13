import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../hooks/useAnimations';
import { useReducedMotion } from '../hooks/useMedia';

/**
 * SplitText con entrada por scroll.
 *
 * `lines` (default): el texto se revela linea por linea desde una mascara.
 * `words`: cada palabra sube escalonada (para titulares cortos).
 * `chars`: cada letra sube escalonada (para el logo o palabras muy cortas).
 *
 * Con prefers-reduced-motion el texto se muestra tal cual, sin dividir.
 */
export default function SplitReveal({
  children,
  as: Tag = 'h2',
  type = 'lines',
  className = '',
  delay = 0,
  stagger = 0.14,
  duration = 2.2,
  trigger,
  start = 'top 85%',
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const target = trigger ? trigger : el;

    const split = new SplitText(el, {
      type,
      linesClass: 'split-line',
      wordsClass: 'split-word',
      charsClass: 'split-char',
      mask: type === 'lines' ? 'lines' : undefined,
    });

    const pieces =
      type === 'lines'
        ? split.lines.map((l) => l.firstElementChild ?? l)
        : type === 'words'
          ? split.words
          : split.chars;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: target, start, once: true },
      delay,
    });

    tl.from(pieces, {
      yPercent: 118,
      opacity: type === 'lines' ? 1 : 0,
      duration,
      ease: 'expo.out',
      stagger,
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      split.revert();
    };
  }, [type, delay, stagger, duration, trigger, start, reduced]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}