/**
 * Logotipo oficial CONTRA/LUZ (public/logo/contraluz.png, en color hueso
 * para fondo oscuro). El original en negro esta en contraluz-negro.png.
 *
 * El ancho lo decide quien lo usa (className); el alto sale de la
 * proporcion del archivo (1659x478) para no deformarlo.
 */
export default function Logo({ className = '', alt = 'CONTRA/LUZ', ...rest }) {
  return (
    <img
      src="/logo/contraluz.png"
      width={1659}
      height={478}
      alt={alt}
      draggable="false"
      className={`block h-auto select-none ${className}`}
      {...rest}
    />
  );
}
