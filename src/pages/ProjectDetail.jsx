import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { getProject, projects, localizeProject } from '../data/projects';
import ProjectImage from '../components/ProjectImage';
import Lightbox from '../components/Lightbox';
import { useReducedMotion } from '../hooks/useMedia';
import { useLang, UI } from '../context/LanguageContext';
import { scrollToTop } from '../hooks/useLenis';
import usePageMeta from '../hooks/usePageMeta';

/**
 * Detalle de proyecto: galeria grande, descripcion y ficha tecnica.
 * Ruta: /proyecto/:id
 */
export default function ProjectDetail() {
  const { id } = useParams();
  const root = useRef(null);
  const reduced = useReducedMotion();
  const { lang } = useLang();
  const t = UI[lang];
  const raw = getProject(id);
  const project = localizeProject(raw, lang);
  const [visor, setVisor] = useState(null); // indice abierto en el lightbox

  usePageMeta({
    title: project ? `${project.name} — CONTRA/LUZ` : undefined,
    description: project?.excerpt,
    path: `/proyecto/${id}`,
    image: project?.cover,
  });

  useEffect(() => {
    scrollToTop(true);
    setVisor(null);
  }, [id]);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !project) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-detail-reveal]', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.15,
      });
    }, root);

    return () => ctx.revert();
  }, [reduced, id, lang]);

  if (!project) {
    return (
      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 pt-[72px] text-center">
        <span className="label">{t.notFoundKicker}</span>
        <h1 className="display text-4xl">{t.notFoundTitle}</h1>
        <Link
          to="/#proyectos"
          className="font-mono text-sm text-ember underline underline-offset-4"
        >
          {t.notFoundBack}
        </Link>
      </section>
    );
  }

  const currentIndex = projects.findIndex((p) => p.id === id);
  const nextRaw = projects[(currentIndex + 1) % projects.length];
  const next = localizeProject(nextRaw, lang);

  const vista = (i) => `${project.name} — ${lang === 'en' ? 'view' : 'vista'} ${i + 1}`;
  const portadaEnGaleria = project.gallery.indexOf(project.cover);
  // Disparador del visor: boton a todo el ancho que envuelve la imagen.
  const ampliar = (i) => ({
    type: 'button',
    onClick: () => setVisor(i),
    'aria-label': t.lbOpen(i + 1, project.gallery.length),
    'data-cursor': 'hover',
    className: 'block w-full cursor-zoom-in text-left focus-visible:outline-ember',
  });

  const spec = [
    { label: t.specLocation, value: project.location },
    { label: t.specArea, value: project.area },
    { label: t.specYear, value: project.year },
    { label: t.specCategory, value: project.category },
    { label: t.specStatus, value: project.status },
  ].filter((s) => s.value); // campos sin confirmar no se muestran

  return (
    <article ref={root} className="pt-[72px]">
      <header className="shell pb-12 pt-16 md:pb-20 md:pt-24">
        <div data-detail-reveal className="mb-8 flex items-center gap-5">
          <Link to="/#proyectos" className="label inline-flex min-h-[44px] items-center transition-colors hover:text-ember">
            {t.backTo}
          </Link>
          <span className="h-px flex-1 bg-white/10" />
          <span className="label tabular-nums">{project.year}</span>
        </div>

        <h1 data-detail-reveal className="display text-[15vw] leading-[0.85] sm:text-[12vw] md:text-[9vw] lg:text-[7rem]">
          {project.name}
        </h1>

        <p data-detail-reveal className="mt-6 max-w-xl font-serif text-lg italic text-bone/75 md:text-2xl">
          {project.excerpt}
        </p>
      </header>

      <div data-detail-reveal className="shell">
        {portadaEnGaleria >= 0 ? (
          <button {...ampliar(portadaEnGaleria)}>
            <ProjectImage src={project.cover} alt={project.alt} aspect="aspect-[16/9]" priority parallax hoverZoom={false} color />
          </button>
        ) : (
          <ProjectImage src={project.cover} alt={project.alt} aspect="aspect-[16/9]" priority parallax hoverZoom={false} color />
        )}
      </div>

      <div className="shell mt-16 md:mt-24">
        <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2">
          <div data-detail-reveal className="space-y-6">
            {project.description.map((para, i) => (
              <p key={`${lang}-${i}`} className="max-w-lg text-base leading-relaxed text-bone/75">
                {para}
              </p>
            ))}

            <div className="pt-4">
              <span className="label">{t.materials}</span>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.materials.map((m) => (
                  <li
                    key={m}
                    className="border border-white/15 px-3 py-1.5 font-mono text-xs text-bone/80"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div data-detail-reveal className="border-t border-white/10 pt-10 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <span className="label">{t.techSheet}</span>
            <dl className="mt-8 divide-y divide-white/10">
              {spec.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="label">{s.label}</dt>
                  <dd className="text-right font-serif text-lg italic text-bone">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="shell mt-24 md:mt-36" aria-label={`${t.gallery} — ${project.name}`}>
        <div className="mb-10 flex items-center gap-5">
          <span className="label text-ember">{t.gallery}</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="label">{String(project.gallery.length).padStart(2, '0')} {t.images}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {project.gallery.map((src, i) => (
            <div
              key={i}
              data-detail-reveal
              className={i === 0 ? 'md:col-span-2' : ''}
            >
              <button {...ampliar(i)}>
                <ProjectImage
                  src={src}
                  alt={vista(i)}
                  aspect={i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}
                  parallax
                  color
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <Lightbox
        images={project.gallery}
        index={visor}
        onIndex={setVisor}
        onClose={() => setVisor(null)}
        altFor={vista}
      />

      <section className="shell mt-24 border-t border-white/10 pt-16 md:mt-36 md:pt-24">
        <span className="label">{t.nextProject}</span>
        <Link
          to={`/proyecto/${nextRaw.id}`}
          className="group mt-6 block"
          data-cursor="hover"
        >
          <div className="overflow-hidden">
            <h2 className="display translate-y-0 text-[13vw] transition-transform duration-500 ease-cine group-hover:translate-x-3 group-focus-within:translate-x-3 sm:text-[10vw] md:text-[7vw] lg:text-[5rem]">
              {next.name}
            </h2>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="label">{next.category}</span>
            <span className="h-px w-10 bg-ember transition-[width] duration-500 group-hover:w-24" />
            <span className="label text-ember">{t.viewProject} →</span>
          </div>
        </Link>
      </section>
    </article>
  );
}
