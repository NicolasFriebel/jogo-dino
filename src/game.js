import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_MARGIN,
  INITIAL_SCENERY_SPEED,
  BASE_METEOR_INTERVAL,
  METEOR_INTERVAL_VARIATION,
  COLLISION_PADDING
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

// Dino
const dino = new Dino(assets);

// Input: jump on keydown
window.addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && jogoIniciado) {
    dino.jump();
  }
});

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
  decoracoes.forEach(d => d.update(velocidadeCenario));
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
  crateras.forEach(c => ctx.fillRect(c.x - c.width/2, c.y, c.width, c.height));
}

function atualizaCrateras() {
  crateras.forEach(c => c.x -= velocidadeCenario);
  crateras = crateras.filter(c => c.x + c.width/2 > 0);
}

function verificaPontuacoes() {
  if (frame % 30 === 0) score += 2;
  meteoros.forEach(m => {
    const distX = Math.abs((dino.x + dino.width/2) - m.x);
    const nearMissRange = m.size * 2;
    const nearMiss = !dino.jumping && m.y + m.size >= dino.y && distX < nearMissRange && !m.pontuado;
    if (nearMiss) {
      score += 5;
      m.pontuado = true;
      pontosVisuais.push(new PointsText('+5', dino.x, dino.y));
    }
    const pulouSobre = dino.jumping && dino.y + dino.height < m.y && dino.x + dino.width > m.x - m.size/2 && dino.x < m.x + m.size/2 && !m.pontuado;
    if (pulouSobre) {
      score += 10;
      m.pontuado = true;
      pontosVisuais.push(new PointsText('+10', dino.x, dino.y));
    }
  });
  crateras.forEach(c => {
    const pulouSobre = dino.jumping && dino.y + dino.height < c.y && dino.x + dino.width > c.x - c.width/2 && dino.x < c.x + c.width/2 && !c.pontuado;
    if (pulouSobre) {
      score += 2;
      c.pontuado = true;
      pontosVisuais.push(new PointsText('+2', dino.x, dino.y));
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
    return right > dLeft && left < dRight && top < dBottom;
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

function loop() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
      }
    }
    requestAnimationFrame(loop);
    return;
  }
  // gameplay
  desenhaDecoracoes('tras');
  dino.draw(ctx);
  desenhaDecoracoes('frente');
  desenhaPontos();
  dino.update();
  verificaPontuacoes();
  if (frame >= tempoProximoMeteoro) criaMeteoro();
  if (frame >= tempoProximaDecoracao) criaDecoracao();
  desenhaMeteoros();
  atualizaMeteoros();
  desenhaCrateras();
  atualizaCrateras();
  atualizaDecoracoes();
  if (colisao()) {
    alert(`Extinção! Pontuação: ${score}`);
    document.location.reload();
  } else {
    frame++;
    requestAnimationFrame(loop);
  }
}

// Start the game loop immediately
loop();