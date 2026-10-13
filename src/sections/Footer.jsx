import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';

/**
 * Footer minimalista con logo grande y reloj del visitante.
 */
function Clock() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      el.textContent = `${hh}:${mm}:${ss}`;
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span ref={ref} aria-hidden="true" className="font-mono text-sm tabular-nums text-bone/70">
      00:00:00
    </span>
  );
}

export default function Footer({ scrollTo, lenisRef }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-footer-reveal]', {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const go = (e, id) => {
    // Desde el footer siempre estamos en home (el footer solo monta en home).
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    if (scrollTo) scrollTo(target, { offset: -10 });
    else {
      const lenis = lenisRef?.current ?? window.__lenis;
      if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: -10 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <footer ref={root} className="relative border-t border-white/10 pt-16 md:pt-20">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div data-footer-reveal className="space-y-3">
            <span className="label">CONTRA/LUZ — {t.architecture.split('—')[0].trim() || 'Arquitectura'}</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="label">{t.localTime}</span>
                <Clock />
              </div>
              <div className="flex items-center gap-2">
                <span className="label">{t.coords}</span>
                <span className="font-mono text-sm text-bone/70">6.2442° N</span>
              </div>
            </div>
          </div>

          <nav data-footer-reveal aria-label={t.nav} className="flex gap-8">
            <a href="#contacto" onClick={(e) => go(e, 'contacto')} className="label transition-colors hover:text-ember" data-cursor="hover">
              {t.contact}
            </a>
            <a href="#estudio" onClick={(e) => go(e, 'estudio')} className="label transition-colors hover:text-ember" data-cursor="hover">
              {t.studio}
            </a>
          </nav>
        </div>

        <div className="mt-16 overflow-hidden md:mt-20">
          <p
            data-footer-reveal
            className="display select-none text-[19vw] leading-[0.8] text-bone/[0.07] sm:text-[15vw] md:text-[11vw]"
            aria-hidden="true"
          >
            CONTRA<span className="slash">/</span>LUZ
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="label">© {new Date().getFullYear()} CONTRA/LUZ</p>
          <p className="label">{t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
