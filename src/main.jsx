import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/*
 * NOTA SOBRE StrictMode
 * ---------------------
 * React 18 en StrictMode monta cada componente dos veces en desarrollo para
 * detectar efectos con fugas. `useLenis` registra un RAF en `gsap.ticker`
 * (el bucle de render global de GSAP). Con doble montaje, el ticker acaba
 * ejecutando `lenis.raf()` varias veces por frame; cada llamada programa la
 * siguiente, y el efecto se realimenta hasta saturar el hilo principal. El
 * sintoma es sutil y engañoso: el sitio carga y se ve bien, pero el hilo esta
 * tan ocupado que requestAnimationFrame no responde y el scroll con la rueda
 * parece congelado.
 *
 * El cleanup de useLenis ya desregistra el RAF, asi que el problema solo
 * aparece en desarrollo. En produccion no hay doble montaje.
 *
 * Para evitar el sintoma en dev, dejamos StrictMode fuera. Si en el futuro
 * reactivamos StrictMode, hay que.wrapear el registro del ticker en un modulo
 * singleton que deduplique por funcion, no en el efecto del hook.
 *
 * StrictMode: <React.StrictMode>
 */
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);