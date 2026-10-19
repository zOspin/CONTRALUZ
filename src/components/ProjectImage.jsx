import { useEffect, useRef, useState } from 'react';
import { gsap, revealImage, parallax } from '../hooks/useAnimations';
import { useReducedMotion, useFinePointer } from '../hooks/useMedia';
import SmartImage from './SmartImage';

/**
 * Imagen que se revela con clip-path al entrar al viewport, y que lleva un
 * "spotlight" — un gradiente radial suave que ilumina la zona bajo el cursor.
 *
 * Movimiento PESADO: el clip-path dura 2.2s con power4.inOut, asi que la
 * imagen emerge con masa en vez de aparecer de golpe. El parallax es lento.
 *
 * Accesibilidad: el alt llega a <img>; el overlay es decorativo y aria-hidden.
 */
export default function ProjectImage({
  src,
  alt,
  className = '',
  priority = false,
  parallax: doParallax = false,
  hoverZoom = true,
  aspect = 'aspect-[4/3]',
  color = false,
}) {
  const root = useRef(null);
  const img = useRef(null);
  const spot = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduced = useReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      revealImage(el, { trigger: el, start: 'top 92%' });
      if (doParallax) parallax('[data-parallax]', { amount: 7, trigger: el });
    }, root);

    return () => ctx.revert();
  }, [reduced, doParallax]);

  // Zoom lento al hover. Solo si hay puntero fino.
  useEffect(() => {
    if (!img.current || reduced || !hoverZoom || !fine) return;
    gsap.to(img.current, {
      scale: hovering ? 1.06 : 1,
      duration: 1.6,
      ease: 'expo.out',
    });
  }, [hovering, reduced, hoverZoom, fine]);

  // Spotlight: sigue al mouse dentro de la imagen.
  const onMove = (e) => {
    if (!spot.current || !fine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    gsap.to(spot.current, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      duration: 0.8,
      ease: 'power3.out',
    });
  };

  return (
    <figure
      ref={root}
      className={`group relative overflow-hidden bg-coal ${aspect} ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={onMove}
    >
      <SmartImage
        imgRef={img}
        data-parallax
        base={src}
        alt={alt}
        eager={priority}
        onError={() => setFailed(true)}
        className={`h-[114%] w-full -translate-y-[6%] object-cover ${
          color
            ? ''
            : 'img-bw transition-[filter] duration-1000 ease-cine group-hover:grayscale-0'
        }`}
      />

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-coal px-6 text-center">
          <span className="font-mono text-xs uppercase tracking-wide3 text-smoke">{alt}</span>
        </div>
      )}

      {/* Spotlight: la luz que sigue al cursor */}
      {/* Caja de 680px centrada en el cursor con margenes negativos (no con
          translate: GSAP escribe x/y en transform y lo pisaria). Con tamaño
          0 el gradiente no tenia donde pintarse y la luz nunca se veia. */}
      {fine && (
        <div
          ref={spot}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 -ml-[340px] -mt-[340px] h-[680px] w-[680px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(340px circle at center, rgba(217,161,91,0.22), rgba(217,161,91,0.06) 40%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Degradado inferior suave: da base al numero sin apagar la foto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/45 via-transparent to-transparent"
      />
    </figure>
  );
}