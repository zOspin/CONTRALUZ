# CONTRA/LUZ

Portafolio de arquitectura — arquitectura moldeada por la luz.

Dark, cinematográfico, con grano de película. Construido con React + Vite +
Tailwind + GSAP + Lenis.

## Correr el proyecto

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Otros comandos:

```bash
npm run build    # bundle de produccion en dist/
npm run preview  # sirve dist/ localmente
```

## Qué editar y dónde

| Quiero cambiar... | Archivo |
|---|---|
| **Proyectos** (los 3) | `src/data/projects.js` |
| **Colores** | `tailwind.config.js` (bloque `colors`) |
| **Textos de secciones** | `src/sections/*.jsx` |
| **Bio y cifras del estudio** | `src/sections/Studio.jsx` (`BIO`, `STATS`) |
| **Email / teléfono / redes** | `src/sections/Contact.jsx` (constantes arriba: `estudio@contraluz.co`) |
| **Fuentes** | `src/index.css` + `tailwind.config.js` (`fontFamily`) |
| **Preloader** | `src/components/Preloader.jsx` |
| **Cursor personalizado** | `src/components/Cursor.jsx` |
| **Reloj del footer** | `src/sections/Footer.jsx` (`Clock`) |

### Cambiar la paleta

En `tailwind.config.js`:

```js
colors: {
  void: '#0a0a0a',   // fondo
  coal: '#161616',   // superficie
  bone: '#ece8e1',   // texto
  ember: '#d9a15b',  // acento
}
```

### Editar un proyecto

`src/data/projects.js` — cada objeto es un proyecto:

```js
{
  id: 'casa-pampa',      // único en la URL: /proyecto/casa-pampa
  name: 'Casa Pampa',
  year: '2024',
  category: 'Residencial',
  span: 'full',          // 'full' | 'half' | 'third' (grilla asimétrica)
  cover: '...',          // imagen principal
  description: [...],    // párrafos
  materials: [...],
  gallery: [...],
}
```

`span` controla el ancho en la grilla: `full` ocupa 2 columnas en md+, `half` y
`third` ocupan 1. El layout es móvil primero — en móvil todo ocupa una columna.

Las imágenes son placeholders de Unsplash. Para usar fotos reales, ponlas en
`public/` y cambia la URL a `/mi-imagen.jpg`.

## Accesibilidad

- HTML semántico (`header`, `nav`, `main`, `section`, `article`, `footer`)
- `alt` en todas las imágenes
- Foco visible en ámbar (`ember`) sobre fondo oscuro
- `prefers-reduced-motion` respetado: sin preloader, sin cursor propio, sin grano animado, sin parallax
- El formulario valida campos requeridos sin backend

## Rendimiento

- Animaciones solo en `transform` y `opacity` (GPU-friendly)
- `clip-path` reveals con `once: true` — no se re-disparan al hacer scroll
- Imágenes con `loading="lazy"` (la del hero usa `priority`)
- Parallax vía `yPercent` dentro de un contenedor con overflow oculto

## Despliegue

`npm run build` genera `dist/`. Es un SPA: cualquier hosting estático
funciona, pero necesita un rewrite de todas las rutas a `index.html` para que
las rutas profundas (`/proyecto/:id`) no devuelvan 404.