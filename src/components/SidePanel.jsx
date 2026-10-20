import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLang, UI } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useMedia';
import InstagramLink from './InstagramLink';

/**
 * BARRA DE IDIOMA + PANEL DE NAVEGACION
 * =====================================
 *
 * REPARTO DE RESPONSABILIDADES
 * ----------------------------
 * Hay DOS piezas separadas a proposito, con z-index distinto:
 *
 *   1. LA BARRA (siempre visible, discreta, z-[70])
 *      Solo contiene el selector ES / EN. Vive pegada al borde derecho, con
 *      un ancho minimo. Es lo UNICO que se ve en reposo.
 *
 *   2. EL PANEL (solo al acercarse el mouse, z-[65])
 *      La navegacion: Proyectos, Estudio, Contacto. Entra desde la derecha
 *      empujado por detras de la barra, y se va cuando el mouse se aleja.
 *
 * La barra queda POR ENCIMA del panel (z 70 > 65) y el panel arranca en
 * `right: 4rem`, asi que la barra nunca queda tapada: el idioma siempre esta
 * a mano, este abierto el menu o no.
 *
 * ACCESIBILIDAD
 * -------------
 * Un panel que solo abre con hover es inaccesible. Por eso:
 *   - La barra es un <button> real con aria-expanded y aria-controls.
 *   - Abre con hover (solo mouse) y con click/teclado; al abrir con click
 *     el foco pasa al primer enlace.
 *   - Escape cierra y devuelve el foco a la barra.
 *   - El foco se TRABA dentro del panel mientras esta abierto.
 *   - Los botones de idioma son botones reales con role="radio".
 *
 * MOVIL
 * -----
 * En movil la navegacion la da la hamburguesa del Navbar: aqui el boton de
 * menu se oculta (dos menus a la vez confundian) y la barra solo muestra el
 * idioma. En md+ tactil (tablets) la barra se toca y el panel abre como
 * drawer; al tocar fuera, se cierra.
 */

const LINKS = [
  { id: 'proyectos', key: 'projects' },
  { id: 'estudio', key: 'studio' },
  { id: 'contacto', key: 'contact' },
];

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export default function SidePanel({ scrollTo, lenisRef }) {
  const { lang, setLang } = useLang();
  const t = UI[lang];

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const firstLinkRef = useRef(null);
  const closeTimer = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const isHome = location.pathname === '/';

  /* ---- Apertura con retardo al salir, cierre inmediato al entrar ----
     Sin el retardo, el panel se cierra en el hueco entre la barra y el panel
     y hace un parpadeo nervioso. */
  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };
  // Hover solo con mouse real. En tactil el navegador emula mouseenter antes
  // del click: abria el panel y el toggle del click lo cerraba al instante.
  const onPointerEnter = (e) => {
    if (e.pointerType === 'mouse') openNow();
  };
  const onPointerLeave = (e) => {
    if (e.pointerType === 'mouse') closeSoon();
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /* ---- Animacion ---- */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { xPercent: open ? 0 : 110, autoAlpha: open ? 1 : 0 });
      return;
    }

    if (open) {
      gsap.to(el, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' });
      gsap.fromTo(
        '[data-panel-link]',
        { x: 36, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.75, stagger: 0.055, ease: 'expo.out', delay: 0.12 }
      );
    } else {
      gsap.to(el, {
        xPercent: 110,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.in',
      });
    }
  }, [open, reduced]);

  /* ---- Escape cierra y devuelve el foco ---- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* ---- Trampa de foco dentro del panel ---- */
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const f = el.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [open]);

  /* ---- En tactil, tocar fuera cierra ---- */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const goTo = (e, id) => {
    e.preventDefault();
    setOpen(false);
    if (isHome) {
      const target = document.getElementById(id);
      if (target && scrollTo) scrollTo(target, { offset: -10 });
      else {
        const lenis = lenisRef?.current ?? window.__lenis;
        if (lenis && target) lenis.scrollTo(target, { duration: 1.6, offset: -10 });
        else target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', `#${id}`);
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <>
      {/* ---------------- EL PANEL (detras de la barra) ---------------- */}
      <aside
        ref={panelRef}
        id="panel-lateral"
        role="dialog"
        aria-label={t.nav}
        // right-16 = arranca donde termina la barra, para no taparla.
        //
        // En movil el panel ocupa casi toda la pantalla (lo que queda a la
        // izquierda de la barra). Antes llevaba `hidden md:flex` y en movil
        // NUNCA aparecia: el boton Menu no hacia nada. Ahora es flex en todos
        // los tamanos y cambia de ancho en md+.
        className="fixed right-12 top-0 z-[65] flex h-full w-[calc(100vw-3rem)] max-w-[360px] flex-col justify-center border-l border-white/10 bg-void/97 px-8 py-28 backdrop-blur-xl md:right-16 md:w-[300px] md:max-w-none md:px-9"
        style={{ visibility: open ? 'visible' : 'hidden' }}
        aria-hidden={!open}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <nav aria-label={t.nav} className="relative">
          <span className="label">{t.nav}</span>

          <ul className="mt-7 space-y-1">
            {LINKS.map((l, i) => (
              <li key={l.id}>
                <a
                  ref={i === 0 ? firstLinkRef : null}
                  href={`#${l.id}`}
                  onClick={(e) => goTo(e, l.id)}
                  data-panel-link
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline gap-3 py-1.5 transition-colors hover:text-ember"
                >
                  <span className="font-mono text-[10px] text-ember/70 tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="display text-[2.1rem] leading-none transition-transform duration-500 ease-cine group-hover:translate-x-1.5 sm:text-[2.4rem] md:text-[2.6rem]">
                    {t[l.key]}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ---------------- LA BARRA (siempre visible) ---------------- */}
      <div
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className="pb-safe fixed right-0 top-0 z-[70] flex h-full w-12 flex-col items-center justify-between border-l border-white/10 bg-void/85 py-6 backdrop-blur-md transition-colors duration-500 hover:bg-void md:w-16"
      >
        {/* Disparador del menu */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            const next = !open;
            setOpen(next);
            // Al abrir con click/teclado el foco entra al panel (la trampa de
            // foco vive dentro del <aside>, no en la barra).
            if (next) requestAnimationFrame(() => firstLinkRef.current?.focus());
          }}
          aria-expanded={open}
          aria-controls="panel-lateral"
          aria-label={open ? t.close : t.menu}
          data-cursor="hover"
          className="group hidden h-16 w-10 flex-col items-center justify-center gap-2 md:flex"
        >
          <span
            aria-hidden="true"
            className={`label select-none transition-opacity duration-300 ${open ? 'opacity-40' : 'opacity-70'}`}
            style={{ writingMode: 'vertical-rl' }}
          >
            {t.menu}
          </span>
          <span aria-hidden="true" className="flex flex-col items-center gap-[4px]">
            <span
              className={`block h-px w-5 bg-bone transition-all duration-500 ease-cine ${
                open ? 'translate-y-[5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-5 bg-ember transition-all duration-500 ease-cine ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-px w-5 bg-bone transition-all duration-500 ease-cine ${
                open ? '-translate-y-[5px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>

        {/* Instagram + selector de idioma */}
        <div className="flex flex-col items-center gap-3">
        <InstagramLink iconClassName="h-5 w-5" className="text-smoke" />
        <div role="radiogroup" aria-label={t.language} className="flex flex-col items-center gap-1.5">
          {LANGS.map((opt) => {
            const active = lang === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={opt.label}
                onClick={() => setLang(opt.code)}
                data-cursor="hover"
                className={`h-11 w-11 font-mono text-[11px] uppercase transition-colors duration-400 ${
                  active
                    ? 'text-ember'
                    : 'text-smoke hover:text-bone'
                }`}
              >
                {opt.code}
                {/* Marca de estado sin cambiar el layout */}
                <span
                  aria-hidden="true"
                  className={`mx-auto mt-0.5 block h-px w-3 transition-colors duration-400 ${
                    active ? 'bg-ember' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </>
  );
}
