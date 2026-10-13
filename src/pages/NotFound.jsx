import { useLocation, Link } from 'react-router-dom';
import { useLang, UI } from '../context/LanguageContext';

export default function NotFound() {
  const { lang } = useLang();
  const t = UI[lang];
  const location = useLocation();

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 pt-[72px] text-center">
      <span className="label">{t.page404kicker}</span>
      <h1 className="display text-5xl md:text-7xl">{t.page404title}</h1>
      <p className="max-w-md text-base leading-relaxed text-bone/70">
        {t.page404text}{' '}
        <span className="font-mono text-xs text-smoke">{location.pathname}</span>
      </p>
      <Link
        to="/"
        className="font-mono text-sm text-ember underline underline-offset-4"
        data-cursor="hover"
      >
        {t.page404back}
      </Link>
    </section>
  );
}
