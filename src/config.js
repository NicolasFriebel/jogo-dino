export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;
export const GROUND_MARGIN = 80;

// Dino parameters
export const DINO_SPEED = 7.5;
export const JUMP_VELOCITY = 18;
export const GRAVITY = 0.75;
export const FALL_MULTIPLIER = 1.5;
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
export const INITIAL_METEOR_SPEED = 7.5;

// Scenery speed
export const INITIAL_SCENERY_SPEED = 6;
// Dino air control factor (reduce horizontal movement in air)
export const AIR_CONTROL_FACTOR = 0.3;
// Collision padding to shrink hitboxes
export const COLLISION_PADDING = 10;

// Asset paths
export const IMAGE_PATHS = {
  dinoParado: 'images/DinoParado.png',
  dinoOlhando: 'images/DinoOlhando.png',
  dinoCorrendo: 'images/DinoCorrendo1.png',
  meteoro: 'images/MeteoroM.png'
};