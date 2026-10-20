import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';
import { scrollToSection } from '../hooks/useLenis';
import Logo from './Logo';
import InstagramLink from './InstagramLink';
import SelectorIdioma from './SelectorIdioma';
import { EMAIL } from '../data/contacto';

const LINKS = [
  { key: 'projects', href: '#proyectos', id: 'proyectos' },
  { key: 'studio', href: '#estudio', id: 'estudio' },
  { key: 'contact', href: '#contacto', id: 'contacto' },
];


/**
 * Navbar fijo con overlay movil a pantalla completa.
 * En home: scroll suave via Lenis. Desde detalle: navigate('/#id')
 * y Home hace el scroll al resolver el hash (sin reload).
 */
export default function Navbar({ scrollTo, lenisRef }) {
  const { lang } = useLang();
  const t = UI[lang];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlay = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const reduced = useReducedMotion();
  const [activa, setActiva] = useState(null); // seccion visible (solo home)

  // Marca en el menu la seccion que se esta viendo.
  useEffect(() => {
    if (!isHome) {
      setActiva(null);
      return;
    }
    const secciones = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!secciones.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiva(e.target.id);
          else setActiva((a) => (a === e.target.id ? null : a));
        });
      },
      // Franja central de la pantalla: activa la seccion que la cruza.
      { rootMargin: '-45% 0px -50% 0px' }
    );
    secciones.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bloquear scroll con Lenis (no con body overflow, que rompe Lenis).
  useEffect(() => {
    const lenis = lenisRef?.current ?? window.__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenisRef]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!overlay.current) return;
    const el = overlay.current;

    if (reduced) {
      gsap.set(el, { autoAlpha: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' });
      return;
    }

    let tl;
    if (open) {
      tl = gsap.timeline();
      tl.set(el, { pointerEvents: 'auto', visibility: 'visible' })
        .to(el, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
        .fromTo(
          '[data-overlay-link]',
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
          '-=0.2'
        );
    } else {
      tl = gsap.timeline();
      tl.to(el, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => gsap.set(el, { pointerEvents: 'none', visibility: 'hidden' }),
      });
    }
    return () => tl?.kill();
  }, [open, reduced]);

  const handleLink = (e, id) => {
    e.preventDefault();
    setOpen(false);

    if (isHome) {
      const target = document.getElementById(id);
      if (target && scrollTo) scrollTo(target, { offset: -10 });
      else scrollToSection(id);
      window.history.replaceState(null, '', `#${id}`);
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <>
      <header
        // Abierto, el header sube sobre el overlay (z-overlay = 90): si no, el
        // overlay tapaba el boton de cerrar y no habia forma de salir.
        className={`pt-safe fixed inset-x-0 top-0 transition-colors duration-500 ease-cine ${
          open ? 'z-[91]' : 'z-40'
        } ${
          scrolled || open
            ? 'border-b border-white/[0.06] bg-void/85 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <nav
          className="shell flex h-[72px] items-center justify-between pr-[4.5rem] md:pr-10 lg:pr-16"
          aria-label={t.nav}
        >
          <Link
            to="/"
            className="block py-2"
            aria-label="CONTRA/LUZ — inicio"
            data-cursor="hover"
          >
            <Logo alt="" compacto className="w-[150px] md:w-[140px] lg:w-[178px]" />
          </Link>

          {/* Escritorio: secciones numeradas, Contacto como boton, y a la
              derecha Instagram + idioma (antes en la barra lateral). */}
          <div className="hidden items-center gap-4 md:flex lg:gap-8">
            <ul className="flex items-center gap-4 lg:gap-9">
              {LINKS.map((l, i) => {
                const actual = activa === l.id;
                if (l.id === 'contacto') {
                  return (
                    <li key={l.id}>
                      <a
                        href={l.href}
                        onClick={(e) => handleLink(e, l.id)}
                        aria-current={actual ? 'location' : undefined}
                        className={`inline-flex min-h-[44px] items-center border px-5 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors duration-400 hover:border-ember hover:bg-ember hover:text-void ${
                          actual ? 'border-ember bg-ember text-void' : 'border-ember/60 text-bone'
                        }`}
                        data-cursor="hover"
                      >
                        {t[l.key]}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={l.id}>
                    <a
                      href={l.href}
                      onClick={(e) => handleLink(e, l.id)}
                      aria-current={actual ? 'location' : undefined}
                      className={`group relative inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors duration-400 hover:text-bone ${
                        actual ? 'text-bone' : 'text-bone/75'
                      }`}
                      data-cursor="hover"
                    >
                      <span className="hidden text-[10px] tracking-normal text-ember lg:inline">0{i + 1}</span>
                      {t[l.key]}
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-2 left-0 h-px w-full origin-left bg-ember transition-transform duration-500 ease-cine group-hover:scale-x-100 ${
                          actual ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
            <span aria-hidden="true" className="h-5 w-px bg-white/15" />
            <div className="flex items-center">
              <InstagramLink iconClassName="h-5 w-5" className="h-11 w-11 text-bone/75 hover:text-ember" />
              <SelectorIdioma />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 items-center justify-end md:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? t.close : t.menu}
            data-cursor="hover"
          >
            <span className="relative block h-3.5 w-8">
              <span
                className={`absolute left-0 block h-px w-full bg-bone transition-all duration-400 ease-cine ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-bone transition-all duration-400 ease-cine ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      <div
        ref={overlay}
        id="menu-movil"
        className="fixed inset-0 z-overlay bg-void md:hidden"
        style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
        aria-hidden={!open}
      >
        <div className="rule-grid" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ left: `${(i / 4) * 100}%` }} />
          ))}
        </div>

        <div className="shell flex h-full flex-col justify-center pt-24">
          <span className="label mb-10">{t.nav}</span>

          <ul className="space-y-2">
            {LINKS.map((l, i) => (
              <li key={l.id} className="overflow-hidden">
                <a
                  href={l.href}
                  onClick={(e) => handleLink(e, l.id)}
                  data-overlay-link
                  tabIndex={open ? 0 : -1}
                  className="display flex items-baseline gap-5 text-[15vw] leading-[1.05] transition-colors hover:text-ember sm:text-[13vw]"
                >
                  <span className="label shrink-0">0{i + 1}</span>
                  {t[l.key]}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-14 space-y-2 border-t border-white/10 pt-6">
            <p className="label">{t.directContact}</p>
            <a
              href={`mailto:${EMAIL}`}
              tabIndex={open ? 0 : -1}
              className="inline-block py-2 font-mono text-sm text-bone transition-colors hover:text-ember"
            >
              {EMAIL}
            </a>
            <InstagramLink
              conTexto
              tabIndex={open ? 0 : -1}
              iconClassName="h-6 w-6"
              className="!justify-start font-mono text-sm text-bone"
            />
          </div>
        </div>
      </div>
    </>
  );
}
