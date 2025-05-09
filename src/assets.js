import { IMAGE_PATHS } from './config.js';

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

export const assets = {
  dinoParado: loadImage(IMAGE_PATHS.dinoParado),
  dinoOlhando: loadImage(IMAGE_PATHS.dinoOlhando),
  dinoCorrendo: loadImage(IMAGE_PATHS.dinoCorrendo),
  meteoro: loadImage(IMAGE_PATHS.meteoro)
};