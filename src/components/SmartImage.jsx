/**
 * SmartImage — <picture> responsive: WebP + srcset por ancho, JPG de respaldo.
 * `base` es la ruta .jpg (ej. '/proyectos/liuto-01.jpg'); se derivan
 * `.webp`, `-960.webp` y `-960.jpg` generados por scripts/optimize-images.mjs.
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

  return (
    // contents: la img sigue dimensionando contra el contenedor padre.
    <picture style={{ display: 'contents' }}>
      <source
        type="image/webp"
        srcSet={`${smallWebp} 960w, ${webp} 1920w`}
        sizes={sizes}
      />
      <img
        ref={imgRef}
        src={base}
        srcSet={`${smallJpg} 960w, ${base} 1920w`}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={fetchPriority}
        onError={onError}
        className={className}
        {...rest}
      />
    </picture>
  );
}
