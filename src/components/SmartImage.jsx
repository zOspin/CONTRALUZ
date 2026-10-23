import { IMAGENES_GRANDES } from '../data/imagenesGrandes';

/**
 * SmartImage — <picture> responsive: WebP + srcset por ancho, JPG de respaldo.
 * `base` es la ruta .jpg (ej. '/proyectos/liuto-01.jpg'); se derivan
 * `.webp`, `-960.webp` y `-960.jpg` generados por scripts/optimize-images.mjs,
 * y `-2560` en las fotos cuyo original lo permite (pantallas 2K/4K).
 */
export default function SmartImage({
  base,
  alt = '',
  className = '',
  imgRef,
  eager = false,
  fetchPriority,
  sizes = '100vw',
  onError,
  ...rest
}) {
  const webp = base.replace(/\.jpe?g$/i, '.webp');
  const smallWebp = base.replace(/\.jpe?g$/i, '-960.webp');
  const smallJpg = base.replace(/\.jpe?g$/i, '-960.jpg');
  const grande = IMAGENES_GRANDES.has(base);
  const big = (ext) => (grande ? `, ${base.replace(/\.jpe?g$/i, `-2560.${ext}`)} 2560w` : '');

  return (
    // contents: la img sigue dimensionando contra el contenedor padre.
    <picture style={{ display: 'contents' }}>
      <source
        type="image/webp"
        srcSet={`${smallWebp} 960w, ${webp} 1920w${big('webp')}`}
        sizes={sizes}
      />
      <img
        ref={imgRef}
        src={base}
        srcSet={`${smallJpg} 960w, ${base} 1920w${big('jpg')}`}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // React 18 no conoce `fetchPriority` en camelCase: en minuscula pasa
        // directo como atributo HTML sin warning.
        fetchpriority={fetchPriority}
        onError={onError}
        className={className}
        {...rest}
      />
    </picture>
  );
}
