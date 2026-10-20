import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { useLenis } from './hooks/useLenis';
import { useFinePointer, useReducedMotion } from './hooks/useMedia';

import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition';
import SidePanel from './components/SidePanel';
import { LanguageProvider } from './context/LanguageContext';

import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';

/**
 * App: envuelve todo en las capas globales (preloader, cursor, smooth scroll,
 * grano, viñeta) y enruta Home / Detalle de proyecto.
 */
export default function App() {
  const location = useLocation();
  const { scrollTo, lenisRef } = useLenis();
  const [loading, setLoading] = useState(true);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  // Al cambiar de ruta, arriba del todo respetando Lenis.
  useEffect(() => {
    const lenis = lenisRef.current ?? (typeof window !== 'undefined' ? window.__lenis : null);
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [location.pathname]);

  // Aviso al usuario de que el sitio ya esta listo.
  useEffect(() => {
    document.body.dataset.ready = 'true';
  }, []);

  const handleDone = useCallback(() => setLoading(false), []);

  return (
    <LanguageProvider>
      {/* Fondo fijo con material de pelicula (igual en dev y prod). */}
      <div className="film-grain vignette pointer-events-none fixed inset-0" aria-hidden="true" />

      {loading && <Preloader onDone={handleDone} />}

      <Cursor />
      <ScrollProgress />
      <Navbar scrollTo={scrollTo} lenisRef={lenisRef} />

      {/* Barra lateral (solo movil): Instagram + idioma. Va despues del
          Navbar en el DOM para que su z-[70] quede por encima del header. */}
      <SidePanel />

      <PageTransition locationKey={location.pathname} />

      {/* pr-12 = ancho de la barra lateral fija (solo movil): el contenido
          termina antes de ella y el .shell conserva sus margenes simetricos. */}
      <main
        className={`relative z-10 pr-12 md:pr-0 ${fine && !reduced ? 'cursor-none-lg' : ''}`}
      >
        <Routes>
          <Route path="/" element={<Home lenisRef={lenisRef} scrollTo={scrollTo} />} />
          <Route path="/proyecto/:id" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </LanguageProvider>
  );
}