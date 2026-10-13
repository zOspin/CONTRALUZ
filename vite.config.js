import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2020',
    // Three.js pesa ~500kB. En su propio chunk: el navegador lo descarga
    // en paralelo y no bloquea el primer render del sitio, que ya se ve
    // completo con las fotos. Si estuviera en el chunk principal, el
    // usuario veria una pantalla en blanco esperando a que cargue.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          motion: ['framer-motion'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});