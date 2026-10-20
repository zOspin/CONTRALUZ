import { useEffect } from 'react';
import { SITE_URL } from '../data/sitio';

const absoluta = (ruta) => new URL(ruta, SITE_URL).href;

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el && value) el.setAttribute(attr, value);
}

/**
 * Titulo, descripcion, canonical y Open Graph por ruta.
 * index.html trae los valores del Home; cada pagina los ajusta al montar
 * y los devuelve al salir, para que /proyecto/:id no declare "/" como canonica.
 */
export default function usePageMeta({ title, description, path, image }) {
  useEffect(() => {
    const previo = {
      title: document.title,
      description: document.head.querySelector('meta[name="description"]')?.content,
      canonical: document.head.querySelector('link[rel="canonical"]')?.href,
      image: document.head.querySelector('meta[property="og:image"]')?.content,
    };

    const url = absoluta(path);
    const img = image ? absoluta(image) : null;
    if (title) document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', img);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', img);

    return () => {
      document.title = previo.title;
      setMeta('meta[name="description"]', 'content', previo.description);
      setMeta('link[rel="canonical"]', 'href', previo.canonical);
      setMeta('meta[property="og:url"]', 'content', previo.canonical);
      setMeta('meta[property="og:title"]', 'content', previo.title);
      setMeta('meta[property="og:description"]', 'content', previo.description);
      setMeta('meta[property="og:image"]', 'content', previo.image);
      setMeta('meta[name="twitter:title"]', 'content', previo.title);
      setMeta('meta[name="twitter:description"]', 'content', previo.description);
      setMeta('meta[name="twitter:image"]', 'content', previo.image);
    };
  }, [title, description, path, image]);
}
