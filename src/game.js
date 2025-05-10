import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_MARGIN,
  INITIAL_SCENERY_SPEED,
  BASE_METEOR_INTERVAL,
  METEOR_INTERVAL_VARIATION,
  COLLISION_PADDING,
  MAX_HEALTH,
  SHAKE_INTENSITY,
  SHAKE_DURATION,
  GAME_OVER_SLOWDOWN_MS,
  DEATH_SLOWDOWN_DURATION_MS,
  DEATH_SLOWDOWN_START_FACTOR,
  DEATH_SLOWDOWN_END_FACTOR
} from './config.js';
import { assets } from './assets.js';
import { input } from './input.js';
import { Dino, Meteor, Decoration, PointsText } from './entities.js';

const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Game state
let cenaIntro = true;
let tempoIntro = 0;
let tituloExibido = false;
let tempoTitulo = 0;
let meteoroIntro = null;
let jogoIniciado = false;
let frame = 0;
let score = 0;
let meteoros = [];
let crateras = [];
let decoracoes = [];
let pontosVisuais = [];
let velocidadeCenario = INITIAL_SCENERY_SPEED;
let tempoProximoMeteoro = 60;
let tempoProximaDecoracao = 0;
let health = MAX_HEALTH;
// timer for screen shake after damage
let shakeTime = 0;
// flag for game over state
let gameOver = false;
// death slowdown state
let dying = false;
let deathStartTime = 0;
// pending start audio play if unlocked later
// (no deferral for start sound needed)

// Dino
const dino = new Dino(assets);

// Input: unlock audio on first interaction and jump on keydown
function unlockAudio() {
  if (!window.audioUnlocked) {
    [assets.startAudio, assets.hitAudio, assets.nearMissAudio, assets.jumpAudio, assets.gameEndAudio].forEach(a => {
      a.play().catch(() => {});
      a.pause();
      a.currentTime = 0;
    });
    window.audioUnlocked = true;
  }
}
window.addEventListener('keydown', e => {
  unlockAudio();
  if ((e.code === 'Space' || e.code === 'ArrowUp') && jogoIniciado) dino.jump();
});
window.addEventListener('mousedown', unlockAudio);
window.addEventListener('touchstart', unlockAudio);

// Helpers
function desenhaDecoracoes(depth) {
  decoracoes.forEach(d => {
    if (d.depth === depth) d.draw(ctx, CANVAS_HEIGHT - GROUND_MARGIN);
  });
}

function criaDecoracao() {
  if (frame % 4 !== 0) return;
  const tipo = Math.random() < 0.5 ? 'grama' : 'pedra';
  const profundidade = Math.random() < 0.5 ? 'tras' : 'frente';
  decoracoes.push(new Decoration(tipo, profundidade));
  tempoProximaDecoracao = frame + Math.floor(Math.random() * 20 + 10);
}

function atualizaDecoracoes() {
  decoracoes.forEach(d => {
    let speed = velocidadeCenario;
    if (d.depth === 'tras') speed *= 0.5;
    else if (d.depth === 'frente') speed *= 1.5;
    d.update(speed);
  });
  decoracoes = decoracoes.filter(d => d.x + d.width > 0);
}

function criaMeteoroIntro() {
  meteoroIntro = {
    x: CANVAS_WIDTH + 100,
    y: -100,
    largura: 40,
    altura: 40,
    velocidadeX: -10,
    velocidadeY: 10
  };
}

function desenhaMeteoroIntro() {
  if (!meteoroIntro) return;
  meteoroIntro.x += meteoroIntro.velocidadeX;
  meteoroIntro.y += meteoroIntro.velocidadeY;
  ctx.drawImage(assets.meteoro, meteoroIntro.x, meteoroIntro.y, meteoroIntro.largura, meteoroIntro.altura);
  if (meteoroIntro.y >= CANVAS_HEIGHT - GROUND_MARGIN - meteoroIntro.altura) {
    meteoroIntro = null;
    tituloExibido = true;
    tempoTitulo = 0;
  }
}

function criaMeteoro() {
  meteoros.push(new Meteor(assets));
  tempoProximoMeteoro = frame + BASE_METEOR_INTERVAL + Math.floor(Math.random() * METEOR_INTERVAL_VARIATION);
}

function desenhaMeteoros() {
  meteoros.forEach(m => m.draw(ctx));
}

function atualizaMeteoros() {
  for (let i = meteoros.length - 1; i >= 0; i--) {
    const m = meteoros[i];
    const removed = m.update(crateras);
    if (removed) meteoros.splice(i, 1);
  }
}

function desenhaCrateras() {
  ctx.fillStyle = 'rgba(255,80,80,0.4)';
  crateras.forEach(c => ctx.fillRect(c.x - c.width/2, c.y, c.width, c.height+10)); //added +10
}

function atualizaCrateras() {
  crateras.forEach(c => c.x -= velocidadeCenario);
  crateras = crateras.filter(c => c.x + c.width/2 > 0);
}

function verificaPontuacoes() {
  if (frame % 30 === 0) score += 2;
  // setup dino bounds for collision exclusion
  const pad = COLLISION_PADDING;
  const dLeft = dino.x + pad;
  const dRight = dino.x + dino.width - pad;
  const dTop = dino.y + pad;
  const dBottom = dino.y + dino.height - pad;
  meteoros.forEach(m => {
    // skip scoring if actual collision this frame
    const left = m.x - m.size/2;
    const right = m.x + m.size/2;
    const top = m.y - m.size/2;
    const bottom = m.y + m.size/2;
    if (right > dLeft && left < dRight && bottom > dTop && top < dBottom) return;
    const distX = Math.abs((dino.x + dino.width/2) - m.x);
    const nearMissRange = m.size * 2;
    const nearMiss = !dino.jumping && m.y + m.size >= dino.y && distX < nearMissRange && !m.pontuado;
    if (nearMiss) {
      score += 5;
      m.pontuado = true;
      pontosVisuais.push(new PointsText('+5', dino.x, dino.y));
      // play near miss sound
      assets.nearMissAudio.play().catch(() => {});
    }
  });
  crateras.forEach(c => {
    const pulouSobre = dino.jumping && dino.y + dino.height < c.y && dino.x + dino.width > c.x - c.width/2 && dino.x < c.x + c.width/2 && !c.pontuado;
    if (pulouSobre) {
      score += 2;
      c.pontuado = true;
      pontosVisuais.push(new PointsText('+2', dino.x, dino.y));
      // play successful jump sound
      assets.jumpAudio.play().catch(() => {});
    }
  });
  pontosVisuais.forEach(p => p.update());
  pontosVisuais = pontosVisuais.filter(p => p.ttl > 0);
}

function colisao() {
  const pad = COLLISION_PADDING;
  const dLeft = dino.x + pad;
  const dRight = dino.x + dino.width - pad;
  const dTop = dino.y + pad;
  const dBottom = dino.y + dino.height - pad;
  const hitMeteor = meteoros.some(m => {
    const left = m.x - m.size/2;
    const right = m.x + m.size/2;
    const top = m.y - m.size/2;
    const bottom = m.y + m.size/2;
    return right > dLeft && left < dRight && bottom > dTop && top < dBottom;
  });
  const hitCrater = crateras.some(c => {
    const left = c.x - c.width/2;
    const right = c.x + c.width/2;
    const top = c.y;
    const bottom = c.y + c.height;
    // check rectangular overlap between dino and crater
    return right > dLeft && left < dRight && bottom > dTop && top < dBottom;
  });
  return hitMeteor || hitCrater;
}

function desenhaTitulo() {
  ctx.save();
  ctx.font = '32px "Press Start 2P"';
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.5;
  const text = 'Evade Extinction';
  const w = ctx.measureText(text).width;
  ctx.fillText(text, (CANVAS_WIDTH - w) / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
}

function desenhaPontos() {
  if (!jogoIniciado) return;
  ctx.save();
  ctx.font = '36px "Press Start 2P"';
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.25;
  const txt = `${score}`;
  const w = ctx.measureText(txt).width;
  ctx.fillText(txt, (CANVAS_WIDTH - w) / 2, CANVAS_HEIGHT / 2);
  ctx.globalAlpha = 1.0;
  pontosVisuais.forEach(p => p.draw(ctx));
  ctx.restore();
}

// draw health bars
function drawHealth() {
  const barWidth = 40;
  const barHeight = 30;
  const padding = 6;
  for (let i = 0; i < health; i++) {
    const x = padding + i * (barWidth + padding);
    const y = padding;
    ctx.drawImage(assets.healthBar, x, y, barWidth, barHeight);
  }
}

function loop() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (gameOver) {
    drawGameOver();
    setTimeout(loop, GAME_OVER_SLOWDOWN_MS);
    return;
  }
  if (cenaIntro) {
    tempoIntro++;
    if (tempoIntro < 90) {
      dino.setStandingSprite();
    } else if (tempoIntro < 180) {
      dino.setLookingSprite();
    } else if (tempoIntro === 180) {
      criaMeteoroIntro();
    }
    desenhaDecoracoes('tras');
    dino.draw(ctx);
    desenhaDecoracoes('frente');
    desenhaMeteoroIntro();
    if (tituloExibido) {
      desenhaTitulo();
      tempoTitulo++;
      if (tempoTitulo > 90) {
        cenaIntro = false;
        jogoIniciado = true;
        dino.setRunningSprite();
        // play start sound
        assets.startAudio.play().catch(() => {});
      }
    }
    requestAnimationFrame(loop);
    return;
  }
  // gameplay
  // apply screen shake if damage occurred
  ctx.save();
  if (shakeTime > 0) {
    const dx = (Math.random() * 2 - 1) * SHAKE_INTENSITY;
    const dy = (Math.random() * 2 - 1) * SHAKE_INTENSITY;
    ctx.translate(dx, dy);
    shakeTime--;
  }
  drawHealth();
  desenhaDecoracoes('tras');
  dino.draw(ctx);
  desenhaDecoracoes('frente');
  desenhaPontos();
  dino.update();
  if (!dying) {
    verificaPontuacoes();
    if (frame >= tempoProximoMeteoro) criaMeteoro();
    if (frame >= tempoProximaDecoracao) criaDecoracao();
  }
  desenhaMeteoros();
  atualizaMeteoros();
  desenhaCrateras();
  atualizaCrateras();
  atualizaDecoracoes();
  // collision checks: meteor hit or crater fall
  const pad = COLLISION_PADDING;
  const dLeft = dino.x + pad;
  const dRight = dino.x + dino.width - pad;
  const dTop = dino.y + pad;
  const dBottom = dino.y + dino.height - pad;
  // meteor collision
  const hitMeteor = meteoros.some(m => {
    const left = m.x - m.size/2;
    const right = m.x + m.size/2;
    const top = m.y - m.size/2;
    const bottom = m.y + m.size/2;
    return right > dLeft && left < dRight && bottom > dTop && top < dBottom;
  });
  // crater collision when on ground overlapping a crater
  const groundY = CANVAS_HEIGHT - GROUND_MARGIN;
  const onGround = dino.y + dino.height >= groundY - 1;
  const hitCrater = onGround && crateras.some(c => {
    const left = c.x - c.width/2;
    const right = c.x + c.width/2;
    return right > dLeft && left < dRight;
  });
  if (hitMeteor || hitCrater) {
    // play hit sound and apply penalty
    if (hitMeteor) {
      score -= 5;
      assets.hitAudio.play().catch(() => {});
    } else {
      assets.hitAudio.play().catch(() => {});
    }
    // trigger screen shake
    shakeTime = SHAKE_DURATION;
    health--;
    if (health <= 0) {
      // begin death slowdown
      dying = true;
      deathStartTime = Date.now();
    } else {
      // clear current obstacles for next life
      meteoros = [];
      crateras = [];
    }
  }
  // fade out overlay during death slowdown
  if (dying && !gameOver) {
    const elapsed = Date.now() - deathStartTime;
    const n = Math.min(elapsed / DEATH_SLOWDOWN_DURATION_MS, 1);
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${n})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
  // restore context after potential screen shake
  ctx.restore();
  frame++;
  // scheduling: normal or death slowdown
  if (dying) {
    const elapsed = Date.now() - deathStartTime;
    if (elapsed < DEATH_SLOWDOWN_DURATION_MS) {
      const t = elapsed / DEATH_SLOWDOWN_DURATION_MS;
      // linear slowdown from start to end factor for quicker effect
      const factor = DEATH_SLOWDOWN_START_FACTOR * (1 - t) + DEATH_SLOWDOWN_END_FACTOR * t;
      const delay = (1000 / 60) / (factor > 0 ? factor : 0.01);
      setTimeout(loop, delay);
    } else {
      // transition to game over
      gameOver = true;
      // play game end audio
      assets.gameEndAudio.play().catch(() => {});
      // show restart button
      const btn = document.getElementById('restartButton');
      if (btn) btn.style.display = 'block';
      setTimeout(loop, GAME_OVER_SLOWDOWN_MS);
    }
  } else {
    requestAnimationFrame(loop);
  }
}

// Game over display
function drawGameOver() {
  ctx.save();
  // translucent white overlay
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#000';
  ctx.font = '20px "Press Start 2P"';
  ctx.textAlign = 'center';
  const lines = [
    'You were the last of your kind.',
    'Now your kind is no more.',
    'You lost.',
    `Score: ${score}`
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + (i - 1) * 30);
  });
  ctx.restore();
}

// Start the game loop immediately
loop();

// Restart button handler
window.addEventListener('load', () => {
  const btn = document.getElementById('restartButton');
  if (btn) btn.addEventListener('click', () => location.reload());
});
