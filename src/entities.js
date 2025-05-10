import {
  GROUND_MARGIN,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DINO_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
  FALL_MULTIPLIER,
  LOW_JUMP_MULTIPLIER,
  DINO_WIDTH_RUNNING,
  DINO_HEIGHT_RUNNING,
  DINO_WIDTH_STANDING,
  DINO_HEIGHT_STANDING,
  INITIAL_METEOR_SPEED,
  METEOR_ANGLE_VARIATION,
  AIR_CONTROL_FACTOR
} from './config.js';
import { input } from './input.js';

export class Dino {
  constructor(assets) {
    this.assets = assets;
    this.width = DINO_WIDTH_STANDING;
    this.height = DINO_HEIGHT_STANDING;
    this.x = (CANVAS_WIDTH - this.width) / 2;
    this.y = CANVAS_HEIGHT - GROUND_MARGIN - this.height;
    this.vy = 0;
    this.jumping = false;
    this.currentImage = assets.dinoParado;
  }

  setRunningSprite() {
    this.width = DINO_WIDTH_RUNNING;
    this.height = DINO_HEIGHT_RUNNING;
    this.currentImage = this.assets.dinoCorrendo;
    this.y = CANVAS_HEIGHT - GROUND_MARGIN - this.height;
  }

  setStandingSprite() {
    this.width = DINO_WIDTH_STANDING;
    this.height = DINO_HEIGHT_STANDING;
    this.currentImage = this.assets.dinoParado;
    this.y = CANVAS_HEIGHT - GROUND_MARGIN - this.height;
  }

  setLookingSprite() {
    this.width = DINO_WIDTH_STANDING;
    this.height = DINO_HEIGHT_STANDING;
    this.currentImage = this.assets.dinoOlhando;
    this.y = CANVAS_HEIGHT - GROUND_MARGIN - this.height;
  }

  jump() {
    if (!this.jumping) {
      this.vy = -JUMP_VELOCITY;
      this.jumping = true;
    }
  }

  update() {
    // horizontal movement (reduced in air)
    const horSpeed = this.jumping ? DINO_SPEED * AIR_CONTROL_FACTOR : DINO_SPEED;
    if (input.isDown('ArrowLeft')) this.x -= horSpeed;
    if (input.isDown('ArrowRight')) this.x += horSpeed;
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));

    // apply gravity modifiers
    if (this.vy > 0) {
      // exponential fall
      this.vy *= FALL_MULTIPLIER;
    } else if (this.vy < 0 && !(input.isDown('Space') || input.isDown('ArrowUp'))) {
      // short hop
      this.vy += GRAVITY * (LOW_JUMP_MULTIPLIER - 1);
    }
    // apply base gravity
    this.vy += GRAVITY;
    this.y += this.vy;

    // ground collision
    const groundY = CANVAS_HEIGHT - GROUND_MARGIN;
    if (this.y >= groundY - this.height) {
      this.y = groundY - this.height;
      this.jumping = false;
      this.vy = 0;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
  }
}

export class Meteor {
  constructor(assets) {
    this.assets = assets;
    const sizeOptions = [20, 35, 40, 45, 60];
    this.size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
    this.x = Math.random() * CANVAS_WIDTH * 1.1;
    this.y = -this.size;
    this.vx = (Math.random() * 2 - 1) * METEOR_ANGLE_VARIATION;
    this.vy = INITIAL_METEOR_SPEED + Math.random() * 1.5;
    this.pontuado = false;
  }

  update(crateras) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y >= CANVAS_HEIGHT - GROUND_MARGIN) {
      crateras.push({
        x: this.x,
        y: CANVAS_HEIGHT - GROUND_MARGIN,
        width: this.size * 1.5,
        height: 16, // it was 12
        pontuado: false
      });
      return true; // removed
    }
    return false;
  }

  draw(ctx) {
    ctx.drawImage(
      this.assets.meteoro,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }
}

export class Decoration {
  constructor(type, depth) {
    this.type = type; // 'grama' or 'pedra'
    this.depth = depth; // 'tras' or 'frente'
    this.width = 10;
    this.height = 10;
    this.x = CANVAS_WIDTH;
  }

  update(speed) {
    this.x -= speed;
  }

  draw(ctx, groundY) {
    // simple parallax shading: background (tras) lighter, foreground (frente) darker
    ctx.fillStyle = this.depth === 'tras' ? '#ccc' : '#555';
    ctx.fillRect(this.x, groundY - this.height, this.width, this.height);
  }
}

export class PointsText {
  constructor(text, x, y) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.ttl = 40;
  }

  update() {
    this.y -= 1;
    this.ttl--;
  }

  draw(ctx) {
    ctx.fillStyle = '#000';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(this.text, this.x, this.y);
  }
}
