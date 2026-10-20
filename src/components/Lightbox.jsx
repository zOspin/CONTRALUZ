import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SmartImage from './SmartImage';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';

const SWIPE = 50; // px horizontales para pasar de imagen en tactil

/**
 * Visor a pantalla completa de la galeria.
 * - Esc cierra, flechas navegan, swipe en tactil, clic en el fondo cierra.
 * - Foco atrapado dentro del dialogo y devuelto al disparador al cerrar.
 * - Lenis se detiene mientras esta abierto (la rueda no mueve la pagina).
 */
export default function Lightbox({ images, index, onIndex, onClose, altFor }) {
  const { lang } = useLang();
  const t = UI[lang];
  const reduced = useReducedMotion();
  const dialog = useRef(null);
  const cerrar = useRef(null);
  const inicioToque = useRef(null);
  const abierto = index !== null;
  const total = images.length;

  const ir = (paso) => onIndex((index + paso + total) % total);

  // Bloqueo de scroll + foco inicial + devolucion del foco.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement;
    const lenis = window.__lenis;
    lenis?.stop();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    cerrar.current?.focus();
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = overflow;
      previo?.focus?.({ preventScroll: true });
    };
  }, [abierto]);

  // Teclado: Esc, flechas y Tab atrapado.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') ir(1);
      else if (e.key === 'ArrowLeft') ir(-1);
      else if (e.key === 'Tab' && dialog.current) {
        const f = [...dialog.current.querySelectorAll('button')].filter((b) => b.offsetParent !== null);
        const primero = f[0];
        const ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Precarga de las vecinas para que el paso sea instantaneo.
  useEffect(() => {
    if (!abierto || total < 2) return;
    [index + 1, index - 1].forEach((i) => {
      const img = new Image();
      img.src = images[(i + total) % total].replace(/\.jpe?g$/i, '.webp');
    });
  }, [abierto, index, images, total]);

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') inicioToque.current = e.clientX;
  };
  const onPointerUp = (e) => {
    if (inicioToque.current === null) return;
    const dx = e.clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(dx) > SWIPE) ir(dx < 0 ? 1 : -1);
  };

  const boton =
    'flex h-11 w-11 items-center justify-center text-bone/70 transition-colors duration-300 hover:text-ember focus-visible:text-ember';

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={t.lbDialog}
          className="fixed inset-0 z-[96] flex flex-col bg-void/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          data-lenis-prevent
        >
          <div className="pt-safe flex items-center justify-between px-4 py-3 md:px-8 md:py-5">
            <span className="label tabular-nums" aria-live="polite">
              {String(index + 1).padStart(2, '0')} <span className="text-smoke">/ {String(total).padStart(2, '0')}</span>
            </span>
            <button ref={cerrar} type="button" onClick={onClose} aria-label={t.close} className={boton} data-cursor="hover">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (inicioToque.current = null)}
          >
              {/* key: cada imagen entra con su fundido (sin exit: un AnimatePresence
                  anidado dejaba el dialogo montado e invisible al cerrar). */}
              <motion.div
                key={index}
                className="flex h-full w-full items-center justify-center"
                onClick={(e) => e.target === e.currentTarget && onClose()}
                initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <SmartImage
                  base={images[index]}
                  alt={altFor(index)}
                  eager
                  sizes="100vw"
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain"
                  style={{ touchAction: 'pinch-zoom' }}
                />
              </motion.div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => ir(-1)}
                  aria-label={t.lbPrev}
                  className={`${boton} absolute left-1 top-1/2 hidden -translate-y-1/2 md:flex md:left-5`}
                  data-cursor="hover"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M15 4l-8 8 8 8" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => ir(1)}
                  aria-label={t.lbNext}
                  className={`${boton} absolute right-1 top-1/2 hidden -translate-y-1/2 md:flex md:right-5`}
                  data-cursor="hover"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M9 4l8 8-8 8" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Movil: flechas abajo, al alcance del pulgar (el swipe tambien sirve). */}
          {total > 1 && (
            <div className="pb-safe flex items-center justify-center gap-10 py-3 md:hidden">
              <button type="button" onClick={() => ir(-1)} aria-label={t.lbPrev} className={boton}>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M15 4l-8 8 8 8" />
                </svg>
              </button>
              <button type="button" onClick={() => ir(1)} aria-label={t.lbNext} className={boton}>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M9 4l8 8-8 8" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
