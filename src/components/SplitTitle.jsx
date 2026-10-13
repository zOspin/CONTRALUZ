import { motion, useTransform } from 'framer-motion';

/**
 * TITULO CON SPLIT TEXT LIGADO AL SCROLL
 * ========================================
 *
 * Cada linea de texto vive dentro de una mascara (overflow-hidden) y sube
 * desde abajo conforme avanza el scroll. Es el mismo gesto del preloader, pero
 * en vez de correr solo con el tiempo, depende de donde este el scroll.
 *
 * POR QUE NO USO GSAP SplitText AQUI
 * ---------------------------------
 * SplitText parte el texto mutando el DOM, fuera del control de React. Eso
 * funciona con timelines de GSAP, pero acá el estado es una funcion pura de
 * scrollYProgress (un MotionValue de Framer). Si React re-renderiza, fightea
 * con los spans que SplitText creo.
 *
 * Ademas, los titulos del hero tienen cortes de linea explicitos: ya sabemos
 * donde parten. Partirlas a mano es mas simple, mas rapido (no hay reflow
 * midiendo el texto) y 100% seguro con React.
 *
 * REGLAS DE HOOKS
 * ---------------
 * useTransform se llama DENTRO de <SplitLine>, no dentro de un .map() del
 * componente padre. Cada linea es una instancia distinta del componente, asi
 * que cada una tiene su propio hook y el orden es estable. Si los hooks
 * estuvieran en un bucle del padre, su numero cambiaria entre renders y React
 * fallaria.
 *
 * ACCESIBILIDAD
 * -------------
 * El texto real esta en el DOM, asi que lectores de pantalla y SEO lo leen
 * completo. Con prefers-reduced-motion el padre pasa `static` y el texto se
 * ve plano, sin movimiento.
 */

/**
 * Una sola linea, animada dentro de su propia ventana del rango.
 */
function SplitLine({ children, progress, start, end, from = 108, isStatic }) {
  const y = useTransform(progress, [start, end], [`${from}%`, '0%']);
  const opacity = useTransform(
    progress,
    [start, start + (end - start) * 0.45],
    [0, 1]
  );

  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        style={isStatic ? undefined : { y, opacity }}
        className="block will-change-transform"
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Bloque de titulo completo.
 *
 * @param lines    - array de strings (una por linea)
 * @param progress - MotionValue 0..1 del recorrido del hero
 * @param range    - [inicio, fin] del bloque dentro del recorrido total
 * @param stagger  - fraccion del rango repartida entre las lineas
 * @param isStatic - true con prefers-reduced-motion: sin split, texto plano
 */
export default function SplitTitle({
  lines,
  progress,
  range,
  stagger = 0.45,
  className = '',
  lineClassName = '',
  from = 108,
  isStatic = false,
}) {
  // Con reduced-motion devolvemos el texto tal cual, sin mascaras: si dejamos
  // las mascaras sin animar, el texto queda CLIPPED (invisible) para siempre.
  if (isStatic) {
    return (
      <span className={`block ${className}`}>
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </span>
    );
  }

  const [blockStart, blockEnd] = range;
  const span = blockEnd - blockStart;
  // Cada linea arranca un poco mas tarde que la anterior.
  const step = (span * stagger) / Math.max(1, lines.length - 1);
  // El resto del rango (1 - stagger) es el tiempo real de subida.
  const rise = span * (1 - stagger);

  return (
    <span className={`block ${className}`}>
      {lines.map((line, i) => {
        const start = blockStart + step * i;
        const end = Math.min(blockEnd, start + rise);
        return (
          <SplitLine key={i} progress={progress} start={start} end={end} from={from}>
            <span className={lineClassName}>{line}</span>
          </SplitLine>
        );
      })}
    </span>
  );
}

export { SplitLine };
