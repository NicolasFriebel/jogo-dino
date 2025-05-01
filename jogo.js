const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

const dinoParadoImg = new Image();
dinoParadoImg.src = 'DinoParado.png';

const dinoOlhandoImg = new Image();
dinoOlhandoImg.src = 'DinoOlhando.png';

const dinoCorrendoImg = new Image();
dinoCorrendoImg.src = 'DinoCorrendo1.png';

const meteoroImg = new Image();
meteoroImg.src = 'MeteoroM.png';

let imagemAtual = dinoParadoImg;

const margemChao = 80;
let chaoY = 0;

let cenaIntro = true;
let tempoIntro = 0;
let jogoIniciado = false;
let tituloExibido = false;
let tempoTitulo = 0;
let meteoroIntro = null;

let dino = {
    largura: 108,
    altura: 108,
    x: 0,
    y: 0,
    pulando: false,
    gravidade: 0
};

function redimensionaCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    chaoY = canvas.height - margemChao;
    dino.y = chaoY - dino.altura;
    dino.x = canvas.width / 2 - dino.largura / 2;
}
window.addEventListener('resize', redimensionaCanvas);
redimensionaCanvas();

let meteoros = [], crateras = [], decoracoes = [], pontosVisuais = [];
let velocidadeCenario = 6, velocidadeMeteoro = 7.5;
let frame = 0, score = 0;
let tempoProximoMeteoro = 60, tempoProximaDecoracao = 0;
let teclasPressionadas = {};
let intervaloBaseMeteoro = 100, variacaoMeteoro = 50;
const intervaloMinimoMeteoro = 70;

document.addEventListener('keydown', (e) => {
    teclasPressionadas[e.code] = true;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !dino.pulando && jogoIniciado) {
        dino.gravidade = -18;
        dino.pulando = true;
    }
});
document.addEventListener('keyup', (e) => teclasPressionadas[e.code] = false);

function desenhaChao() {
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, chaoY);
    ctx.lineTo(canvas.width, chaoY);
    ctx.stroke();
}

function desenhaDecoracoes(profundidade) {
    decoracoes.forEach(d => {
        if (d.profundidade === profundidade) {
            ctx.fillStyle = d.tipo === 'grama' ? '#4caf50' : '#888';
            ctx.fillRect(d.x, chaoY - d.altura, d.largura, d.altura);
        }
    });
}

function criaDecoracao() {
    const tipo = Math.random() < 0.5 ? 'grama' : 'pedra';
    const profundidade = Math.random() < 0.5 ? 'tras' : 'frente';
    decoracoes.push({
        x: canvas.width + Math.random() * 300,
        largura: 10,
        altura: 10,
        tipo,
        profundidade
    });
}

function atualizaDecoracoes() {
    decoracoes.forEach(d => d.x -= velocidadeCenario);
    decoracoes = decoracoes.filter(d => d.x + d.largura > 0);
}

function desenhaDino() {
    ctx.drawImage(imagemAtual, dino.x, dino.y, dino.largura, dino.altura);
}

function desenhaTitulo() {
    if (!tituloExibido) return;
    ctx.save();
    ctx.font = '32px "Press Start 2P"';
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.5;
    const texto = 'Evade Extinction';
    const larguraTexto = ctx.measureText(texto).width;
    ctx.fillText(texto, (canvas.width - larguraTexto) / 2, canvas.height / 2);
    ctx.restore();
}

function desenhaPontos() {
    if (!jogoIniciado) return;
    ctx.save();
    ctx.font = '36px "Press Start 2P"';
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.25;
    const texto = `${score}`;
    const larguraTexto = ctx.measureText(texto).width;
    ctx.fillText(texto, (canvas.width - larguraTexto) / 2, canvas.height / 2);
    ctx.globalAlpha = 1.0;
    pontosVisuais.forEach(p => {
        ctx.fillStyle = '#000';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText(p.texto, p.x, p.y);
    });
    ctx.restore();
}

function criaMeteoroIntro() {
    meteoroIntro = {
        x: canvas.width + 100,
        y: -100,
        largura: 40,
        altura: 40,
        velocidadeX: -10,
        velocidadeY: 10
    };
}

function desenhaMeteoroIntro() {
    if (meteoroIntro) {
        meteoroIntro.x += meteoroIntro.velocidadeX;
        meteoroIntro.y += meteoroIntro.velocidadeY;
        ctx.drawImage(meteoroImg, meteoroIntro.x, meteoroIntro.y, meteoroIntro.largura, meteoroIntro.altura);

        if (meteoroIntro.y >= chaoY - meteoroIntro.altura) {
            crateras.push({
                x: meteoroIntro.x + meteoroIntro.largura / 2,
                y: chaoY - 12,
                largura: meteoroIntro.largura * 1.5,
                altura: 12,
                pontuado: false
            });
            meteoroIntro = null;
            tituloExibido = true;
            tempoTitulo = 0;
        }
    }
}

function atualizaDino() {
    if (teclasPressionadas['ArrowLeft']) dino.x -= 7.5;
    if (teclasPressionadas['ArrowRight']) dino.x += 7.5;
    dino.x = Math.max(0, Math.min(canvas.width - dino.largura, dino.x));
    dino.y += dino.gravidade;
    dino.gravidade += 0.75;
    if (dino.y >= chaoY - dino.altura) {
        dino.y = chaoY - dino.altura;
        dino.pulando = false;
    }
}

function verificaPontuacoes() {
    if (frame % 30 === 0) score += 2;
    meteoros.forEach(m => {
        const distX = Math.abs((dino.x + dino.largura / 2) - m.x);
        const nearMissRange = m.largura * 2;
        const nearMiss = !dino.pulando && m.y + m.altura >= dino.y && distX < nearMissRange && !m.pontuado;
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

function criaMeteoro() {
    const x = Math.random() * canvas.width * 1.1;
    const tamanho = [20, 20, 40, 60][Math.floor(Math.random() * 4)];
    const anguloX = (Math.random() - 0.5) * 4;
    meteoros.push({
        x,
        y: -tamanho,
        largura: tamanho,
        altura: tamanho,
        velocidadeX: anguloX,
        velocidadeY: velocidadeMeteoro + Math.random() * 1.5,
        pontuado: false
    });
    tempoProximoMeteoro = frame + intervaloBaseMeteoro + Math.floor(Math.random() * variacaoMeteoro);
}

function desenhaMeteoros() {
    meteoros.forEach(m => {
        ctx.drawImage(meteoroImg, m.x - m.largura / 2, m.y - m.altura / 2, m.largura, m.altura);
    });
}

function atualizaMeteoros() {
    for (let i = meteoros.length - 1; i >= 0; i--) {
        const m = meteoros[i];
        m.x += m.velocidadeX;
        m.y += m.velocidadeY;
        if (m.y >= chaoY) {
            crateras.push({
                x: m.x,
                y: chaoY - 12,
                largura: m.largura * 1.5,
                altura: 12,
                pontuado: false
            });
            meteoros.splice(i, 1);
        }
    }
}

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
    desenhaChao();

    if (cenaIntro) {
        tempoIntro++;
        if (tempoIntro < 90) {
            imagemAtual = dinoParadoImg;
            dino.largura = dino.altura = 108;
            dino.x = canvas.width / 2 - dino.largura / 2;
            dino.y = chaoY - dino.altura;
        } else if (tempoIntro < 180) {
            imagemAtual = dinoOlhandoImg;
        } else if (tempoIntro === 180) {
            criaMeteoroIntro();
        }

        desenhaDecoracoes('tras');
        desenhaDino();
        desenhaDecoracoes('frente');
        desenhaMeteoroIntro();
        desenhaTitulo();
        atualizaDecoracoes();

        if (tituloExibido && tempoTitulo > 90) {
            cenaIntro = false;
            jogoIniciado = true;
            imagemAtual = dinoCorrendoImg;
            dino.largura = 108;
            dino.altura = 54;
            dino.y = chaoY - dino.altura;
        }

        if (tituloExibido) tempoTitulo++;
        requestAnimationFrame(loop);
        return;
    }

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
            velocidadeCenario += 0.3;
            velocidadeMeteoro += 0.45;
            if (intervaloBaseMeteoro > intervaloMinimoMeteoro) intervaloBaseMeteoro -= 5;
        }
        requestAnimationFrame(loop);
    }
}

tempoProximoMeteoro = 60;
for (let i = 0; i < 25; i++) criaDecoracao(); // Inicializa cenário na intro
loop();
