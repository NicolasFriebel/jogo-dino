import { IMAGE_PATHS, AUDIO_PATHS } from './config.js';

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}
// load audio, fail silently if missing
function loadAudio(src) {
  const audio = new Audio();
  audio.src = src;
  audio.preload = 'auto';
  // begin loading immediately
  try { audio.load(); } catch {};
  // silence errors if file missing or load fails
  audio.onerror = () => {};
  return audio;
}

export const assets = {
  dinoParado: loadImage(IMAGE_PATHS.dinoParado),
  dinoOlhando: loadImage(IMAGE_PATHS.dinoOlhando),
  dinoCorrendo: loadImage(IMAGE_PATHS.dinoCorrendo),
  meteoro: loadImage(IMAGE_PATHS.meteoro),
  healthBar: loadImage(IMAGE_PATHS.healthBar),
  // audio assets
  startAudio: loadAudio(AUDIO_PATHS.start),
  hitAudio: loadAudio(AUDIO_PATHS.hit),
  nearMissAudio: loadAudio(AUDIO_PATHS.nearMiss),
  jumpAudio: loadAudio(AUDIO_PATHS.jump),
  gameEndAudio: loadAudio(AUDIO_PATHS.gameEnd)
};