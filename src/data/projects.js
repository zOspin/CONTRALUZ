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
      '/proyectos/liuto-05.jpg',
      '/proyectos/liuto-06.jpg',
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
    gallery: [
      '/proyectos/hecate-01.jpg',
      '/proyectos/hecate-02.jpg',
      '/proyectos/hecate-03.jpg',
      '/proyectos/hecate-04.jpg',
      '/proyectos/hecate-05.jpg',
    ],
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
    gallery: [
      '/proyectos/spa-01.jpg',
      '/proyectos/spa-04.jpg',
      '/proyectos/spa-05.jpg',
      '/proyectos/spa-02.jpg',
      '/proyectos/spa-06.jpg',
      '/proyectos/spa-03.jpg',
    ],
  },
  // Proyectos educativos. Los datos que no aparecen en los renders (ubicacion
  // exacta, area, estado) quedan sin definir: la ficha tecnica oculta los
  // campos vacios. Completarlos aqui cuando se confirmen.
  {
    id: 'preescolar',
    name: 'Preescolar',
    year: '2022',
    category: 'Educativo',
    category_en: 'Education',
    span: 'full',
    cover: '/proyectos/preescolar-01.jpg',
    alt: 'Patio interior de un preescolar con columnas cubiertas de vegetacion, juegos y ninos bajo una cubierta verde',
    alt_en: 'Inner courtyard of a preschool with vine-covered columns, play areas and children under a green roof',
    excerpt: 'Una escuela para la primera infancia organizada alrededor de patios que dejan entrar la luz y la lluvia.',
    excerpt_en: 'An early-childhood school organized around courtyards that let in light and rain.',
    description: [
      'El edificio se abre hacia adentro. Una gran cubierta de estructura verde reúne aulas, comedor y espacios de juego alrededor de patios recortados en el techo, por donde entran la luz y el cielo.',
      'Las columnas se cubren de vegetación y el jardín atraviesa el interior: el límite entre aula y patio se diluye, y el recorrido diario de los niños pasa siempre por un espacio con luz natural.',
      'Hacia la ciudad, el proyecto se presenta como una fachada ligera y permeable, con celosías de ladrillo que filtran la luz y una plaza de acceso pensada para la espera de las familias.',
    ],
    description_en: [
      'The building opens inwards. A large roof with a green structure gathers classrooms, dining room and play spaces around courtyards cut into the roof, through which light and sky come in.',
      "The columns are covered in vegetation and the garden runs through the interior: the line between classroom and courtyard blurs, and the children's daily route always passes through a naturally lit space.",
      'Towards the city, the project presents a light, permeable facade with brick screens that filter the light, and an entrance plaza designed for families to wait.',
    ],
    materials: ['Estructura metálica', 'Celosía de ladrillo', 'Cubiertas verdes', 'Vegetación trepadora'],
    gallery: [
      '/proyectos/preescolar-01.jpg',
      '/proyectos/preescolar-02.jpg',
      '/proyectos/preescolar-03.jpg',
      '/proyectos/preescolar-04.jpg',
      '/proyectos/preescolar-05.jpg',
      '/proyectos/preescolar-06.jpg',
    ],
  },
  {
    id: 'kiralooro',
    name: 'Kiralooro',
    year: '2023',
    category: 'Educativo',
    category_en: 'Education',
    location: 'Senegal',
    location_en: 'Senegal',
    status: 'Concurso',
    status_en: 'Competition',
    span: 'half',
    cover: '/proyectos/kiralooro-01.jpg',
    alt: 'Acceso de una escuela de tierra apisonada en Senegal al atardecer, con volumenes curvos y palmeras',
    alt_en: 'Entrance of a rammed-earth school in Senegal at dusk, with curved volumes and palm trees',
    excerpt: 'Una escuela de tierra en Senegal donde la luz entra por arriba y la sombra organiza el día.',
    excerpt_en: 'An earth school in Senegal where light enters from above and shade organizes the day.',
    description: [
      'Propuesta de concurso para una escuela en Senegal. Los muros de tierra apisonada dan masa térmica y un color que pertenece al suelo del lugar; las cubiertas ligeras de bambú y lámina quedan separadas de los muros para que el aire circule.',
      'Las aulas se abren a patios y huertas. Celosías de madera regulan la luz lateral y permiten dar clase con las fachadas abiertas.',
      'En el espacio espiritual, un cilindro de tierra recibe una sola entrada de luz cenital: el lugar más silencioso del conjunto está hecho solo de muro, sombra y cielo.',
    ],
    description_en: [
      'Competition entry for a school in Senegal. Rammed-earth walls provide thermal mass and a colour that belongs to the local soil; light bamboo and sheet roofs sit apart from the walls so that air can flow.',
      'Classrooms open onto courtyards and vegetable gardens. Timber screens control side light and allow lessons with the facades open.',
      'In the spiritual space, an earth cylinder receives a single shaft of overhead light: the quietest place in the complex is made only of wall, shade and sky.',
    ],
    materials: ['Tierra apisonada', 'Bambú', 'Celosía de madera', 'Lámina metálica'],
    gallery: [
      '/proyectos/kiralooro-01.jpg',
      '/proyectos/kiralooro-02.jpg',
      '/proyectos/kiralooro-03.jpg',
      '/proyectos/kiralooro-04.jpg',
      '/proyectos/kiralooro-05.jpg',
      '/proyectos/kiralooro-06.jpg',
    ],
  },
  {
    id: 'ana-frank',
    name: 'Ana Frank',
    year: '2022',
    category: 'Educativo',
    category_en: 'Education',
    span: 'half',
    cover: '/proyectos/ana-frank-01.jpg',
    alt: 'Edificio educativo de madera con escalera exterior naranja, jardines y estudiantes caminando',
    alt_en: 'Timber education building with an orange outdoor stair, gardens and students walking',
    excerpt: 'Un campus de madera donde los recorridos al aire libre son parte del aula.',
    excerpt_en: 'A timber campus where open-air routes are part of the classroom.',
    description: [
      'El conjunto se construye en madera: estructura, celosías y cielorrasos comparten el mismo material cálido, que filtra la luz y le da escala humana a los volúmenes.',
      'Las circulaciones salen al exterior. Escaleras abiertas, pasarelas sobre la cubierta y un estanque con bancas convierten los desplazamientos entre clases en tiempo al aire libre.',
      'Adentro, un gran vacío de varios niveles reúne las áreas de estudio y recibe luz desde arriba, para que el centro del edificio sea también su espacio más luminoso.',
    ],
    description_en: [
      'The complex is built in timber: structure, screens and ceilings share the same warm material, which filters the light and gives the volumes a human scale.',
      'Circulation moves outdoors. Open stairs, walkways on the roof and a pond with benches turn the walk between classes into time spent outside.',
      'Inside, a large multi-level void gathers the study areas and receives light from above, so that the heart of the building is also its brightest space.',
    ],
    materials: ['Madera estructural', 'Celosía de madera', 'Cubierta transitable', 'Agua'],
    gallery: [
      '/proyectos/ana-frank-01.jpg',
      '/proyectos/ana-frank-02.jpg',
      '/proyectos/ana-frank-03.jpg',
      '/proyectos/ana-frank-04.jpg',
      '/proyectos/ana-frank-05.jpg',
      '/proyectos/ana-frank-06.jpg',
    ],
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
