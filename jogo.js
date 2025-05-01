const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

// Imagens
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

function desenhaDino() {
    ctx.drawImage(imagemAtual, dino.x, dino.y, dino.largura, dino.altura);
}

function desenhaTitulo() {
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
        x: -100,
        y: -100,
        largura: 40,
        altura: 40,
        velocidadeX: 6,
        velocidadeY: 8
    };
}

function desenhaMeteoroIntro() {
    if (meteoroIntro) {
        meteoroIntro.x += meteoroIntro.velocidadeX;
        meteoroIntro.y += meteoroIntro.velocidadeY;
        ctx.drawImage(meteoroImg, meteoroIntro.x, meteoroIntro.y, meteoroIntro.largura, meteoroIntro.altura);

        if (meteoroIntro.y >= chaoY - meteoroIntro.altura) {
            meteoroIntro = null;
            tituloExibido = true;
            tempoTitulo = 0;
        }
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        desenhaDino();
        desenhaMeteoroIntro();

        if (tituloExibido) {
            desenhaTitulo();
            tempoTitulo++;
            if (tempoTitulo > 90) {
                cenaIntro = false;
                jogoIniciado = true;
                imagemAtual = dinoCorrendoImg;
                dino.largura = 108;
                dino.altura = 54;
                dino.x = 100;
                dino.y = chaoY - dino.altura;
            }
        }

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
loop();
