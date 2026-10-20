import { useLang, UI } from '../context/LanguageContext';

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

/**
 * Selector ES / EN (botones reales con role="radio").
 * `vertical` para la barra movil; horizontal para el navbar de escritorio.
 */
export default function SelectorIdioma({ vertical = false, className = '' }) {
  const { lang, setLang } = useLang();
  const t = UI[lang];

  return (
    <div
      role="radiogroup"
      aria-label={t.language}
      className={`flex items-center ${vertical ? 'flex-col gap-1.5' : 'gap-1'} ${className}`}
    >
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
              active ? 'text-ember' : 'text-smoke hover:text-bone'
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
  );
}
