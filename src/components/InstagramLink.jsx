import { INSTAGRAM } from '../data/contacto';

/** Icono de Instagram (trazo, hereda el color del texto). */
export function InstagramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Enlace directo al Instagram del estudio. Abre en pestana nueva.
 * `conTexto` agrega el @usuario al lado del icono.
 */
export default function InstagramLink({ className = '', iconClassName, conTexto = false, tabIndex }) {
  return (
    <a
      href={INSTAGRAM.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram ${INSTAGRAM.usuario}`}
      data-cursor="hover"
      tabIndex={tabIndex}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-3 transition-colors hover:text-ember ${className}`}
    >
      <InstagramIcon className={iconClassName} />
      {conTexto ? <span>{INSTAGRAM.usuario}</span> : null}
    </a>
  );
}
