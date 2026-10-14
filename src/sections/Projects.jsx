import { useEffect, useRef } from 'react';
import gsap from 'gsap';
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

        <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-24">
          {withIndex.map((p) => (
            <div key={p.id} data-card className={p.span === 'full' ? 'md:col-span-2' : ''}>
              <ProjectCard project={p} aspect={p.span === 'full' ? 'aspect-[16/10]' : 'aspect-[4/3]'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
