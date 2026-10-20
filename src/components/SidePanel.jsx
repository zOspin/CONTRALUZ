import InstagramLink from './InstagramLink';
import SelectorIdioma from './SelectorIdioma';

/**
 * BARRA LATERAL (solo movil)
 * ==========================
 * Franja fija en el borde derecho con Instagram y el selector ES / EN.
 * La navegacion en movil la da la hamburguesa del Navbar.
 *
 * En md+ no existe: el idioma y el Instagram viven en el Navbar y el
 * contenido usa todo el ancho (main solo reserva pr-12 en movil).
 */
export default function SidePanel() {
  return (
    <div className="pb-safe fixed right-0 top-0 z-[70] flex h-full w-12 flex-col items-center justify-end border-l border-white/10 bg-void/85 py-6 backdrop-blur-md md:hidden">
      <div className="flex flex-col items-center gap-3">
        <InstagramLink iconClassName="h-5 w-5" className="text-smoke" />
        <SelectorIdioma vertical />
      </div>
    </div>
  );
}
