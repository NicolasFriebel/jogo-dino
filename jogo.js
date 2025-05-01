const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

let dino = { x: 100, y: 400, largura: 40, altura: 40, pulando: false, gravidade: 0 };
let meteoros = [], crateras = [], decoracoes = [], pontosVisuais = [];

let velocidadeCenario = 4;
let velocidadeMeteoro = 5;
let frame = 0, score = 0;
let tempoProximoMeteoro = 60, tempoProximaDecoracao = 0;
let teclasPressionadas = {};
let intervaloBaseMeteoro = 100;
let variacaoMeteoro = 50;
const intervaloMinimoMeteoro = 70;

ctx.font = '18px Arial';
ctx.fillStyle = '#333';

document.addEventListener('keydown', e => {
    teclasPressionadas[e.code] = true;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !dino.pulando) {
        dino.gravidade = -12;
        dino.pulando = true;
    }
});
document.addEventListener('keyup', e => teclasPressionadas[e.code] = false);

function atualizaDino() {
    if (teclasPressionadas['ArrowLeft']) dino.x -= 5;
    if (teclasPressionadas['ArrowRight']) dino.x += 5;
    dino.x = Math.max(0, Math.min(canvas.width - dino.largura, dino.x));
    dino.y += dino.gravidade;
    dino.gravidade += 0.5;
    if (dino.y >= canvas.height - 50) {
        dino.y = canvas.height - 50;
        dino.pulando = false;
    }
}

function desenhaDino() {
    ctx.fillStyle = '#555';
    ctx.fillRect(dino.x, dino.y, dino.largura, dino.altura);
}

function desenhaPontos() {
    ctx.fillStyle = '#000';
    ctx.fillText(`Score: ${score}`, 10, 20);
    pontosVisuais.forEach(p => {
        ctx.fillStyle = '#2e7d32';
        ctx.fillText(p.texto, p.x, p.y);
    });
}

function desenhaDecoracoes(profundidade) {
    decoracoes.forEach(d => {
        if (d.profundidade === profundidade) {
            ctx.fillStyle = d.tipo === 'grama' ? '#4caf50' : '#888';
            ctx.fillRect(d.x, d.y, d.largura, d.altura);
        }
    });
}

function criaDecoracao() {
    if (frame % 4 !== 0) return;
    const tipo = Math.random() < 0.5 ? 'grama' : 'pedra';
    const profundidade = Math.random() < 0.5 ? 'tras' : 'frente';
    decoracoes.push({
        x: canvas.width,
        y: canvas.height - 50 + 30,
        largura: 10,
        altura: 10,
        tipo,
        profundidade
    });
    tempoProximaDecoracao = frame + Math.floor(Math.random() * 20 + 10);
}

function atualizaDecoracoes() {
    decoracoes.forEach(d => d.x -= velocidadeCenario);
    decoracoes = decoracoes.filter(d => d.x + d.largura > 0);
}

function criaMeteoro() {
    const destinoX = Math.random() * (canvas.width + 100);
    const destinoY = canvas.height - 50;
    const angulo = (210 + Math.random() * 120) * (Math.PI / 180);
    const distancia = canvas.height + 200;
    const origemX = destinoX - Math.cos(angulo) * distancia;
    const origemY = destinoY - Math.sin(angulo) * distancia;
    const tamanho = [20, 20, 20, 40, 40, 60][Math.floor(Math.random() * 6)];
    const velocidade = velocidadeMeteoro + Math.random() * 1.5;
    const dx = destinoX - origemX;
    const dy = destinoY - origemY;
    const tempo = distancia / velocidade;

    meteoros.push({
        x: origemX,
        y: origemY,
        largura: tamanho,
        altura: tamanho,
        velocidadeX: dx / tempo,
        velocidadeY: dy / tempo,
        pontuado: false
    });

    tempoProximoMeteoro = frame + intervaloBaseMeteoro + Math.floor(Math.random() * variacaoMeteoro);
}

function atualizaMeteoros() {
    for (let i = meteoros.length - 1; i >= 0; i--) {
        const m = meteoros[i];
        m.x += m.velocidadeX;
        m.y += m.velocidadeY;
        if (m.y >= canvas.height - 50) {
            crateras.push({
                x: m.x,
                y: canvas.height - 12,
                largura: m.largura * 1.5,
                altura: 12,
                pontuado: false
            });
            meteoros.splice(i, 1);
        }
    }
}

function desenhaMeteoros() {
    ctx.fillStyle = '#a33';
    meteoros.forEach(m => {
  // rastro primeiro
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.lineTo(m.x - m.velocidadeX * 10, m.y - m.velocidadeY * 10);
  ctx.stroke();

  // depois o meteoro
  ctx.fillStyle = '#a33';
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.largura / 2, 0, 2 * Math.PI);
  ctx.fill();
});

function desenhaCrateras() {
    ctx.fillStyle = 'rgba(255, 80, 80, 0.4)';
    crateras.forEach(c => {
        ctx.fillRect(c.x - c.largura / 2, c.y, c.largura, c.altura);
    });
}

function atualizaCrateras() {
    crateras.forEach(c => c.x -= velocidadeCenario);
    crateras = crateras.filter(c => c.x + c.largura / 2 > 0);
}

function verificaPontuacoes() {
    if (frame % 30 === 0) score += 2;

    meteoros.forEach(m => {
        const distX = Math.abs((dino.x + dino.largura / 2) - m.x);
        const nearMissRange = m.largura * 2;

        const nearMiss = !dino.pulando &&
            m.y + m.altura >= dino.y &&
            distX < nearMissRange &&
            !m.pontuado;

        if (nearMiss) {
            score += 5;
            m.pontuado = true;
            pontosVisuais.push({ texto: '+5', x: dino.x, y: dino.y, ttl: 40 });
        }

        const pulouSobre = dino.pulando &&
            dino.y + dino.altura < m.y &&
            dino.x + dino.largura > m.x - m.largura / 2 &&
            dino.x < m.x + m.largura / 2 &&
            !m.pontuado;

        if (pulouSobre) {
            score += 10;
            m.pontuado = true;
            pontosVisuais.push({ texto: '+10', x: dino.x, y: dino.y, ttl: 40 });
        }
    });

    crateras.forEach(c => {
        const pulouSobre = dino.pulando &&
            dino.y + dino.altura < c.y &&
            dino.x + dino.largura > c.x - c.largura / 2 &&
            dino.x < c.x + c.largura / 2 &&
            !c.pontuado;

        if (pulouSobre) {
            score += 2;
            c.pontuado = true;
            pontosVisuais.push({ texto: '+2', x: dino.x, y: dino.y, ttl: 40 });
        }
    });

    pontosVisuais.forEach(p => p.y -= 1);
    pontosVisuais = pontosVisuais.filter(p => --p.ttl > 0);
}

function colisao() {
    const colideComMeteoro = meteoros.some(m => {
        return dino.x < m.x + m.largura / 2 &&
            dino.x + dino.largura > m.x - m.largura / 2 &&
            dino.y < m.y + m.altura / 2 &&
            dino.y + dino.altura > m.y - m.altura / 2;
    });

    const colideComCratera = crateras.some(c => {
        return dino.x + dino.largura > c.x - c.largura / 2 &&
            dino.x < c.x + c.largura / 2 &&
            dino.y + dino.altura > c.y;
    });

    return colideComMeteoro || colideComCratera;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenhaDecoracoes('tras');
    desenhaDino();
    desenhaDecoracoes('frente');
    desenhaPontos();

    atualizaDino();
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
        if (frame % 400 === 0) {
            velocidadeCenario += 0.2;
            velocidadeMeteoro += 0.3;
            if (intervaloBaseMeteoro > intervaloMinimoMeteoro) intervaloBaseMeteoro -= 5;
        }
        requestAnimationFrame(loop);
    }
}

tempoProximoMeteoro = 60;
loop();
