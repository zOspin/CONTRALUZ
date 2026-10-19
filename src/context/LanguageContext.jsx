import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * IDIOMA DEL SITIO
 * ================
 * Contexto minimo con el idioma actual y un toggle.
 * Estado es/en persistido en localStorage. Diccionario completo de UI:
 * todo texto visible pasa por `UI[lang]`.
 */

const LanguageContext = createContext(null);

const STORAGE_KEY = 'contraluz:lang';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'es';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
    const nav = window.navigator?.language?.toLowerCase() || 'es';
    return nav.startsWith('en') ? 'en' : 'es';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({ lang, setLang, toggle: () => setLang((l) => (l === 'es' ? 'en' : 'es')) }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang debe usarse dentro de <LanguageProvider>');
  return ctx;
}

/** Diccionario completo de la interfaz. */
export const UI = {
  es: {
    menu: 'Menú',
    close: 'Cerrar',
    nav: 'Navegación',
    projects: 'Proyectos',
    studio: 'Estudio',
    contact: 'Contacto',
    language: 'Idioma',
    home: 'Inicio',
    scroll: 'Scroll',
    architecture: 'Arquitectura — internacional',
    portfolio: 'Portfolio',
    tagline: 'Arquitectura moldeada por la luz.',
    badge2: '02 — La luz comanda',
    meta2: 'El volumen, la sombra, la hora',
    line21: 'La arquitectura',
    line22: 'revela el volumen',
    para2: 'Cada proyecto empieza con un estudio de luz. Modelamos el recorrido del sol sobre el sitio antes de dibujar una planta.',
    badge3: '03 — Fin del recorrido',
    line31: 'El scroll termina aquí.',
    line32: 'La luz no.',
    viewProjects: 'Ver proyectos',
    contactCta: 'Contacto',
    // Proyectos
    projectsTitle: 'Proyectos',
    projectsSubtitle: 'Selección 2020—2024',
    viewProject: 'Ver proyecto',
    // Estudio
    studioTitle: 'Estudio',
    studioSubtitle: 'Sobre nosotros',
    bio0: 'CONTRA/LUZ es el estudio de Santiago Quintero Ospina. Trabajamos sobre una convicción simple: la arquitectura no se mide en planos, sino en cómo la luz revela el volumen a lo largo del día.',
    bio1: 'Nuestro trabajo se mueve entre el comercio, la vivienda en el bosque y la escala pública. Nos interesan los materiales que envejecen bien — hormigón visto, piedra, madera tratada — y las decisiones que reducen el consumo sin reducir la belleza.',
    bio2: 'Cada proyecto empieza con un estudio de luz: modelamos el recorrido solar del sitio antes de dibujar una sola planta.',
    filoTitle: 'Filosofía',
    filoSub: 'Cuatro principios',
    filo1t: 'La luz primero',
    filo1x: 'Antes de la planta, el sol. Modelamos el recorrido del día sobre el terreno y dejamos que esa luz decida el proyecto.',
    filo2t: 'Materia cruda',
    filo2x: 'Hormigón visto, piedra del sitio, madera tratada. Materiales que envejecen bien y que se leen a los veinte años.',
    filo3t: 'Menos, mejor',
    filo3x: 'Cada elemento que se quita es un material que deja de deteriorarse y una decisión que no hay que sostener.',
    filo4t: 'El contexto manda',
    filo4x: 'No proyectamos sobre un lugar: proyectamos con él. La topografía, el clima y el paisaje ya tienen su orden.',
    statsTitle: 'El estudio en cifras',
    stat1: 'Años de experiencia',
    stat2: 'Proyectos construidos',
    stat3: 'Premios y distinciones',
    signLabel: 'Firma',
    signRole: 'Arquitecto — CONTRA/LUZ',
    dataStudio: 'Estudio',
    dataStudioV: 'CONTRA/LUZ — Arquitectura',
    dataFounded: 'Fundación',
    dataFoundedV: '2014',
    dataOffice: 'Oficina',
    dataOfficeV: 'Calle 10 # 43-28, Medellín',
    dataEmail: 'Correo',
    // Contacto
    contactTitle: 'Contacto',
    contactSubtitle: 'Hablemos',
    nameLabel: 'Tu nombre',
    namePh: 'Nombre y apellido',
    emailLabel: 'Email',
    emailPh: 'tu@email.com',
    msgLabel: 'Mensaje',
    msgPh: 'Contame sobre tu proyecto',
    sendBtn: 'Enviar mensaje',
    errRequired: 'Completá tu nombre y el mensaje.',
    errEmail: 'Revisá el email: parece incompleto.',
    sentMsg: 'Abrimos tu correo con el mensaje listo. Solo falta enviarlo.',
    mailSubject: 'Contacto desde la web',
    directEmail: 'Email',
    directPhone: 'Teléfono',
    socials: 'Redes',
    officeLabel: 'Estudio',
    officeCity: 'Medellín, Colombia',
    // Footer
    localTime: 'Hora local',
    coords: 'Coord.',
    rights: 'Arquitectura moldeada por la luz',
    directContact: 'Contacto directo',
    // Detalle
    backTo: '← Proyectos',
    specLocation: 'Ubicación',
    specArea: 'Área',
    specYear: 'Año',
    specCategory: 'Categoría',
    specStatus: 'Estado',
    techSheet: 'Ficha técnica',
    materials: 'Materiales',
    gallery: 'Galería',
    images: 'imágenes',
    nextProject: 'Siguiente proyecto',
    notFoundKicker: '404 — Proyecto no encontrado',
    notFoundTitle: 'Este proyecto no existe',
    notFoundBack: 'Volver a proyectos',
    // 404 global
    page404kicker: '404 — Página no encontrada',
    page404title: 'Nada por aquí',
    page404text: 'La ruta que buscás no existe en este portafolio.',
    page404back: 'Volver al inicio',
    reelKicker: 'Reel',
    reelSkip: 'Saltar',
  },
  en: {
    menu: 'Menu',
    reelKicker: 'Reel',
    reelSkip: 'Skip',
    close: 'Close',
    nav: 'Navigation',
    projects: 'Projects',
    studio: 'Studio',
    contact: 'Contact',
    language: 'Language',
    home: 'Home',
    scroll: 'Scroll',
    architecture: 'Architecture — international',
    portfolio: 'Portfolio',
    tagline: 'Architecture shaped by light.',
    badge2: '02 — Light commands',
    meta2: 'Volume, shadow, the hour',
    line21: 'Architecture',
    line22: 'reveals the volume',
    para2: 'Every project begins with a study of light. We model the sun across the site before drawing a single floor plan.',
    badge3: '03 — End of the scroll',
    line31: 'The scroll ends here.',
    line32: 'The light does not.',
    viewProjects: 'View projects',
    contactCta: 'Contact',
    projectsTitle: 'Projects',
    projectsSubtitle: 'Selection 2020—2024',
    viewProject: 'View project',
    studioTitle: 'Studio',
    studioSubtitle: 'About us',
    bio0: 'CONTRA/LUZ is the studio of Santiago Quintero Ospina. We work from a simple conviction: architecture is not measured in drawings, but in how light reveals volume throughout the day.',
    bio1: 'Our work moves between retail, forest housing and public scale. We care about materials that age well — exposed concrete, stone, treated timber — and decisions that cut consumption without cutting beauty.',
    bio2: 'Every project begins with a light study: we model the solar path of the site before drawing a single floor plan.',
    filoTitle: 'Philosophy',
    filoSub: 'Four principles',
    filo1t: 'Light first',
    filo1x: 'Before the plan, the sun. We model the course of the day across the terrain and let that light decide the project.',
    filo2t: 'Raw matter',
    filo2x: 'Exposed concrete, stone from the site, treated timber. Materials that age well and still read in twenty years.',
    filo3t: 'Less, better',
    filo3x: 'Every element removed is one less material to decay and one less decision to maintain.',
    filo4t: 'Context rules',
    filo4x: 'We do not design on top of a place: we design with it. Topography, climate and landscape already have their order.',
    statsTitle: 'The studio in numbers',
    stat1: 'Years of experience',
    stat2: 'Built projects',
    stat3: 'Awards and distinctions',
    signLabel: 'Signature',
    signRole: 'Architect — CONTRA/LUZ',
    dataStudio: 'Studio',
    dataStudioV: 'CONTRA/LUZ — Architecture',
    dataFounded: 'Founded',
    dataFoundedV: '2014',
    dataOffice: 'Office',
    dataOfficeV: 'Calle 10 # 43-28, Medellín',
    dataEmail: 'Email',
    contactTitle: 'Contact',
    contactSubtitle: "Let's talk",
    nameLabel: 'Your name',
    namePh: 'Full name',
    emailLabel: 'Email',
    emailPh: 'you@email.com',
    msgLabel: 'Message',
    msgPh: 'Tell me about your project',
    sendBtn: 'Send message',
    errRequired: 'Please add your name and message.',
    errEmail: 'Check the email: it looks incomplete.',
    sentMsg: 'Your email app is open with the message ready. Just hit send.',
    mailSubject: 'Contact from the website',
    directEmail: 'Email',
    directPhone: 'Phone',
    socials: 'Socials',
    officeLabel: 'Studio',
    officeCity: 'Medellín, Colombia',
    localTime: 'Local time',
    coords: 'Coord.',
    rights: 'Architecture shaped by light',
    directContact: 'Direct contact',
    backTo: '← Projects',
    specLocation: 'Location',
    specArea: 'Area',
    specYear: 'Year',
    specCategory: 'Category',
    specStatus: 'Status',
    techSheet: 'Fact sheet',
    materials: 'Materials',
    gallery: 'Gallery',
    images: 'images',
    nextProject: 'Next project',
    notFoundKicker: '404 — Project not found',
    notFoundTitle: 'This project does not exist',
    notFoundBack: 'Back to projects',
    page404kicker: '404 — Page not found',
    page404title: 'Nothing here',
    page404text: 'The route you are looking for does not exist in this portfolio.',
    page404back: 'Back home',
  },
};
