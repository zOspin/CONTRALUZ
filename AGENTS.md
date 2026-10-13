# Project-specific notes for CONTRA/LUZ. Shared conventions live in AGENTS.md.

## Piso visual

Oscuro por defecto. Fondo `void` (#0a0a0a), superficies `coal`/`slate`,
texto `bone` (#ece8e1). El acento `ember` (#d9a15b) es el color de la luz que
entra por la ventana: se usa con moderación, nunca como superficie dominante.

## Un solo acento

Si agregas un color, pregúntate si pertenece a la paleta del concepto (luz y
sombra) o si es decoración. Este sitio no admite colores decorativos.

## Animación

- Anima `transform` y `opacity` siempre que puedas. Nada de animar `width`,
  `height` o `top` en loop: provoca layout thrash.
- El grano de película, la viñeta y el cursor son adornos: respetan
  `prefers-reduced-motion` globalmente en `index.css`.
- Las imágenes reveladas con `clip-path` usan `once: true` en ScrollTrigger;
  no re-animen en cada pasada.

## Imágenes

Placeholders de Unsplash en blanco y negro (`img-bw`), con `filter` que se
desvanece a color al hover. Las fotos reales deben conservar alto contraste.

## Responsive

Movil primero. La grilla de proyectos es 1 columna en movil; el campo `span`
de cada proyecto en `src/data/projects.js` controla el ancho solo en md+.