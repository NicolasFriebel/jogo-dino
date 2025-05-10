export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 600;
export const GROUND_MARGIN = 20; //it was 80 before changing

// Dino parameters
export const DINO_SPEED = 6.5;
export const JUMP_VELOCITY = 16;
export const GRAVITY = 0.65;
export const FALL_MULTIPLIER = 1;
export const LOW_JUMP_MULTIPLIER = 2.0;
export const DINO_WIDTH_RUNNING = 108;
export const DINO_HEIGHT_RUNNING = 54;
export const DINO_WIDTH_STANDING = 108;
export const DINO_HEIGHT_STANDING = 108;

// Meteor parameters
// Meteor spawn timing: interval = BASE_METEOR_INTERVAL + random(0 .. METEOR_INTERVAL_VARIATION)
export const BASE_METEOR_INTERVAL = 30;
export const METEOR_INTERVAL_VARIATION = 100;
// Angle (horizontal velocity) randomness for meteors
export const METEOR_ANGLE_VARIATION = 6;
export const INITIAL_METEOR_SPEED = 5.3;

// Scenery speed
export const INITIAL_SCENERY_SPEED = 5;
// Dino air control factor (reduce horizontal movement in air)
export const AIR_CONTROL_FACTOR = 0.65;
// Collision padding to shrink hitboxes
export const COLLISION_PADDING = 13;
export const MAX_HEALTH = 3;
// Screen shake on damage
export const SHAKE_INTENSITY = 8;   // max shake offset in pixels
export const SHAKE_DURATION = 15;   // shake duration in frames

// Asset paths
export const IMAGE_PATHS = {
  dinoParado: 'images/DinoParado.png',
  dinoOlhando: 'images/DinoOlhando.png',
  dinoCorrendo: 'images/DinoCorrendo1.png',
  meteoro: 'images/MeteoroM.png',
  healthBar: 'images/healthBar.png'
};
// Audio paths for game sounds (place audio files under audio/)
export const AUDIO_PATHS = {
  start: 'audio/start.mp3',    // game start
  hit: 'audio/hit.mp3',        // player hit
  nearMiss: 'audio/nearMiss.mp3', // near miss
  jump: 'audio/jump.mp3',      // successful jump over obstacle
  gameEnd: 'audio/gameEnd.mp3' // game end sound
};

// Game over screen slowdown (milliseconds between frames)
export const GAME_OVER_SLOWDOWN_MS = 200;
// duration for death slowdown before Game Over screen (ms)
export const DEATH_SLOWDOWN_DURATION_MS = 2000;
// initial and final speed multipliers during death slowdown
export const DEATH_SLOWDOWN_START_FACTOR = 0.7;
export const DEATH_SLOWDOWN_END_FACTOR = 0.02;
