import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Cinematic from '../components/Cinematic';
import Projects from '../sections/Projects';
import Studio from '../sections/Studio';
import Contact from '../sections/Contact';

/**
 * Home: recorrido (zoom por la luz) + proyectos + estudio + contacto.
 * El scroll a hashes usa Lenis cuando esta disponible.
 */
export default function Home({ lenisRef, scrollTo }) {
  const location = useLocation();

  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    } else {
      ScrollTrigger.refresh();
    }
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      const target = document.getElementById(id);
      if (!target) return;
      if (scrollTo) scrollTo(target, { offset: -10 });
      else {
        const lenis = lenisRef?.current ?? window.__lenis;
        if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: -10 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
    return () => clearTimeout(t);
  }, [location.hash, lenisRef, scrollTo]);

  return (
    <>
      {/* Titulo de la pagina para lectores de pantalla y buscadores: la
          portada visual es el recorrido, que no tiene un h1 propio. */}
      <h1 className="sr-only">CONTRA/LUZ — Arquitectura al descubierto</h1>
      <Cinematic lenisRef={lenisRef} />
      <Projects />
      <Studio />
      <Contact />
    </>
  );
}
