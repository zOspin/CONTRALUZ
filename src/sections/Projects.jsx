import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, localizeProject } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import SectionHeading from '../components/SectionHeading';
import { useReducedMotion, useCoarse } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';

/**
 * Seccion de proyectos: grilla asimetrica.
 * El campo `span` de cada proyecto define cuanto ocupa (movil primero).
 */
export default function Projects() {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const coarse = useCoarse();
  const { lang } = useLang();
  const t = UI[lang];

  const withIndex = projects.map((p, i) => ({ ...localizeProject(p, lang), index: i + 1, id: p.id, span: p.span }));

  // Filtro por la categoria en espanol (estable entre idiomas); la etiqueta
  // visible sale del proyecto ya localizado.
  const [filtro, setFiltro] = useState(null);
  const categorias = [...new Map(projects.map((p, i) => [p.category, withIndex[i].category]))];
  const visibles = filtro ? withIndex.filter((p, i) => projects[i].category === filtro) : withIndex;
  const primerRender = useRef(true);

  // Al cambiar el filtro: la grilla cambia de alto (recalcular los triggers
  // de abajo) y las tarjetas entran con un fundido corto.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    ScrollTrigger.refresh();
    if (reduced || !root.current) return;
    const cards = root.current.querySelectorAll('[data-card]');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out', overwrite: true }
    );
  }, [filtro, reduced]);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-card]', {
        y: coarse ? 40 : 90,
        opacity: 0,
        duration: coarse ? 1.2 : 2.2,
        stagger: 0.14,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced, coarse]);

  return (
    <section ref={root} id="proyectos" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="rule-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ left: `${(i / 4) * 100}%` }} />
        ))}
      </div>

      <div className="shell relative z-10">
        <SectionHeading
          num="01"
          title={t.projectsTitle}
          subtitle={t.projectsSubtitle}
        />

        <div className="-mt-4 mb-12 flex flex-wrap items-center gap-x-1 md:gap-x-2 md:-mt-8 md:mb-16" role="group" aria-label={t.filterLabel}>
          {[[null, t.filterAll], ...categorias].map(([valor, etiqueta]) => {
            const activo = filtro === valor;
            const n = valor ? projects.filter((p) => p.category === valor).length : projects.length;
            return (
              <button
                key={valor ?? 'todos'}
                type="button"
                aria-pressed={activo}
                onClick={() => setFiltro(valor)}
                data-cursor="hover"
                className={`label inline-flex min-h-[44px] items-center gap-1.5 px-2 transition-colors md:gap-2 md:px-3 duration-300 first:pl-0 hover:text-bone ${
                  activo ? 'text-bone' : 'text-smoke'
                }`}
              >
                <span
                  className={`h-px w-3 origin-left bg-ember md:w-5 transition-transform duration-500 ease-cine ${
                    activo ? 'scale-x-100' : 'scale-x-0'
                  }`}
                  aria-hidden="true"
                />
                {etiqueta}
                <sup className="tabular-nums text-[0.6rem] text-smoke">{String(n).padStart(2, '0')}</sup>
              </button>
            );
          })}
          <span className="sr-only" aria-live="polite">{t.filterCount(visibles.length)}</span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-24">
          {visibles.map((p) => (
            <div key={p.id} data-card className={p.span === 'full' ? 'md:col-span-2' : ''}>
              <ProjectCard project={p} aspect={p.span === 'full' ? 'aspect-[16/10]' : 'aspect-[4/3]'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
