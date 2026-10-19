import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

/** Misma paleta que la web: luz y sombra, un solo acento. */
export const COLOR = {
  void: "#0a0a0a",
  bone: "#ece8e1",
  smoke: "#8a857d",
  ember: "#d9a15b",
};

export const FUENTE = {
  display: loadBebas("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  serif: loadPlayfair("italic", { weights: ["500"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

/** Margen seguro para 1080px de ancho (guia de layout: 80px lados, 100px arriba/abajo). */
export const MARGEN = { lado: 88, arriba: 140, abajo: 190 };
