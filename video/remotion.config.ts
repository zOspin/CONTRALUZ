/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

/*
 * Exportacion para redes (Instagram / TikTok), 1080x1920 a 60 fps.
 *
 * - Fotogramas en JPEG al 95%: sin artefactos visibles en las fotos y
 *   mucho mas rapido que PNG.
 * - H.264 con CRF 16 y preset "slow": casi sin perdida visible en
 *   degradados oscuros (el sitio es casi todo sombra, donde el banding se
 *   nota primero). Las redes vuelven a comprimir: subir un archivo de
 *   alta calidad evita que esa segunda compresion lo degrade de mas.
 * - yuv420p + bt709: el formato de color que esperan Instagram, TikTok
 *   y los moviles; otros (444, 10 bits) se ven lavados o no se aceptan.
 * - Audio AAC a 320 kbps.
 */
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioBitrate("320k");
