import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SectionHeading from '../components/SectionHeading';
import { useReducedMotion, useCoarse } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';
import { EMAIL } from '../data/contacto';
import InstagramLink from '../components/InstagramLink';
import Logo from '../components/Logo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Seccion Contacto: formulario solo-frontend (sin backend).
 * Valida nombre, mensaje y formato de email si se informa; al enviar abre
 * el cliente de correo con el mensaje redactado hacia EMAIL.
 */
export default function Contact() {
  const root = useRef(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const reduced = useReducedMotion();
  const coarse = useCoarse();
  const { lang } = useLang();
  const t = UI[lang];

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-contact-reveal]', {
        y: coarse ? 32 : 70,
        opacity: 0,
        duration: coarse ? 1.2 : 2.2,
        stagger: 0.14,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      });

      // Logo de fondo en profundidad: sube mas lento que el scroll y se
      // acerca un poco, como un plano lejano (solo transform y opacity).
      gsap.fromTo(
        '[data-logo-fondo]',
        { yPercent: 35, scale: 0.94, opacity: 0 },
        {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, [reduced, coarse]);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !message) {
      setError(t.errRequired);
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      setError(t.errEmail);
      return;
    }

    // Sin backend: el mensaje sale por el cliente de correo del visitante,
    // ya redactado. Antes se mostraba "recibido" sin enviar nada.
    const subject = `${t.mailSubject} — ${name}`;
    const body = `${message}

— ${name}${email ? ` <${email}>` : ''}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setError('');
    setSent(true);
    form.reset();
  };

  return (
    <section ref={root} id="contacto" className="relative scroll-mt-24 overflow-hidden pt-24 md:pt-36">
      {/* Logo grande al fondo, detras del contenido (antes en el footer). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-28 z-0 flex justify-center px-6 md:bottom-16 md:px-10 lg:px-16"
      >
        <div data-logo-fondo className="w-full max-w-[1400px]">
          <Logo alt="" className="w-full opacity-[0.07]" />
        </div>
      </div>

      <div className="shell relative z-10">
        <SectionHeading num="03" title={t.contactTitle} subtitle={t.contactSubtitle} />

        <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2">
          <div data-contact-reveal>
            <form onSubmit={onSubmit} className="space-y-8" noValidate>
              <div>
                <label htmlFor="nombre" className="label">
                  {t.nameLabel}
                </label>
                <input
                  id="nombre"
                  name="name"
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder={t.namePh}
                  onChange={() => sent && setSent(false)}
                  aria-describedby="contacto-error"
                  className="mt-3 w-full border-b border-white/15 bg-transparent pb-3 text-lg text-bone placeholder:text-smoke/60 transition-colors focus:border-ember focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  {t.emailLabel}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={120}
                  autoComplete="email"
                  placeholder={t.emailPh}
                  onChange={() => sent && setSent(false)}
                  aria-describedby="contacto-error"
                  className="mt-3 w-full border-b border-white/15 bg-transparent pb-3 text-lg text-bone placeholder:text-smoke/60 transition-colors focus:border-ember focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="label">
                  {t.msgLabel}
                </label>
                <textarea
                  id="mensaje"
                  name="message"
                  rows={4}
                  required
                  maxLength={2000}
                  placeholder={t.msgPh}
                  onChange={() => sent && setSent(false)}
                  aria-describedby="contacto-error"
                  className="mt-3 w-full resize-none border-b border-white/15 bg-transparent pb-3 text-lg leading-relaxed text-bone placeholder:text-smoke/60 transition-colors focus:border-ember focus:outline-none"
                />
              </div>

              {error && (
                <p id="contacto-error" role="alert" className="font-mono text-xs text-ember">
                  {error}
                </p>
              )}

              {sent && (
                <p
                  role="status"
                  className="border-l-2 border-ember bg-coal px-4 py-3 font-mono text-sm text-bone"
                >
                  {t.sentMsg}
                </p>
              )}

              <button
                type="submit"
                className="group relative inline-flex items-center gap-4 overflow-hidden border border-bone/25 px-8 py-4 font-mono text-xs uppercase tracking-wide3 text-bone transition-colors duration-400 hover:border-ember hover:text-ember"
                data-cursor="hover"
              >
                {t.sendBtn}
                <span className="transition-transform duration-400 ease-cine group-hover:translate-x-1.5">
                  →
                </span>
              </button>
            </form>
          </div>

          <div data-contact-reveal className="space-y-12 border-t border-white/10 pt-12 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <div>
              <span className="label">{t.directEmail}</span>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-3 block font-serif text-xl italic text-bone transition-colors hover:text-ember md:text-2xl"
                data-cursor="hover"
              >
                {EMAIL}
              </a>
            </div>

            <div>
              <span className="label">Instagram</span>
              <div className="mt-2">
                <InstagramLink
                  conTexto
                  iconClassName="h-7 w-7"
                  className="!justify-start font-serif text-xl italic text-bone md:text-2xl"
                />
              </div>
            </div>

            <div className="pt-6">
              <span className="label">{t.officeLabel}</span>
              <p className="mt-3 font-mono text-xs leading-relaxed text-smoke">
                Urbanización Los Cabos
                <br />
                {t.officeCity}
                <br />
                <span className="text-ember/70">6.2442° N, 75.5812° W</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-48 flex flex-col gap-2 border-t border-white/10 py-6 text-center md:mt-56 md:flex-row md:justify-between md:text-left lg:mt-72">
          <p className="label">© {new Date().getFullYear()} CONTRA/LUZ</p>
          <p className="label">{t.rights}</p>
        </div>
      </div>
    </section>
  );
}
