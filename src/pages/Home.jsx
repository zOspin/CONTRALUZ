import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../sections/Hero';
import Cinematic from '../components/Cinematic';
import Projects from '../sections/Projects';
import Studio from '../sections/Studio';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

/**
 * Home: hero + proyectos + estudio + contacto + footer.
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
      <Cinematic lenisRef={lenisRef} />
      <Hero lenisRef={lenisRef} />
      <Projects />
      <Studio />
      <Contact />
      <Footer scrollTo={scrollTo} lenisRef={lenisRef} />
    </>
  );
}
