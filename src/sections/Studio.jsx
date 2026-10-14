import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SectionHeading from '../components/SectionHeading';
import Stat from '../components/Stat';
import { useReducedMotion, useCoarse } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';

export default function Studio() {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const coarse = useCoarse();
  const { lang } = useLang();
  const t = UI[lang];

  const BIO = [t.bio0, t.bio1, t.bio2];
  const FILOSOFIA = [
    { n: '01', title: t.filo1t, text: t.filo1x },
    { n: '02', title: t.filo2t, text: t.filo2x },
    { n: '03', title: t.filo3t, text: t.filo3x },
    { n: '04', title: t.filo4t, text: t.filo4x },
  ];
  const CIFRAS = [
    { value: 12, label: t.stat1 },
    { value: 38, label: t.stat2 },
    { value: 9, label: t.stat3 },
  ];
  const CONTACTO = [
    { label: t.dataStudio, value: t.dataStudioV },
    { label: t.dataFounded, value: t.dataFoundedV },
    { label: t.dataOffice, value: t.dataOfficeV },
    { label: t.dataEmail, value: 'estudio@contraluz.co' },
  ];

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-bio]', {
        y: coarse ? 36 : 80,
        opacity: 0,
        filter: 'blur(10px)',
        duration: coarse ? 1.2 : 2.2,
        stagger: 0.16,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });

      gsap.from('[data-principio]', {
        y: coarse ? 30 : 60,
        opacity: 0,
        duration: coarse ? 1.1 : 2,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-filosofia]', start: 'top 86%', once: true },
      });

      gsap.from('[data-firma]', {
        x: -30,
        opacity: 0,
        duration: 2.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-firma]', start: 'top 92%', once: true },
      });

      gsap.from('[data-dato]', {
        x: 24,
        opacity: 0,
        duration: 1.8,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-datos]', start: 'top 88%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced, coarse]);

  return (
    <section ref={root} id="estudio" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="rule-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ left: `${(i / 4) * 100}%` }} />
        ))}
      </div>

      <div className="shell relative z-10">
        <SectionHeading num="02" title={t.studioTitle} subtitle={t.studioSubtitle} />

        <div className="grid grid-cols-1 gap-x-16 gap-y-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-7">
              {BIO.map((paragraph, i) => (
                <p
                  key={`${lang}-${i}`}
                  data-bio
                  className={
                    i === 0
                      ? 'font-serif text-xl italic leading-relaxed text-bone md:text-2xl'
                      : 'max-w-lg text-base leading-relaxed text-bone/70'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div data-firma className="mt-12 border-l border-ember/40 pl-6">
              <span className="label">{t.signLabel}</span>
              <p className="mt-3 font-serif text-2xl italic text-bone/80">
                Santiago Quintero Ospina
                <span className="mt-1 block font-sans text-sm not-italic tracking-wide text-ember">
                  {t.signRole}
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-14">
            <span className="label">{t.statsTitle}</span>

            <div className="mt-10 space-y-14">
              {CIFRAS.map((c, i) => (
                <Stat key={`${lang}-${c.label}`} value={c.value} label={c.label} index={i} />
              ))}
            </div>
          </div>
        </div>

        <div data-filosofia className="mt-28 border-t border-white/10 pt-16 md:mt-36">
          <div className="mb-12 flex items-center gap-5">
            <span className="label text-ember">{t.filoTitle}</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="label hidden sm:block">{t.filoSub}</span>
          </div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {FILOSOFIA.map((f) => (
              <div key={f.n} data-principio className="group">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-ember tabular-nums">{f.n}</span>
                  <h3 className="display text-[7vw] leading-none text-bone sm:text-[3.4vw] lg:text-[1.75rem]">
                    {f.title}
                  </h3>
                </div>
                <div className="mt-4 h-px w-full bg-white/10 transition-colors duration-500 group-hover:bg-ember/50" />
                <p className="mt-4 text-sm leading-relaxed text-bone/60">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          data-datos
          className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-14 md:grid-cols-4"
        >
          {CONTACTO.map((d) => (
            <div key={d.label} data-dato>
              <span className="label">{d.label}</span>
              <p className="mt-2 font-serif text-lg italic text-bone/80">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
