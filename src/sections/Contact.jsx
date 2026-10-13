import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SectionHeading from '../components/SectionHeading';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';

const EMAIL = 'estudio@contraluz.co';
const PHONE = '+57 604 123 4567';

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/contraluz.arq' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/contraluz-arq' },
  { label: 'Are.na', href: 'https://are.na/contraluz-arq' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Seccion Contacto: formulario solo-frontend (sin backend).
 * Valida nombre, mensaje y formato de email si se informa;
 * muestra exito visual y lo resetea al seguir escribiendo.
 */
export default function Contact() {
  const root = useRef(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const reduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-contact-reveal]', {
        y: 70,
        opacity: 0,
        duration: 2.2,
        stagger: 0.14,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

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

    setError('');
    setSent(true);
    form.reset();
  };

  return (
    <section ref={root} id="contacto" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="shell">
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
              <span className="label">{t.directPhone}</span>
              <a
                href={`tel:${PHONE.replace(/\s/g, '')}`}
                className="mt-3 block font-serif text-xl italic text-bone transition-colors hover:text-ember md:text-2xl"
                data-cursor="hover"
              >
                {PHONE}
              </a>
            </div>

            <div>
              <span className="label">{t.socials}</span>
              <ul className="mt-3 space-y-2">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 text-lg text-bone/80 transition-colors hover:text-ember"
                      data-cursor="hover"
                    >
                      <span className="h-px w-0 bg-ember transition-[width] duration-400 ease-cine group-hover:w-8" />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <span className="label">{t.officeLabel}</span>
              <p className="mt-3 font-mono text-xs leading-relaxed text-smoke">
                Calle 10 # 43-28
                <br />
                {t.officeCity}
                <br />
                <span className="text-ember/70">6.2442° N, 75.5812° W</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
