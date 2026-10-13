/**
 * PROYECTOS
 * ==========
 * Renders y fotografías reales del estudio. Las imágenes viven en
 * /public/proyectos/ y se referencian con ruta absoluta.
 *
 * Para agregar un proyecto:
 *   1. Copia las imágenes a /public/proyectos/
 *   2. Agrega el objeto con las rutas '/proyectos/tu-imagen.jpg'
 *   3. Elige el `span` para la grilla asimetrica: 'full' | 'half'
 *      ('third' se trata como 'half' por compatibilidad)
 *
 * Campo `span` controla el ancho en la grilla (movil primero):
 *   'full' -> ocupa 2 columnas en md+
 *   'half' -> 1 columna
 *
 * Cada proyecto lleva campos es + sufijo _en para el toggle de idioma.
 */

export const projects = [
  {
    id: 'liuto',
    name: 'Liuto',
    year: '2024',
    category: 'Cultural',
    category_en: 'Cultural',
    location: 'Hong Kong, China',
    location_en: 'Hong Kong, China',
    area: '3200 m²',
    status: 'En proyecto',
    status_en: 'In progress',
    span: 'full',
    cover: '/proyectos/liuto-01.jpg',
    alt: 'Paseo elevado entre la vegetacion hacia un centro de visitantes iluminado en la montana',
    alt_en: 'Elevated walkway through vegetation towards a lit visitor center on the mountain',
    excerpt: 'Un centro de visitantes en la ladera de la montaña, suspendido entre la niebla y el bosque.',
    excerpt_en: 'A visitor center on the mountainside, suspended between mist and forest.',
    description: [
      'Liuto se implanta en la ladera del Edwardian Garden, dentro del Kowloon-Canton Railway Museum de Hong Kong. El programa —un centro de visitantes y un parque deportivo— se organiza sobre un paseo elevado que atraviesa la vegetación sin tocar el suelo: el sendero preexistente se conserva y se convierte en el eje del proyecto.',
      'La cubierta ondulada resuelve dos cosas a la vez: protege del monzón y deja entrar la luz justo donde hace falta. Además devuelve un gesto formal a una topografía que ya tenía su propio orden. Es un techo que no se impone, sino que acompaña.',
      'El proyecto trabaja la idea de la infraestructura como experiencia. El visitante no entra a un edificio: entra a un paisaje que resulta tener un edificio dentro.',
    ],
    description_en: [
      'Liuto sits on the slope of the Edwardian Garden, within the Kowloon-Canton Railway Museum in Hong Kong. The program — a visitor center and a sports park — is organized along an elevated walkway that crosses the vegetation without touching the ground: the existing trail is preserved and becomes the axis of the project.',
      'The undulating roof solves two things at once: it shelters from the monsoon and lets light in exactly where needed. It also returns a formal gesture to a topography that already had its own order. A roof that accompanies rather than imposes.',
      'The project treats infrastructure as experience. The visitor does not enter a building: they enter a landscape that happens to hold a building inside.',
    ],
    materials: ['Madera laminada', 'Acero corten', 'Bambú', 'Piedra de cantera'],
    gallery: [
      '/proyectos/liuto-01.jpg',
      '/proyectos/liuto-02.jpg',
      '/proyectos/liuto-03.jpg',
      '/proyectos/liuto-04.jpg',
    ],
  },
  {
    id: 'luz-de-hecate',
    name: 'Luz de Hecate',
    year: '2024',
    category: 'Residencial',
    category_en: 'Residential',
    location: 'Bosque atlántico',
    location_en: 'Atlantic forest',
    area: '480 m²',
    status: 'En proyecto',
    status_en: 'In progress',
    span: 'half',
    cover: '/proyectos/hecate-01.jpg',
    alt: 'Residencia de madera y piedra entre el bosque con cubierta a dos aguas y luz calida al anochecer',
    alt_en: 'Timber and stone house in the forest with gabled roof and warm light at dusk',
    excerpt: 'Una casa que se refugia en el bosque sin esconderse.',
    excerpt_en: 'A house that shelters in the forest without hiding.',
    description: [
      'Tres volúmenes con cubierta a dos aguas se ordenan sobre la ladera, siguiendo la caída del terreno. La casa no se apoya contra el bosque: se acomoda entre los árboles, y donde un árbol ocupa el lugar previsto, la cubierta se acorta y deja que la copa atraviese el plano.',
      'La materialidad es deliberadamente cruda: madera de eucalipto tratada con aceite, piedra del propio sitio en los muros de contención, y hormigón visto solo donde hace falta sostener el terreno.',
      'El agua corre. Una cascada construida sobre el afloramiento rocoso más cercano enfría el patio y marca el recorrido desde el acceso hasta la casa, tres peldaños abajo.',
    ],
    description_en: [
      'Three gabled volumes step down the slope, following the fall of the terrain. The house does not lean against the forest: it settles between the trees, and where a tree stands in the planned spot, the roof shortens to let the canopy pass through.',
      'The materiality is deliberately raw: oil-treated eucalyptus timber, stone from the site in the retaining walls, and exposed concrete only where the ground must be held.',
      'Water runs. A cascade built over the nearest rock outcrop cools the courtyard and marks the path from the entrance down to the house, three steps below.',
    ],
    materials: ['Eucalipto tratado', 'Piedra local', 'Hormigón visto', 'Corcho expandido'],
    gallery: ['/proyectos/hecate-01.jpg', '/proyectos/hecate-02.jpg', '/proyectos/hecate-03.jpg'],
  },
  {
    id: 'spa',
    name: 'Spa',
    year: '2023',
    category: 'Residencial',
    category_en: 'Residential',
    location: 'Valle de montaña',
    location_en: 'Mountain valley',
    area: '310 m²',
    status: 'Construido',
    status_en: 'Built',
    span: 'half',
    cover: '/proyectos/spa-01.jpg',
    alt: 'Vivienda en el bosque al atardecer con iluminacion artificial calida y chimenea exterior',
    alt_en: 'House in the forest at dusk with warm artificial light and outdoor fireplace',
    excerpt: 'La hora en que el bosque deja de ser fondo.',
    excerpt_en: 'The hour when the forest stops being a backdrop.',
    description: [
      'Spa se diseñó para la hora azul. Durante el día la casa se esconde entre los árboles; al atardecer, cuando la envolvente oscura desaparece, solo quedan los puntos de luz. El proyecto se dibuja al revés: primero la iluminación, después la arquitectura.',
      'La cubierta vegetal del ala principal no es decorativa: estabiliza la temperatura interior y reduce la demanda estimada de climatización frente a una cubierta convencional.',
      'El fuego —un hogar exterior de piedra— organiza la vida al aire libre. Todo el programa de convivencia se despliega alrededor de él.',
    ],
    description_en: [
      'Spa was designed for the blue hour. By day the house hides among the trees; at dusk, when the dark envelope disappears, only points of light remain. The project is drawn backwards: lighting first, architecture after.',
      'The green roof of the main wing is not decorative: it stabilizes indoor temperature and lowers the estimated cooling demand compared to a conventional roof.',
      'Fire — an outdoor stone hearth — organizes life outside. The whole gathering program unfolds around it.',
    ],
    materials: ['Acero negro', 'Ladrillo visto', 'Nogueira', 'Cubierta vegetal'],
    gallery: ['/proyectos/spa-01.jpg', '/proyectos/spa-02.jpg', '/proyectos/spa-03.jpg'],
  },
];

export const getProject = (id) => projects.find((p) => p.id === id);

/** Devuelve los campos localizados según idioma (es por defecto). */
export function localizeProject(p, lang) {
  if (!p || lang !== 'en') return p;
  return {
    ...p,
    category: p.category_en ?? p.category,
    location: p.location_en ?? p.location,
    status: p.status_en ?? p.status,
    alt: p.alt_en ?? p.alt,
    excerpt: p.excerpt_en ?? p.excerpt,
    description: p.description_en ?? p.description,
  };
}
