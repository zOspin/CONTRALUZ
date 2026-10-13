import { Link } from 'react-router-dom';
import ProjectImage from './ProjectImage';
import { useLang, UI } from '../context/LanguageContext';
import { localizeProject } from '../data/projects';

/**
 * Tarjeta de proyecto para la grilla asimetrica.
 * 'third' se trata como 'half' por compatibilidad.
 */
export default function ProjectCard({ project, aspect = 'aspect-[4/3]' }) {
  const { lang } = useLang();
  const t = UI[lang];
  const p = localizeProject(project, lang);

  const spanClass =
    {
      full: 'md:col-span-2',
      half: 'md:col-span-1',
      third: 'md:col-span-1',
    }[project.span] ?? 'md:col-span-1';

  return (
    <article className={`group ${spanClass}`}>
      <Link
        to={`/proyecto/${project.id}`}
        className="block rounded-[2px] focus-visible:outline-ember"
        aria-label={`${p.name}, ${p.year}, ${p.category}`}
        data-cursor="hover"
      >
        <div className="relative overflow-hidden">
          <ProjectImage
            src={p.cover}
            alt={p.alt}
            aspect={aspect}
            priority={false}
            parallax
          />

          <span className="label absolute left-5 top-5 z-10 text-bone/70">
            {String(p.index).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <h3 className="mask-line">
            <span className="display translate-y-0 text-[7vw] transition-transform duration-500 ease-cine group-hover:translate-y-[-0.15em] group-focus-within:translate-y-[-0.15em] sm:text-[5vw] md:text-[3.2vw] lg:text-[2.4rem]">
              {p.name}
            </span>
          </h3>

          <span className="label shrink-0 pt-2 tabular-nums">{p.year}</span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="label">{p.category}</span>
          <span className="h-px w-6 bg-white/20" />
          <span className="label text-ember opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100">
            {t.viewProject}
          </span>
        </div>
      </Link>
    </article>
  );
}
