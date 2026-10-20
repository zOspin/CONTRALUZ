/**
 * Logotipo oficial CONTRA/LUZ en color hueso para fondo oscuro.
 *
 *   public/logo/contraluz.png           original (1659x478)
 *   public/logo/contraluz-compacto.png  "LUZ" con trazos engrosados para
 *                                       tamanos chicos (scripts/logo-compacto.mjs)
 *   public/logo/contraluz-negro.png     original en negro
 *
 * Por debajo de ~400 px de ancho los trazos finos de "LUZ" quedan en menos
 * de 1 px y se pierden: ahi va la version compacta.
 *
 * - compacto: siempre la version compacta (barra de navegacion).
 * - adaptativo: compacta en movil, original desde md (portada, carga).
 */
export default function Logo({
  className = '',
  alt = 'CONTRA/LUZ',
  compacto = false,
  adaptativo = false,
  ...rest
}) {
  const img = (
    <img
      src={compacto || adaptativo ? '/logo/contraluz-compacto.png' : '/logo/contraluz.png'}
      width={compacto || adaptativo ? 1664 : 1659}
      height={compacto || adaptativo ? 488 : 478}
      alt={alt}
      draggable="false"
      className={`block h-auto select-none ${className}`}
      {...rest}
    />
  );
  if (!adaptativo) return img;
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet="/logo/contraluz.png" />
      {img}
    </picture>
  );
}
